package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"trackfleet360-backend/internal/middleware"
	"trackfleet360-backend/internal/models"
	"trackfleet360-backend/internal/repository"
	"trackfleet360-backend/internal/services"
)

type Handler struct {
	repo repository.Repository
}

func NewHandler(repo repository.Repository) *Handler {
	return &Handler{repo: repo}
}

// Auth Handlers
func (h *Handler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.repo.GetUserByEmail(c.Request.Context(), req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales inválidas"})
		return
	}

	if !user.Active {
		c.JSON(http.StatusForbidden, gin.H{"error": "La cuenta de usuario se encuentra desactivada"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales inválidas"})
		return
	}

	driverID := 0
	if user.Role == models.RoleDriver {
		if driver, err := h.repo.GetDriverByUserID(c.Request.Context(), user.ID); err == nil {
			driverID = driver.ID
		}
	}

	token, err := middleware.GenerateToken(user.ID, user.Email, user.Role, driverID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al generar token de sesión"})
		return
	}

	c.JSON(http.StatusOK, models.LoginResponse{
		Token: token,
		User:  *user,
	})
}

func (h *Handler) GetMe(c *gin.Context) {
	userID := c.GetInt("userID")
	user, err := h.repo.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// User Management Handlers (Admin / Supervisor)
func (h *Handler) ListUsers(c *gin.Context) {
	users, err := h.repo.ListUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *Handler) CreateUser(c *gin.Context) {
	var req models.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Role != models.RoleAdmin && req.Role != models.RoleSupervisor && req.Role != models.RoleDriver {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Rol inválido. Roles permitidos: admin, supervisor, driver"})
		return
	}

	user := &models.User{
		Email:    req.Email,
		FullName: req.FullName,
		Role:     req.Role,
		Active:   true,
	}

	if err := h.repo.CreateUser(c.Request.Context(), user, req.Password, req.LicenseNumber, req.Phone); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Usuario creado exitosamente",
		"user":    user,
	})
}

func (h *Handler) UpdateUser(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedUser, err := h.repo.UpdateUser(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Usuario actualizado exitosamente",
		"user":    updatedUser,
	})
}

func (h *Handler) DeleteUser(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	authUserID := c.GetInt("userID")
	if authUserID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No puede eliminar su propia cuenta de usuario en uso"})
		return
	}

	if err := h.repo.DeleteUser(c.Request.Context(), userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuario eliminado correctamente"})
}

func (h *Handler) ToggleUserStatus(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	var req models.UpdateUserStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.ToggleUserStatus(c.Request.Context(), userID, req.Active); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Estado de usuario actualizado correctamente", "active": req.Active})
}

// Vehicle Handlers
func (h *Handler) ListVehicles(c *gin.Context) {
	vehicles, err := h.repo.ListVehicles(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, vehicles)
}

func (h *Handler) CreateVehicle(c *gin.Context) {
	var v models.Vehicle
	if err := c.ShouldBindJSON(&v); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.CreateVehicle(c.Request.Context(), &v); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, v)
}

// Driver Handlers
func (h *Handler) ListDrivers(c *gin.Context) {
	drivers, err := h.repo.ListDrivers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, drivers)
}

// Cutoff Periods Handler
func (h *Handler) ListCutoffPeriods(c *gin.Context) {
	cutoffs, err := h.repo.ListCutoffPeriods(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, cutoffs)
}

// Journey Handlers
func (h *Handler) StartJourney(c *gin.Context) {
	var req models.StartJourneyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	driverID := c.GetInt("driverID")
	if driverID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El usuario autenticado no tiene perfil de conductor asignado"})
		return
	}

	if active, err := h.repo.GetActiveJourneyByDriver(c.Request.Context(), driverID); err == nil && active != nil {
		c.JSON(http.StatusConflict, gin.H{
			"error":   "Ya tiene un recorrido en curso",
			"journey": active,
		})
		return
	}

	journey := &models.Journey{
		DriverID:     driverID,
		VehicleID:    req.VehicleID,
		ProjectID:    req.ProjectID,
		StartLat:     req.StartLat,
		StartLng:     req.StartLng,
		StartAddress: req.StartAddress,
		StartKM:      req.StartKM,
	}

	if err := h.repo.CreateJourney(c.Request.Context(), journey); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	initialPoint := models.GPSPoint{
		JourneyID:  journey.ID,
		Latitude:   req.StartLat,
		Longitude:  req.StartLng,
		Speed:      0,
		RecordedAt: time.Now(),
	}
	_ = h.repo.AddGPSPoints(c.Request.Context(), []models.GPSPoint{initialPoint})

	c.JSON(http.StatusCreated, journey)
}

