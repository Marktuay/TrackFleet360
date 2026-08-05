package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
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
}

type MemoryStore struct {
	mu           sync.RWMutex
	users        map[int]*models.User
	vehicles     map[int]*models.Vehicle
	drivers      map[int]*models.Driver
	journeys     map[int]*models.Journey
	gpsPoints    map[int][]models.GPSPoint
	photos       map[int][]models.Photo
	nextUserID   int
	nextVehID    int
	nextDriverID int
	nextJournID  int
}

func NewMemoryStore() *MemoryStore {
	store := &MemoryStore{
		users:        make(map[int]*models.User),
		vehicles:     make(map[int]*models.Vehicle),
		drivers:      make(map[int]*models.Driver),
		journeys:     make(map[int]*models.Journey),
		gpsPoints:    make(map[int][]models.GPSPoint),
		photos:       make(map[int][]models.Photo),
		nextUserID:   1,
		nextVehID:    1,
		nextDriverID: 1,
		nextJournID:  1,
	}

	store.seedData()
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
	m.nextUserID = 8

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
	m.nextDriverID = 5

	v1 := &models.Vehicle{
		ID:          1,
		PlateNumber: "TF-101-AB",
		Brand:       "Toyota",
		Model:       "Hilux 4x4",
		Year:        2022,
		VehicleType: models.VehicleTypeAuto,
		SubsidyRate: models.RateAutoPerKM, // 10.0 C$/km
		InitialKM:   15000.0,
		CurrentKM:   18450.0,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[1] = v1

	v2 := &models.Vehicle{
		ID:          2,
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
	m.vehicles[2] = v2

	v3 := &models.Vehicle{
		ID:          3,
		PlateNumber: "TF-303-EF",
		Brand:       "Isuzu",
		Model:       "D-Max",
		Year:        2021,
		VehicleType: models.VehicleTypeAuto,
		SubsidyRate: models.RateAutoPerKM, // 10.0 C$/km
		InitialKM:   45000.0,
		CurrentKM:   62100.0,
		Status:      "maintenance",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.vehicles[3] = v3
	m.nextVehID = 4

	now := time.Now()
	startTime := now.Add(-3 * time.Hour)
	endTime := now.Add(-1 * time.Hour)

	cutoff14 := 14 // Julio 2do corte (8-22 Julio 2026)

	j1 := &models.Journey{
		ID:             1,
		DriverID:       1,
		Driver:         driver1,
		VehicleID:      1,
		Vehicle:        v1,
		CutoffID:       &cutoff14,
		StartTime:      startTime,
		EndTime:        &endTime,
		StartLat:       9.9333,
		StartLng:       -84.0833,
		StartAddress:   "San José Centro, Bodega Principal",
		EndLat:         10.0167,
		EndLng:         -84.2167,
		EndAddress:     "Alajuela Centro, Sucursal Norte",
		StartKM:        18400.0,
		EndKM:          18450.0,
		DeclaredDistKM: 50.0,
		GPSDistKM:      22.5,
		DiffKM:         27.5,
		SubsidyRate:    10.0,  // 10 C$/km for Auto
		SubsidyAmount:  500.0, // 50 KM * 10 C$ = 500 C$
		Status:         models.StatusFlagged,
		CreatedAt:      startTime,
		UpdatedAt:      endTime,
	}
	m.journeys[1] = j1

	startTime2 := now.Add(-6 * time.Hour)
	endTime2 := now.Add(-4 * time.Hour)
	j2 := &models.Journey{
		ID:             2,
		DriverID:       2,
		Driver:         driver2,
		VehicleID:      2,
		Vehicle:        v2,
		CutoffID:       &cutoff14,
		StartTime:      startTime2,
		EndTime:        &endTime2,
		StartLat:       9.9300,
		StartLng:       -84.0800,
		StartAddress:   "Managua Centro",
		EndLat:         10.0000,
		EndLng:         -84.2000,
		EndAddress:     "Tipitapa Zona Industrial",
		StartKM:        8460.0,
		EndKM:          8500.0,
		DeclaredDistKM: 40.0,
		GPSDistKM:      39.2,
		DiffKM:         0.8,
		SubsidyRate:    6.0,   // 6 C$/km for Moto
		SubsidyAmount:  240.0, // 40 KM * 6 C$ = 240 C$
		Status:         models.StatusApproved,
		CreatedAt:      startTime2,
		UpdatedAt:      endTime2,
	}
	m.journeys[2] = j2
	m.nextJournID = 3

	pts := []models.GPSPoint{
		{ID: 1, JourneyID: 1, Latitude: 9.9333, Longitude: -84.0833, Speed: 0, RecordedAt: startTime},
		{ID: 2, JourneyID: 1, Latitude: 9.9500, Longitude: -84.1100, Speed: 45, RecordedAt: startTime.Add(15 * time.Minute)},
		{ID: 3, JourneyID: 1, Latitude: 9.9800, Longitude: -84.1600, Speed: 65, RecordedAt: startTime.Add(35 * time.Minute)},
		{ID: 4, JourneyID: 1, Latitude: 10.0167, Longitude: -84.2167, Speed: 0, RecordedAt: endTime},
	}
	m.gpsPoints[1] = pts
}

func (m *MemoryStore) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, u := range m.users {
		if u.Email == email {
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
	return nil
}

func (m *MemoryStore) UpdateVehicleKM(ctx context.Context, id int, newKM float64) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if v, ok := m.vehicles[id]; ok {
		v.CurrentKM = newKM
		v.UpdatedAt = time.Now()
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

func (m *MemoryStore) AddGPSPoints(ctx context.Context, points []models.GPSPoint) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, p := range points {
		m.gpsPoints[p.JourneyID] = append(m.gpsPoints[p.JourneyID], p)
	}
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

	return nil
}

func (m *MemoryStore) AddPhoto(ctx context.Context, photo *models.Photo) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.photos[photo.JourneyID] = append(m.photos[photo.JourneyID], *photo)
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
