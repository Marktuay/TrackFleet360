package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	"trackfleet360-backend/internal/handlers"
	"trackfleet360-backend/internal/middleware"
	"trackfleet360-backend/internal/models"
	"trackfleet360-backend/internal/repository"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin == "https://app.newcenturyni.com" || origin == "https://trackfleet360.newcenturyni.com" || origin == "http://localhost:3000" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "https://app.newcenturyni.com")
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func main() {
	log.Println("Starting TrackFleet360 Backend API...")

	_ = os.MkdirAll("uploads", 0755)

	repo := repository.NewMemoryStore()
	h := handlers.NewHandler(repo)

	r := gin.Default()
	r.Use(CORSMiddleware())

	r.Static("/uploads", "./uploads")

	v1 := r.Group("/api/v1")
	{
		// Public Auth
		v1.POST("/auth/login", h.Login)

		// Protected Routes
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/auth/me", h.GetMe)

			// Catalog Read & Cutoff Calendar
			protected.GET("/vehicles", h.ListVehicles)
			protected.GET("/drivers", h.ListDrivers)
			protected.GET("/cutoffs", h.ListCutoffPeriods)

			// Journeys (Driver & Supervisor)
			protected.POST("/journeys/start", h.StartJourney)
			protected.GET("/journeys/active", h.GetActiveJourney)
			protected.POST("/journeys/:id/gps", h.AddGPSPoints)
			protected.POST("/journeys/:id/finish", h.FinishJourney)
			protected.POST("/journeys/:id/photo", h.UploadPhoto)
			protected.GET("/journeys", h.ListJourneys)
			protected.GET("/journeys/:id", h.GetJourneyByID)

			// Admin / Supervisor Only Routes
			supervisor := protected.Group("")
			supervisor.Use(middleware.RequireRole(models.RoleAdmin, models.RoleSupervisor))
			{
				supervisor.GET("/users", h.ListUsers)
				supervisor.POST("/users", h.CreateUser)
				supervisor.PUT("/users/:id", h.UpdateUser)
				supervisor.DELETE("/users/:id", h.DeleteUser)
				supervisor.PATCH("/users/:id/status", h.ToggleUserStatus)
				supervisor.POST("/vehicles", h.CreateVehicle)
				supervisor.POST("/journeys/:id/validate", h.ValidateJourney)
				supervisor.GET("/reports/summary", h.GetReportSummary)
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	log.Printf("TrackFleet360 Backend running on port :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
