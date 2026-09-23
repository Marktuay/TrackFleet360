package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"os"
	"strings"
	"sync"
	"time"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"

	"trackfleet360-backend/internal/models"
	"trackfleet360-backend/internal/services"
)

type Repository interface {
	// Users & Auth
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	GetUserByID(ctx context.Context, id int) (*models.User, error)
	GetDriverByUserID(ctx context.Context, userID int) (*models.Driver, error)
	ListUsers(ctx context.Context) ([]models.User, error)
	CreateUser(ctx context.Context, user *models.User, password string, req *models.CreateUserRequest) error
	UpdateUser(ctx context.Context, id int, req *models.UpdateUserRequest) (*models.User, error)
	DeleteUser(ctx context.Context, id int) error
	ToggleUserStatus(ctx context.Context, userID int, active bool) error

	// Vehicles
	ListVehicles(ctx context.Context) ([]models.Vehicle, error)
	GetVehicleByID(ctx context.Context, id int) (*models.Vehicle, error)
	CreateVehicle(ctx context.Context, v *models.Vehicle) error
	UpdateVehicleKM(ctx context.Context, id int, newKM float64) error

	// Drivers
	ListDrivers(ctx context.Context) ([]models.Driver, error)
	CreateDriver(ctx context.Context, d *models.Driver) error

	// Journeys
	CreateJourney(ctx context.Context, j *models.Journey) error
	GetJourneyByID(ctx context.Context, id int) (*models.Journey, error)
	GetActiveJourneyByDriver(ctx context.Context, driverID int) (*models.Journey, error)
	ListJourneys(ctx context.Context, driverID int, vehicleID int, status string, cutoffID int) ([]models.Journey, error)
	AddGPSPoints(ctx context.Context, points []models.GPSPoint) error
	FinishJourney(ctx context.Context, j *models.Journey) error
	ValidateJourney(ctx context.Context, id int, status string, notes string, validatorID int) error
	AddPhoto(ctx context.Context, photo *models.Photo) error

	// Reports & Cutoffs
	GetReportSummary(ctx context.Context, cutoffID int) (*models.ReportSummary, error)
	ListCutoffPeriods(ctx context.Context) ([]models.CutoffPeriod, error)

	// Geofences
	ListGeofences(ctx context.Context) ([]models.Geofence, error)
	CreateGeofence(ctx context.Context, g *models.Geofence) error

	// Device Activation
	GenerateActivationCode(ctx context.Context, userID int) (*models.DeviceActivationCode, error)
	ValidateActivationCode(ctx context.Context, code string) (*models.DeviceActivationCode, error)
}

type MemoryStore struct {
	mu              sync.RWMutex
	users           map[int]*models.User
	vehicles        map[int]*models.Vehicle
	drivers         map[int]*models.Driver
	journeys        map[int]*models.Journey
	gpsPoints       map[int][]models.GPSPoint
	photos          map[int][]models.Photo
	geofences       map[int]*models.Geofence
	activationCodes map[string]*models.DeviceActivationCode
	nextUserID      int
	nextVehID       int
	nextDriverID    int
	nextJournID     int
	nextGeofenceID  int
}

type StoreState struct {
	Users           map[int]*models.User                    `json:"users"`
	Vehicles        map[int]*models.Vehicle                 `json:"vehicles"`
	Drivers         map[int]*models.Driver                  `json:"drivers"`
	Journeys        map[int]*models.Journey                 `json:"journeys"`
	GPSPoints       map[int][]models.GPSPoint               `json:"gps_points"`
	Photos          map[int][]models.Photo                  `json:"photos"`
	Geofences       map[int]*models.Geofence                `json:"geofences"`
	ActivationCodes map[string]*models.DeviceActivationCode `json:"activation_codes"`
	NextUserID      int                                     `json:"next_user_id"`
	NextVehID       int                                     `json:"next_veh_id"`
	NextDriverID    int                                     `json:"next_driver_id"`
	NextJournID     int                                     `json:"next_journ_id"`
	NextGeofenceID  int                                     `json:"next_geofence_id"`
}

func (m *MemoryStore) saveToFileLocked() {
	state := StoreState{
		Users:           m.users,
		Vehicles:        m.vehicles,
		Drivers:         m.drivers,
		Journeys:        m.journeys,
		GPSPoints:       m.gpsPoints,
		Photos:          m.photos,
		Geofences:       m.geofences,
		ActivationCodes: m.activationCodes,
		NextUserID:      m.nextUserID,
		NextVehID:       m.nextVehID,
		NextDriverID:    m.nextDriverID,
		NextJournID:     m.nextJournID,
		NextGeofenceID:  m.nextGeofenceID,
	}

	_ = os.MkdirAll("data", 0755)
	data, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		log.Printf("[ERROR] Error serializando estado de tienda: %v", err)
		return
	}

	tmpFile := "data/store_state.json.tmp"
	if err := os.WriteFile(tmpFile, data, 0644); err != nil {
		log.Printf("[ERROR] Error escribiendo archivo temporal de tienda: %v", err)
		return
	}
	_ = os.Rename(tmpFile, "data/store_state.json")
}

