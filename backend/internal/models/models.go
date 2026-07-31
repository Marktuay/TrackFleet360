package models

import "time"

// User Roles
const (
	RoleAdmin      = "admin"
	RoleSupervisor = "supervisor"
	RoleDriver     = "driver"
)

// Vehicle Types & Subsidy Rates (in C$ Cordobas per KM)
const (
	VehicleTypeAuto = "auto"
	VehicleTypeMoto = "moto"

	RateAutoPerKM = 10.0 // 10 C$ por KM
	RateMotoPerKM = 6.0  // 6 C$ por KM
)

// Journey Statuses
const (
	StatusInProgress = "in_progress"
	StatusCompleted  = "completed"
	StatusFlagged    = "flagged"
	StatusApproved   = "approved"
	StatusRejected   = "rejected"
)

type User struct {
	ID           int       `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	FullName     string    `json:"full_name"`
	Role         string    `json:"role"`
	Active       bool      `json:"active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Department struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type Project struct {
	ID           int       `json:"id"`
	DepartmentID int       `json:"department_id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	CreatedAt    time.Time `json:"created_at"`
}

type Vehicle struct {
	ID          int       `json:"id"`
	PlateNumber string    `json:"plate_number"`
	Brand       string    `json:"brand"`
	Model       string    `json:"model"`
	Year        int       `json:"year"`
	VehicleType string    `json:"vehicle_type"` // auto, moto
	SubsidyRate float64   `json:"subsidy_rate"` // 10.0 C$/km for auto, 6.0 C$/km for moto
	InitialKM   float64   `json:"initial_km"`
	CurrentKM   float64   `json:"current_km"`
	Status      string    `json:"status"` // active, maintenance, inactive
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Driver struct {
	ID             int       `json:"id"`
	UserID         int       `json:"user_id"`
	User           *User     `json:"user,omitempty"`
	LicenseNumber  string    `json:"license_number"`
	Phone          string    `json:"phone"`
	Company        string    `json:"company"`
	Position       string    `json:"position"`
	VehicleType    string    `json:"vehicle_type"`    // auto, moto
	VehicleSubtype string    `json:"vehicle_subtype"` // sedan, suv, camioneta, moto
	FuelType       string    `json:"fuel_type"`       // gasolina, diesel
	PlateNumber    string    `json:"plate_number"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type CutoffPeriod struct {
	ID          int       `json:"id"`
	PeriodName  string    `json:"period_name"`
	StartDate   time.Time `json:"start_date"`
	CutoffDate  time.Time `json:"cutoff_date"`
	PaymentDate time.Time `json:"payment_date"`
	Status      string    `json:"status"` // paid, in_audit, pending
}

type Journey struct {
	ID              int           `json:"id"`
	DriverID        int           `json:"driver_id"`
	Driver          *Driver       `json:"driver,omitempty"`
	VehicleID       int           `json:"vehicle_id"`
	Vehicle         *Vehicle      `json:"vehicle,omitempty"`
	ProjectID       *int          `json:"project_id,omitempty"`
	CutoffID        *int          `json:"cutoff_id,omitempty"`
	Cutoff          *CutoffPeriod `json:"cutoff,omitempty"`
	Destination     string        `json:"destination"`
	StartTime       time.Time     `json:"start_time"`
	EndTime         *time.Time    `json:"end_time,omitempty"`
	StartLat        float64       `json:"start_lat"`
	StartLng        float64       `json:"start_lng"`
	StartAddress    string        `json:"start_address"`
	EndLat          float64       `json:"end_lat"`
	EndLng          float64       `json:"end_lng"`
	EndAddress      string        `json:"end_address"`
	StartKM         float64       `json:"start_km"`
	EndKM           float64       `json:"end_km"`
	DeclaredDistKM  float64       `json:"declared_dist_km"`
	GPSDistKM       float64       `json:"gps_dist_km"`
	DiffKM          float64       `json:"diff_km"`
	SubsidyRate     float64       `json:"subsidy_rate"`   // Rate per KM applied
	SubsidyAmount   float64       `json:"subsidy_amount"` // Total C$ subsidy payout
	Status          string        `json:"status"`         // in_progress, completed, flagged, approved, rejected
	SupervisorNotes string        `json:"supervisor_notes,omitempty"`
	ValidatedAt     *time.Time    `json:"validated_at,omitempty"`
	ValidatedBy     *int          `json:"validated_by,omitempty"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
	Points          []GPSPoint    `json:"points,omitempty"`
	Photos          []Photo       `json:"photos,omitempty"`
}

type GPSPoint struct {
	ID         int64     `json:"id"`
	JourneyID  int       `json:"journey_id"`
	Latitude   float64   `json:"latitude"`
	Longitude  float64   `json:"longitude"`
	Speed      float64   `json:"speed"`
	RecordedAt time.Time `json:"recorded_at"`
}

type Photo struct {
	ID         int       `json:"id"`
	JourneyID  int       `json:"journey_id"`
	PhotoType  string    `json:"photo_type"` // start_odometer, end_odometer, evidence
	URL        string    `json:"url"`
	CapturedAt time.Time `json:"captured_at"`
}

type AuditLog struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Action    string    `json:"action"`
	Entity    string    `json:"entity"`
	EntityID  int       `json:"entity_id"`
	Payload   string    `json:"payload"`
	CreatedAt time.Time `json:"created_at"`
}

// Request / Response DTOs
type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CreateUserRequest struct {
	Email          string `json:"email" binding:"required,email"`
	Password       string `json:"password" binding:"required,min=6"`
	FullName       string `json:"full_name" binding:"required"`
	Role           string `json:"role" binding:"required"` // admin, supervisor, driver
	LicenseNumber  string `json:"license_number"`         // Required if role == driver
	Phone          string `json:"phone"`
	Company        string `json:"company"`
	Position       string `json:"position"`
	VehicleType    string `json:"vehicle_type"`
	VehicleSubtype string `json:"vehicle_subtype"`
	FuelType       string `json:"fuel_type"`
	PlateNumber    string `json:"plate_number"`
}

type UpdateUserRequest struct {
	FullName       string `json:"full_name"`
	Email          string `json:"email"`
	Password       string `json:"password,omitempty"`
	Role           string `json:"role"`
	LicenseNumber  string `json:"license_number,omitempty"`
	Phone          string `json:"phone,omitempty"`
	Company        string `json:"company,omitempty"`
	Position       string `json:"position,omitempty"`
	VehicleType    string `json:"vehicle_type,omitempty"`
	VehicleSubtype string `json:"vehicle_subtype,omitempty"`
	FuelType       string `json:"fuel_type,omitempty"`
	PlateNumber    string `json:"plate_number,omitempty"`
}

type UpdateUserStatusRequest struct {
	Active bool `json:"active"`
}

type StartJourneyRequest struct {
	VehicleID    int     `json:"vehicle_id" binding:"required"`
	ProjectID    *int    `json:"project_id"`
	Destination  string  `json:"destination"`
	StartLat     float64 `json:"start_lat" binding:"required"`
	StartLng     float64 `json:"start_lng" binding:"required"`
	StartAddress string  `json:"start_address"`
	StartKM      float64 `json:"start_km" binding:"required"`
}

type AddGPSPointsRequest struct {
	Points []GPSPointInput `json:"points" binding:"required"`
}

type GPSPointInput struct {
	Latitude   float64   `json:"latitude" binding:"required"`
	Longitude  float64   `json:"longitude" binding:"required"`
	Speed      float64   `json:"speed"`
	RecordedAt time.Time `json:"recorded_at"`
}

type FinishJourneyRequest struct {
	EndLat     float64 `json:"end_lat" binding:"required"`
	EndLng     float64 `json:"end_lng" binding:"required"`
	EndAddress string  `json:"end_address"`
	EndKM      float64 `json:"end_km" binding:"required"`
	PhotoURL   string  `json:"photo_url"`
}

type ValidateJourneyRequest struct {
	Status          string `json:"status" binding:"required"` // approved or rejected
	SupervisorNotes string `json:"supervisor_notes"`
}

type DriverSubsidySummary struct {
	DriverID     int     `json:"driver_id"`
	DriverName   string  `json:"driver_name"`
	LicenseNo    string  `json:"license_number"`
	AutoKM       float64 `json:"auto_km"`       // Kilómetros en auto (10 C$/km)
	MotoKM       float64 `json:"moto_km"`       // Kilómetros en moto (6 C$/km)
	TotalKM      float64 `json:"total_km"`      // Total de kilómetros recorridos
	TotalSubsidy float64 `json:"total_subsidy"` // Pago total de subsidio en C$
}

type ReportSummary struct {
	CutoffID           *int                   `json:"cutoff_id,omitempty"`
	CutoffPeriod       *CutoffPeriod          `json:"cutoff_period,omitempty"`
	TotalVehicles      int                    `json:"total_vehicles"`
	ActiveVehicles     int                    `json:"active_vehicles"`
	TotalDrivers       int                    `json:"total_drivers"`
	ActiveDrivers      int                    `json:"active_drivers"`
	JourneysToday      int                    `json:"journeys_today"`
	FlaggedJourneys    int                    `json:"flagged_journeys"`
	TotalKMToday       float64                `json:"total_km_today"`
	AutoKMTotal        float64                `json:"auto_km_total"`
	MotoKMTotal        float64                `json:"moto_km_total"`
	TotalSubsidyPayout float64                `json:"total_subsidy_payout"`
	DriversBreakdown   []DriverSubsidySummary `json:"drivers_breakdown"`
}