func (h *Handler) AddGPSPoints(c *gin.Context) {
	journeyID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de recorrido inválido"})
		return
	}

	var req models.AddGPSPointsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	points := make([]models.GPSPoint, len(req.Points))
	now := time.Now()
	for i, pt := range req.Points {
		recAt := pt.RecordedAt
		if recAt.IsZero() {
			recAt = now
		}
		points[i] = models.GPSPoint{
			JourneyID:  journeyID,
			Latitude:   pt.Latitude,
			Longitude:  pt.Longitude,
			Speed:      pt.Speed,
			RecordedAt: recAt,
		}
	}

	if err := h.repo.AddGPSPoints(c.Request.Context(), points); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "added_points": len(points)})
}

func (h *Handler) FinishJourney(c *gin.Context) {
	journeyID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de recorrido inválido"})
		return
	}

	var req models.FinishJourneyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	journey, err := h.repo.GetJourneyByID(c.Request.Context(), journeyID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recorrido no encontrado"})
		return
	}

	if req.EndKM < journey.StartKM {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El kilometraje final no puede ser menor al inicial"})
		return
	}

	declaredDistKM := req.EndKM - journey.StartKM
	gpsDistKM := services.CalculateTotalGPSDistance(journey.Points)

	diffKM, isFlagged := services.ValidateJourneyDiscrepancy(declaredDistKM, gpsDistKM, 5.0, 10.0)

	journey.EndLat = req.EndLat
	journey.EndLng = req.EndLng
	journey.EndAddress = req.EndAddress
	journey.EndKM = req.EndKM
	journey.DeclaredDistKM = declaredDistKM
	journey.GPSDistKM = gpsDistKM
	journey.DiffKM = diffKM

	if isFlagged {
		journey.Status = models.StatusFlagged
	} else {
		journey.Status = models.StatusCompleted
	}

	if err := h.repo.FinishJourney(c.Request.Context(), journey); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if req.PhotoURL != "" {
		photo := &models.Photo{
			JourneyID:  journeyID,
			PhotoType:  "end_odometer",
			URL:        req.PhotoURL,
			CapturedAt: time.Now(),
		}
		_ = h.repo.AddPhoto(c.Request.Context(), photo)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":          "Recorrido finalizado exitosamente",
		"journey":          journey,
		"declared_dist_km": declaredDistKM,
		"gps_dist_km":      gpsDistKM,
		"diff_km":          diffKM,
		"is_flagged":       isFlagged,
	})
}

func (h *Handler) UploadPhoto(c *gin.Context) {
	journeyID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de recorrido inválido"})
		return
	}

	file, err := c.FormFile("photo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fotografía requerida"})
		return
	}

	filename := fmt.Sprintf("journey_%d_%d_%s", journeyID, time.Now().Unix(), filepath.Base(file.Filename))
	savePath := filepath.Join("uploads", filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error guardando archivo: " + err.Error()})
		return
	}

	photoURL := "/uploads/" + filename
	photo := &models.Photo{
		JourneyID:  journeyID,
		PhotoType:  c.DefaultPostForm("photo_type", "end_odometer"),
		URL:        photoURL,
		CapturedAt: time.Now(),
	}

	_ = h.repo.AddPhoto(c.Request.Context(), photo)

	c.JSON(http.StatusOK, gin.H{"url": photoURL})
}

func (h *Handler) GetActiveJourney(c *gin.Context) {
	driverID := c.GetInt("driverID")
	if driverID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No driver ID in claims"})
		return
	}

	journey, err := h.repo.GetActiveJourneyByDriver(c.Request.Context(), driverID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sin recorrido activo"})
		return
	}

	c.JSON(http.StatusOK, journey)
}

func (h *Handler) ListJourneys(c *gin.Context) {
	driverID, _ := strconv.Atoi(c.Query("driver_id"))
	vehicleID, _ := strconv.Atoi(c.Query("vehicle_id"))
	cutoffID, _ := strconv.Atoi(c.Query("cutoff_id"))
	status := c.Query("status")

	journeys, err := h.repo.ListJourneys(c.Request.Context(), driverID, vehicleID, status, cutoffID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, journeys)
}

func (h *Handler) GetJourneyByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de recorrido inválido"})
		return
	}

	journey, err := h.repo.GetJourneyByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recorrido no encontrado"})
		return
	}

	c.JSON(http.StatusOK, journey)
}

func (h *Handler) ValidateJourney(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de recorrido inválido"})
		return
	}

	var req models.ValidateJourneyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Status != models.StatusApproved && req.Status != models.StatusRejected {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Estado inválido. Debe ser 'approved' o 'rejected'"})
		return
	}

	validatorID := c.GetInt("userID")
	if err := h.repo.ValidateJourney(c.Request.Context(), id, req.Status, req.SupervisorNotes, validatorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recorrido validado exitosamente", "status": req.Status})
}

// Report Handlers
func (h *Handler) GetReportSummary(c *gin.Context) {
	cutoffID, _ := strconv.Atoi(c.Query("cutoff_id"))

	summary, err := h.repo.GetReportSummary(c.Request.Context(), cutoffID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, summary)
}