func (m *MemoryStore) loadFromFile() bool {
	data, err := os.ReadFile("data/store_state.json")
	if err != nil {
		return false
	}

	var state StoreState
	if err := json.Unmarshal(data, &state); err != nil {
		log.Printf("[ERROR] Error deserializando estado de tienda: %v", err)
		return false
	}

	if state.Users != nil && len(state.Users) > 0 {
		m.users = state.Users
	}
	if state.Vehicles != nil && len(state.Vehicles) > 0 {
		m.vehicles = state.Vehicles
	}
	if state.Drivers != nil && len(state.Drivers) > 0 {
		m.drivers = state.Drivers
	}
	if state.Journeys != nil && len(state.Journeys) > 0 {
		m.journeys = state.Journeys
	}
	if state.GPSPoints != nil && len(state.GPSPoints) > 0 {
		m.gpsPoints = state.GPSPoints
	}
	if state.Photos != nil && len(state.Photos) > 0 {
		m.photos = state.Photos
	}
	if state.Geofences != nil && len(state.Geofences) > 0 {
		m.geofences = state.Geofences
	}
	if state.ActivationCodes != nil {
		m.activationCodes = state.ActivationCodes
	}
	if state.NextUserID > 0 {
		m.nextUserID = state.NextUserID
	}
	if state.NextVehID > 0 {
		m.nextVehID = state.NextVehID
	}
	if state.NextDriverID > 0 {
		m.nextDriverID = state.NextDriverID
	}
	if state.NextJournID > 0 {
		m.nextJournID = state.NextJournID
	}
	if state.NextGeofenceID > 0 {
		m.nextGeofenceID = state.NextGeofenceID
	}

	log.Printf("[STORE] Estado restaurado desde data/store_state.json (%d usuarios, %d recorridos, %d geocercas)", len(m.users), len(m.journeys), len(m.geofences))
	return true
}

func NewMemoryStore() *MemoryStore {
	store := &MemoryStore{
		users:           make(map[int]*models.User),
		vehicles:        make(map[int]*models.Vehicle),
		drivers:         make(map[int]*models.Driver),
		journeys:        make(map[int]*models.Journey),
		gpsPoints:       make(map[int][]models.GPSPoint),
		photos:          make(map[int][]models.Photo),
		geofences:       make(map[int]*models.Geofence),
		activationCodes: make(map[string]*models.DeviceActivationCode),
		nextUserID:      1,
		nextVehID:       1,
		nextDriverID:    1,
		nextJournID:     1,
		nextGeofenceID:  1,
	}

	store.seedData()
	if store.loadFromFile() {
		log.Println("[STORE] Base de datos persistente restaurada exitosamente desde disco.")
	} else {
		log.Println("[STORE] Inicializando archivo de base de datos persistente...")
		store.saveToFileLocked()
	}
	return store
}

func hashPassword(pwd string) string {
	bytes, _ := bcrypt.GenerateFromPassword([]byte(pwd), bcrypt.DefaultCost)
	return string(bytes)
}

func (m *MemoryStore) seedData() {
	adminUser := &models.User{
		ID:           1,
		Email:        "admin@trackfleet360.com",
		PasswordHash: hashPassword("admin123"),
		FullName:     "Carlos Administrator",
		Role:         models.RoleAdmin,
		Active:       true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	m.users[1] = adminUser

	infAdminUser := &models.User{
		ID:           7,
		Email:        "informatica@newcenturyni.com",
		PasswordHash: hashPassword("admin123"),
		FullName:     "Informática Administrator",
		Role:         models.RoleAdmin,
		Active:       true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	m.users[7] = infAdminUser

	ncAdminUser := &models.User{
		ID:           8,
		Email:        "admin@newcenturyni.com",
		PasswordHash: hashPassword("admin123"),
		FullName:     "Newcentury Administrator",
		Role:         models.RoleAdmin,
		Active:       true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	m.users[8] = ncAdminUser

	supervisorUser := &models.User{
		ID:           2,
		Email:        "supervisor@trackfleet360.com",
		PasswordHash: hashPassword("super123"),
		FullName:     "Maria Supervisor",
		Role:         models.RoleSupervisor,
		Active:       true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	m.users[2] = supervisorUser

	driverUser1 := &models.User{
		ID:           3,
		Email:        "conductor1@trackfleet360.com",
		PasswordHash: hashPassword("driver123"),
		FullName:     "Juan Pérez (Conductor)",
		Role:         models.RoleDriver,
		Active:       true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	m.users[3] = driverUser1

	driverUser2 := &models.User{
		ID:           4,
		Email:        "conductor2@trackfleet360.com",
		PasswordHash: hashPassword("driver123"),
		FullName:     "Roberto Gómez",
		Role:         models.RoleDriver,
		Active:       true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	m.users[4] = driverUser2

	auditorUser := &models.User{
		ID:           5,
		Email:        "auditor-general@newcenturyni.com",
		PasswordHash: hashPassword("driver123"),
		FullName:     "Auditor General",
		Role:         models.RoleDriver,
		Active:       true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	m.users[5] = auditorUser

	jorgeUser := &models.User{
		ID:           6,
		Email:        "jorge.mayorga@newcenturyni.com",
		PasswordHash: hashPassword("driver123"),
		FullName:     "Jorge Mayorga",
		Role:         models.RoleDriver,
		Active:       true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	m.users[6] = jorgeUser

	testUser := &models.User{
		ID:           9,
		Email:        "test@newcenturyni.com",
		PasswordHash: hashPassword("test123"),
		FullName:     "Usuario Test Admin",
		Role:         models.RoleAdmin,
		Active:       true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	m.users[9] = testUser

	testDriverUser := &models.User{
		ID:           10,
		Email:        "test.driver@newcenturyni.com",
		PasswordHash: hashPassword("test123"),
		FullName:     "Conductor Test Operativo",
		Role:         models.RoleDriver,
		Active:       true,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	m.users[10] = testDriverUser

	m.nextUserID = 11

	driver1 := &models.Driver{
		ID:             1,
		UserID:         3,
		User:           driverUser1,
		LicenseNumber:  "LIC-884920",
		Phone:          "+506 8888-1111",
		Company:        "Newcentury NI",
		Position:       "Conductor Operativo",
		VehicleType:    "auto",
		VehicleSubtype: "Hilux 4x4",
		FuelType:       "gasolina",
		PlateNumber:    "TF-101-AB",
		Status:         "active",
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	m.drivers[1] = driver1

	driver2 := &models.Driver{
		ID:             2,
		UserID:         4,
		User:           driverUser2,
		LicenseNumber:  "LIC-993021",
		Phone:          "+506 8888-2222",
		Company:        "TrackFleet360",
		Position:       "Conductor Reparto",
		VehicleType:    "auto",
		VehicleSubtype: "D-Max",
		FuelType:       "diesel",
		PlateNumber:    "TF-303-EF",
		Status:         "active",
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	m.drivers[2] = driver2

	driver3 := &models.Driver{
		ID:             3,
		UserID:         5,
		User:           auditorUser,
		LicenseNumber:  "LIC-772019",
		Phone:          "+505 8888-9999",
		Company:        "Newcentury NI",
		Position:       "Auditor General",
		VehicleType:    "auto",
		VehicleSubtype: "suv",
		FuelType:       "gasolina",
		PlateNumber:    "M-10920",
		Status:         "active",
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	m.drivers[3] = driver3

	driver4 := &models.Driver{
		ID:             4,
		UserID:         6,
		User:           jorgeUser,
		LicenseNumber:  "LIC-882011",
		Phone:          "+505 8888-7777",
		Company:        "Newcentury NI",
		Position:       "Conductor Operativo",
		VehicleType:    "moto",
		VehicleSubtype: "Yamaha FZ-25",
		FuelType:       "gasolina",
		PlateNumber:    "MOTO-808-NI",
		Status:         "active",
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	m.drivers[4] = driver4

	driverTest := &models.Driver{
		ID:             5,
		UserID:         10,
		User:           testDriverUser,
		LicenseNumber:  "LIC-TEST-2026",
		Phone:          "+505 8888-0000",
		Company:        "Newcentury NI Test",
		Position:       "Conductor Test",
		VehicleType:    "auto",
		VehicleSubtype: "Toyota Hilux 4x4 Test",
		FuelType:       "diesel",
		PlateNumber:    "M-289-401",
		Status:         "active",
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	m.drivers[5] = driverTest
	m.nextDriverID = 6

	v1 := &models.Vehicle{
		ID:          1,
		PlateNumber: "02-28947-E",
		Brand:       "AKT",
		Model:       "Hunter (BLOKON)",
		Year:        2023,
		VehicleType: models.VehicleTypeMoto,
		SubsidyRate: models.RateMotoPerKM, // 6.0 C$/km
		InitialKM:   0.0,
		CurrentKM:   0.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[1] = v1

	v2 := &models.Vehicle{
		ID:          2,
		PlateNumber: "M 010311",
		Brand:       "Toyota",
		Model:       "Carro (BLOKON)",
		Year:        2022,
		VehicleType: models.VehicleTypeAuto,
		SubsidyRate: models.RateAutoPerKM, // 10.0 C$/km
		InitialKM:   15000.0,
		CurrentKM:   18450.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[2] = v2

	v3 := &models.Vehicle{
		ID:          3,
		PlateNumber: "M 466 963",
		Brand:       "Hyundai",
		Model:       "Sedán (CONASER)",
		Year:        2023,
		VehicleType: models.VehicleTypeAuto,
		SubsidyRate: models.RateAutoPerKM, // 10.0 C$/km
		InitialKM:   25000.0,
		CurrentKM:   25000.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[3] = v3

	v4 := &models.Vehicle{
		ID:          4,
		PlateNumber: "M 352 570",
		Brand:       "Genesis",
		Model:       "Moto (CONASER)",
		Year:        2023,
		VehicleType: models.VehicleTypeMoto,
		SubsidyRate: models.RateMotoPerKM, // 6.0 C$/km
		InitialKM:   0.0,
		CurrentKM:   0.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[4] = v4

	v5 := &models.Vehicle{
		ID:          5,
		PlateNumber: "M 325287",
		Brand:       "Mazda",
		Model:       "Camioneta (CONASER)",
		Year:        2022,
		VehicleType: models.VehicleTypeAuto,
		SubsidyRate: models.RateAutoPerKM, // 10.0 C$/km
		InitialKM:   30000.0,
		CurrentKM:   30000.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[5] = v5

	v6 := &models.Vehicle{
		ID:          6,
		PlateNumber: "244597",
		Brand:       "Pulsar",
		Model:       "Motocicleta (CONASER)",
		Year:        2023,
		VehicleType: models.VehicleTypeMoto,
		SubsidyRate: models.RateMotoPerKM, // 6.0 C$/km
		InitialKM:   0.0,
		CurrentKM:   0.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[6] = v6

	v7 := &models.Vehicle{
		ID:          7,
		PlateNumber: "M 193 433",
		Brand:       "Genesis",
		Model:       "Moto (CONASER)",
		Year:        2023,
		VehicleType: models.VehicleTypeMoto,
		SubsidyRate: models.RateMotoPerKM, // 6.0 C$/km
		InitialKM:   0.0,
		CurrentKM:   0.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[7] = v7

	v8 := &models.Vehicle{
		ID:          8,
		PlateNumber: "M 161 143",
		Brand:       "AKT 150",
		Model:       "Moto (CONASER)",
		Year:        2023,
		VehicleType: models.VehicleTypeMoto,
		SubsidyRate: models.RateMotoPerKM, // 6.0 C$/km
		InitialKM:   0.0,
		CurrentKM:   0.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[8] = v8

	v9 := &models.Vehicle{
		ID:          9,
		PlateNumber: "M 329907",
		Brand:       "Genesis",
		Model:       "Moto (SECURITY)",
		Year:        2023,
		VehicleType: models.VehicleTypeMoto,
		SubsidyRate: models.RateMotoPerKM, // 6.0 C$/km
		InitialKM:   0.0,
		CurrentKM:   0.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[9] = v9

	v10 := &models.Vehicle{
		ID:          10,
		PlateNumber: "M-160829",
		Brand:       "AKT",
		Model:       "Moto (SECURITY)",
		Year:        2023,
		VehicleType: models.VehicleTypeMoto,
		SubsidyRate: models.RateMotoPerKM, // 6.0 C$/km
		InitialKM:   0.0,
		CurrentKM:   0.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[10] = v10

	v11 := &models.Vehicle{
		ID:          11,
		PlateNumber: "M35036",
		Brand:       "Kia",
		Model:       "Rio Sedán (SECURITY)",
		Year:        2022,
		VehicleType: models.VehicleTypeAuto,
		SubsidyRate: models.RateAutoPerKM, // 10.0 C$/km
		InitialKM:   20000.0,
		CurrentKM:   20000.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[11] = v11

	v12 := &models.Vehicle{
		ID:          12,
		PlateNumber: "M 160 461",
		Brand:       "Sky Go",
		Model:       "Motocicleta (SECURITY)",
		Year:        2023,
		VehicleType: models.VehicleTypeMoto,
		SubsidyRate: models.RateMotoPerKM, // 6.0 C$/km
		InitialKM:   0.0,
		CurrentKM:   0.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[12] = v12

	v13 := &models.Vehicle{
		ID:          13,
		PlateNumber: "M 16047",
		Brand:       "Dayun",
		Model:       "Moto (SECURITY)",
		Year:        2023,
		VehicleType: models.VehicleTypeMoto,
		SubsidyRate: models.RateMotoPerKM, // 6.0 C$/km
		InitialKM:   0.0,
		CurrentKM:   0.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[13] = v13

	v14 := &models.Vehicle{
		ID:          14,
		PlateNumber: "M 384-625",
		Brand:       "KA Genesis",
		Model:       "Motocicleta (SECURITY)",
		Year:        2023,
		VehicleType: models.VehicleTypeMoto,
		SubsidyRate: models.RateMotoPerKM, // 6.0 C$/km
		InitialKM:   0.0,
		CurrentKM:   0.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[14] = v14

	v15 := &models.Vehicle{
		ID:          15,
		PlateNumber: "M-325551",
		Brand:       "Boxer",
		Model:       "Moto (SECURITY)",
		Year:        2023,
		VehicleType: models.VehicleTypeMoto,
		SubsidyRate: models.RateMotoPerKM, // 6.0 C$/km
		InitialKM:   0.0,
		CurrentKM:   0.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[15] = v15

	v16 := &models.Vehicle{
		ID:          16,
		PlateNumber: "MOTO-808-NI",
		Brand:       "Yamaha",
		Model:       "FZ-25 250cc",
		Year:        2023,
		VehicleType: models.VehicleTypeMoto,
		SubsidyRate: models.RateMotoPerKM, // 6.0 C$/km
		InitialKM:   0.0,
		CurrentKM:   0.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[16] = v16
	m.nextVehID = 17

	// Seed Geofences in Nicaragua
	g1 := &models.Geofence{
		ID:           1,
		Name:         "Zona Franca Las Mercedes (Managua)",
		Type:         "authorized",
		Latitude:     12.1465,
		Longitude:    -86.1754,
		RadiusMeters: 1500,
		CreatedAt:    time.Now(),
	}
	m.geofences[1] = g1

	g2 := &models.Geofence{
		ID:           2,
		Name:         "Zona Restringida Almacén Central",
		Type:         "restricted",
		Latitude:     12.1200,
		Longitude:    -86.2300,
		RadiusMeters: 500,
		CreatedAt:    time.Now(),
	}
	m.geofences[2] = g2
	m.nextGeofenceID = 3

	// Journeys start clean (0 initial sample journeys for live testing)
	m.nextJournID = 1
}

func (m *MemoryStore) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	cleanEmail := strings.TrimSpace(email)
	for _, u := range m.users {
		if strings.EqualFold(strings.TrimSpace(u.Email), cleanEmail) {
			return u, nil
		}
	}
	return nil, errors.New("usuario no encontrado")
}

func (m *MemoryStore) GetUserByID(ctx context.Context, id int) (*models.User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if u, ok := m.users[id]; ok {
		return u, nil
	}
	return nil, errors.New("usuario no encontrado")
}

func (m *MemoryStore) GetDriverByUserID(ctx context.Context, userID int) (*models.Driver, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, d := range m.drivers {
		if d.UserID == userID {
			return d, nil
		}
	}
	return nil, errors.New("conductor no encontrado")
}

func (m *MemoryStore) ListUsers(ctx context.Context) ([]models.User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	list := make([]models.User, 0, len(m.users))
	for _, u := range m.users {
		list = append(list, *u)
	}
	return list, nil
}

func (m *MemoryStore) CreateUser(ctx context.Context, u *models.User, password string, req *models.CreateUserRequest) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, existing := range m.users {
		if existing.Email == u.Email {
			return errors.New("ya existe un usuario con este correo electrónico")
		}
	}

	u.ID = m.nextUserID
	m.nextUserID++
	u.PasswordHash = hashPassword(password)
	u.Active = true
	u.CreatedAt = time.Now()
	u.UpdatedAt = time.Now()

	m.users[u.ID] = u

	if u.Role == models.RoleDriver {
		lic := req.LicenseNumber
		if lic == "" {
			lic = fmt.Sprintf("LIC-%d", time.Now().Unix()%1000000)
		}
		driver := &models.Driver{
			ID:             m.nextDriverID,
			UserID:         u.ID,
			User:           u,
			LicenseNumber:  lic,
			Phone:          req.Phone,
			Company:        req.Company,
			Position:       req.Position,
			VehicleType:    req.VehicleType,
			VehicleSubtype: req.VehicleSubtype,
			FuelType:       req.FuelType,
			PlateNumber:    req.PlateNumber,
			Status:         "active",
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		}
		m.drivers[m.nextDriverID] = driver
		m.nextDriverID++
	}

	m.saveToFileLocked()
	return nil
}

func (m *MemoryStore) UpdateUser(ctx context.Context, id int, req *models.UpdateUserRequest) (*models.User, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	u, ok := m.users[id]
	if !ok {
		return nil, errors.New("usuario no encontrado")
	}

	if req.FullName != "" {
		u.FullName = req.FullName
	}

	if req.Email != "" && req.Email != u.Email {
		for _, existing := range m.users {
			if existing.ID != id && existing.Email == req.Email {
				return nil, errors.New("ya existe un usuario registrado con este correo electrónico")
			}
		}
		u.Email = req.Email
	}

	if req.Role != "" {
		u.Role = req.Role
	}

	if req.Password != "" {
		u.PasswordHash = hashPassword(req.Password)
	}

	u.UpdatedAt = time.Now()

	if u.Role == models.RoleDriver {
		hasDriver := false
		for _, d := range m.drivers {
			if d.UserID == u.ID {
				hasDriver = true
				if req.LicenseNumber != "" {
					d.LicenseNumber = req.LicenseNumber
				}
				if req.Phone != "" {
					d.Phone = req.Phone
				}
				if req.Company != "" {
					d.Company = req.Company
				}
				if req.Position != "" {
					d.Position = req.Position
				}
				if req.VehicleType != "" {
					d.VehicleType = req.VehicleType
				}
				if req.VehicleSubtype != "" {
					d.VehicleSubtype = req.VehicleSubtype
				}
				if req.FuelType != "" {
					d.FuelType = req.FuelType
				}
				if req.PlateNumber != "" {
					d.PlateNumber = req.PlateNumber
				}
				d.UpdatedAt = time.Now()
				break
			}
		}
		if !hasDriver {
			lic := req.LicenseNumber
			if lic == "" {
				lic = fmt.Sprintf("LIC-%d", time.Now().Unix()%1000000)
			}
			driver := &models.Driver{
				ID:             m.nextDriverID,
				UserID:         u.ID,
				User:           u,
				LicenseNumber:  lic,
				Phone:          req.Phone,
				Company:        req.Company,
				Position:       req.Position,
				VehicleType:    req.VehicleType,
				VehicleSubtype: req.VehicleSubtype,
				FuelType:       req.FuelType,
				Status:         "active",
				CreatedAt:      time.Now(),
				UpdatedAt:      time.Now(),
			}
			m.drivers[m.nextDriverID] = driver
			m.nextDriverID++
		}
	}

	m.saveToFileLocked()
	return u, nil
}

func (m *MemoryStore) DeleteUser(ctx context.Context, id int) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, ok := m.users[id]; !ok {
		return errors.New("usuario no encontrado")
	}

	delete(m.users, id)

	for dID, d := range m.drivers {
		if d.UserID == id {
			delete(m.drivers, dID)
			break
		}
	}

	m.saveToFileLocked()
	return nil
}

func (m *MemoryStore) ToggleUserStatus(ctx context.Context, userID int, active bool) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	u, ok := m.users[userID]
	if !ok {
		return errors.New("usuario no encontrado")
	}

	u.Active = active
	u.UpdatedAt = time.Now()
	m.saveToFileLocked()
	return nil
}

func (m *MemoryStore) ListVehicles(ctx context.Context) ([]models.Vehicle, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	list := make([]models.Vehicle, 0, len(m.vehicles))
	for _, v := range m.vehicles {
		list = append(list, *v)
	}
	return list, nil
}

func (m *MemoryStore) GetVehicleByID(ctx context.Context, id int) (*models.Vehicle, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if v, ok := m.vehicles[id]; ok {
		return v, nil
	}
	return nil, errors.New("vehículo no encontrado")
}

func (m *MemoryStore) CreateVehicle(ctx context.Context, v *models.Vehicle) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	v.ID = m.nextVehID
	m.nextVehID++
	if v.VehicleType == models.VehicleTypeMoto {
		v.SubsidyRate = models.RateMotoPerKM
	} else {
		v.VehicleType = models.VehicleTypeAuto
		v.SubsidyRate = models.RateAutoPerKM
	}

	v.CreatedAt = time.Now()
	v.UpdatedAt = time.Now()

	m.vehicles[v.ID] = v
	m.saveToFileLocked()
	return nil
}

func (m *MemoryStore) UpdateVehicleKM(ctx context.Context, id int, newKM float64) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if v, ok := m.vehicles[id]; ok {
		v.CurrentKM = newKM
		v.UpdatedAt = time.Now()
		m.saveToFileLocked()
		return nil
	}
	return errors.New("vehículo no encontrado")
}

func (m *MemoryStore) ListDrivers(ctx context.Context) ([]models.Driver, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	list := make([]models.Driver, 0, len(m.drivers))
	for _, d := range m.drivers {
		list = append(list, *d)
	}
	return list, nil
}

func (m *MemoryStore) CreateDriver(ctx context.Context, d *models.Driver) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	d.ID = m.nextDriverID
	m.nextDriverID++
	d.CreatedAt = time.Now()
	d.UpdatedAt = time.Now()

	m.drivers[d.ID] = d
	m.saveToFileLocked()
	return nil
}

func (m *MemoryStore) ListCutoffPeriods(ctx context.Context) ([]models.CutoffPeriod, error) {
	return services.Get2026CutoffPeriods(), nil
}

func (m *MemoryStore) CreateJourney(ctx context.Context, j *models.Journey) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	j.ID = m.nextJournID
	m.nextJournID++
	j.Status = models.StatusInProgress
	j.StartTime = time.Now()
	j.CreatedAt = time.Now()
	j.UpdatedAt = time.Now()

	if d, ok := m.drivers[j.DriverID]; ok {
		j.Driver = d
	}
	if v, ok := m.vehicles[j.VehicleID]; ok {
		j.Vehicle = v
		if v.VehicleType == models.VehicleTypeMoto {
			j.SubsidyRate = models.RateMotoPerKM
		} else {
			j.SubsidyRate = models.RateAutoPerKM
		}
	} else {
		j.SubsidyRate = models.RateAutoPerKM
	}

	m.journeys[j.ID] = j
	m.saveToFileLocked()
	return nil
}

func (m *MemoryStore) GetJourneyByID(ctx context.Context, id int) (*models.Journey, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	j, ok := m.journeys[id]
	if !ok {
		return nil, errors.New("recorrido no encontrado")
	}

	cp := *j
	if pts, hasPts := m.gpsPoints[id]; hasPts {
		cp.Points = pts
	}
	if phs, hasPhs := m.photos[id]; hasPhs {
		cp.Photos = phs
	}

	return &cp, nil
}

func (m *MemoryStore) GetActiveJourneyByDriver(ctx context.Context, driverID int) (*models.Journey, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, j := range m.journeys {
		if j.DriverID == driverID && j.Status == models.StatusInProgress {
			return j, nil
		}
	}
	return nil, errors.New("sin recorrido activo")
}

func (m *MemoryStore) ListJourneys(ctx context.Context, driverID int, vehicleID int, status string, cutoffID int) ([]models.Journey, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var targetCutoff *models.CutoffPeriod
	if cutoffID > 0 {
		targetCutoff = services.GetCutoffPeriodByID(cutoffID)
	}

	list := make([]models.Journey, 0)
	for _, j := range m.journeys {
		if driverID > 0 && j.DriverID != driverID {
			continue
		}
		if vehicleID > 0 && j.VehicleID != vehicleID {
			continue
		}
		if status != "" && j.Status != status {
			continue
		}
		if targetCutoff != nil {
			if j.StartTime.Before(targetCutoff.StartDate) || j.StartTime.After(targetCutoff.CutoffDate) {
				continue
			}
		}

		cp := *j
		if pts, ok := m.gpsPoints[j.ID]; ok {
			cp.Points = pts
		}
		list = append(list, cp)
	}

	return list, nil
}

func calculateHaversineMeters(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371000.0 // Earth radius in meters
	dLat := (lat2 - lat1) * math.Pi / 180.0
	dLon := (lon2 - lon1) * math.Pi / 180.0
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180.0)*math.Cos(lat2*math.Pi/180.0)*
			math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}

func (m *MemoryStore) ListGeofences(ctx context.Context) ([]models.Geofence, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	list := make([]models.Geofence, 0, len(m.geofences))
	for _, g := range m.geofences {
		list = append(list, *g)
	}
	return list, nil
}

func (m *MemoryStore) CreateGeofence(ctx context.Context, g *models.Geofence) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	g.ID = m.nextGeofenceID
	m.nextGeofenceID++
	g.CreatedAt = time.Now()

	m.geofences[g.ID] = g
	m.saveToFileLocked()
	return nil
}

func (m *MemoryStore) AddGPSPoints(ctx context.Context, points []models.GPSPoint) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, p := range points {
		m.gpsPoints[p.JourneyID] = append(m.gpsPoints[p.JourneyID], p)

		// 1. Speeding Event Detection (> 90.0 km/h)
		if p.Speed > 90.0 {
			if j, ok := m.journeys[p.JourneyID]; ok {
				j.Status = models.StatusFlagged
				if j.SupervisorNotes == "" {
					j.SupervisorNotes = fmt.Sprintf("⚠️ Alerta Traccar: Exceso de velocidad (%.1f km/h)", p.Speed)
				}
			}
		}

		// 2. Geofence Breach Event Detection
		for _, g := range m.geofences {
			distM := calculateHaversineMeters(p.Latitude, p.Longitude, g.Latitude, g.Longitude)
			if g.Type == "restricted" && distM <= g.RadiusMeters {
				if j, ok := m.journeys[p.JourneyID]; ok {
					j.Status = models.StatusFlagged
					j.SupervisorNotes = fmt.Sprintf("⛔ Alerta Traccar: Ingreso a Zona Restringida (%s)", g.Name)
				}
			}
		}
	}
	m.saveToFileLocked()
	return nil
}

func (m *MemoryStore) FinishJourney(ctx context.Context, j *models.Journey) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	existing, ok := m.journeys[j.ID]
	if !ok {
		return errors.New("recorrido no encontrado")
	}

	now := time.Now()
	existing.EndTime = &now
	existing.EndLat = j.EndLat
	existing.EndLng = j.EndLng
	existing.EndAddress = j.EndAddress
	existing.EndKM = j.EndKM
	existing.DeclaredDistKM = j.DeclaredDistKM
	existing.GPSDistKM = j.GPSDistKM
	existing.DiffKM = j.DiffKM

	rate := models.RateAutoPerKM
	if existing.Vehicle != nil && existing.Vehicle.VehicleType == models.VehicleTypeMoto {
		rate = models.RateMotoPerKM
	}
	existing.SubsidyRate = rate
	existing.SubsidyAmount = j.DeclaredDistKM * rate

	existing.Status = j.Status
	existing.UpdatedAt = now

	if v, ok := m.vehicles[existing.VehicleID]; ok {
		if j.EndKM > v.CurrentKM {
			v.CurrentKM = j.EndKM
		}
	}

	m.saveToFileLocked()
	return nil
}

func (m *MemoryStore) ValidateJourney(ctx context.Context, id int, status string, notes string, validatorID int) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	j, ok := m.journeys[id]
	if !ok {
		return errors.New("recorrido no encontrado")
	}

	now := time.Now()
	j.Status = status
	j.SupervisorNotes = notes
	j.ValidatedAt = &now
	j.ValidatedBy = &validatorID
	j.UpdatedAt = now

	m.saveToFileLocked()
	return nil
}

func (m *MemoryStore) AddPhoto(ctx context.Context, photo *models.Photo) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.photos[photo.JourneyID] = append(m.photos[photo.JourneyID], *photo)
	m.saveToFileLocked()
	return nil
}

func (m *MemoryStore) GetReportSummary(ctx context.Context, cutoffID int) (*models.ReportSummary, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	summary := &models.ReportSummary{
		TotalVehicles: len(m.vehicles),
		TotalDrivers:  len(m.drivers),
	}

	if cutoffID > 0 {
		cutoff := services.GetCutoffPeriodByID(cutoffID)
		summary.CutoffID = &cutoffID
		summary.CutoffPeriod = cutoff
	}

	for _, v := range m.vehicles {
		if v.Status == "active" {
			summary.ActiveVehicles++
		}
	}

	for _, d := range m.drivers {
		if d.Status == "active" {
			summary.ActiveDrivers++
		}
	}

	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	driverMap := make(map[int]*models.DriverSubsidySummary)

	for _, d := range m.drivers {
		name := "Conductor #" + fmt.Sprint(d.ID)
		if d.User != nil && d.User.FullName != "" {
			name = d.User.FullName
		}
		driverMap[d.ID] = &models.DriverSubsidySummary{
			DriverID:   d.ID,
			DriverName: name,
			LicenseNo:  d.LicenseNumber,
		}
	}

	var targetCutoff *models.CutoffPeriod
	if cutoffID > 0 {
		targetCutoff = services.GetCutoffPeriodByID(cutoffID)
	}

	for _, j := range m.journeys {
		if targetCutoff != nil {
			if j.StartTime.Before(targetCutoff.StartDate) || j.StartTime.After(targetCutoff.CutoffDate) {
				continue
			}
		}

		if j.StartTime.After(today) {
			summary.JourneysToday++
			summary.TotalKMToday += j.DeclaredDistKM
		}
		if j.Status == models.StatusFlagged {
			summary.FlaggedJourneys++
		}

		isMoto := false
		if j.Vehicle != nil && j.Vehicle.VehicleType == models.VehicleTypeMoto {
			isMoto = true
		}

		dist := j.DeclaredDistKM
		rate := models.RateAutoPerKM
		if isMoto {
			rate = models.RateMotoPerKM
			summary.MotoKMTotal += dist
		} else {
			summary.AutoKMTotal += dist
		}

		payout := dist * rate
		summary.TotalSubsidyPayout += payout

		if ds, exists := driverMap[j.DriverID]; exists {
			if isMoto {
				ds.MotoKM += dist
			} else {
				ds.AutoKM += dist
			}
			ds.TotalKM += dist
			ds.TotalSubsidy += payout
		}
	}

	driverList := make([]models.DriverSubsidySummary, 0, len(driverMap))
	for _, ds := range driverMap {
		driverList = append(driverList, *ds)
	}
	summary.DriversBreakdown = driverList

	return summary, nil
}

func (m *MemoryStore) GenerateActivationCode(ctx context.Context, userID int) (*models.DeviceActivationCode, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	user, ok := m.users[userID]
	if !ok {
		return nil, errors.New("usuario no encontrado")
	}

	driverID := 0
	for _, d := range m.drivers {
		if d.UserID == userID {
			driverID = d.ID
			break
		}
	}

	// Generate random 6-digit code
	rawVal := time.Now().UnixNano()%900000 + 100000
	if rawVal < 0 {
		rawVal = -rawVal
	}
	code := fmt.Sprintf("%06d", rawVal%1000000)

	if m.activationCodes == nil {
		m.activationCodes = make(map[string]*models.DeviceActivationCode)
	}

	activation := &models.DeviceActivationCode{
		Code:      code,
		UserID:    user.ID,
		DriverID:  driverID,
		Email:     user.Email,
		ExpiresAt: time.Now().Add(30 * time.Minute),
	}

	m.activationCodes[code] = activation
	m.saveToFileLocked()
	return activation, nil
}

func (m *MemoryStore) ValidateActivationCode(ctx context.Context, code string) (*models.DeviceActivationCode, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	cleanCode := strings.TrimSpace(code)
	act, ok := m.activationCodes[cleanCode]
	if !ok {
		return nil, errors.New("código de activación inválido o no encontrado")
	}

	if time.Now().After(act.ExpiresAt) {
		delete(m.activationCodes, cleanCode)
		m.saveToFileLocked()
		return nil, errors.New("el código de activación ha expirado (duración: 30 minutos)")
	}

	// Code is valid - consume it (one-time activation)
	delete(m.activationCodes, cleanCode)
	m.saveToFileLocked()
	return act, nil
}

func ConnectPostgres(connStr string) (*sql.DB, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error opening DB: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error pinging DB: %w", err)
	}

	log.Println("Successfully connected to PostgreSQL database")
	return db, nil
}
