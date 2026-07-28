package services

import (
	"math"
	"testing"

	"trackfleet360-backend/internal/models"
)

func TestHaversine(t *testing.T) {
	// Distance between San José (9.9333, -84.0833) and Alajuela (10.0167, -84.2167) ~ 17-20 KM
	dist := Haversine(9.9333, -84.0833, 10.0167, -84.2167)
	if dist < 10.0 || dist > 30.0 {
		t.Errorf("Expected distance between 10 and 30 KM, got %f", dist)
	}
}

func TestValidateJourneyDiscrepancy(t *testing.T) {
	// Case 1: Normal journey within 5KM threshold
	diff, isFlagged := ValidateJourneyDiscrepancy(20.0, 19.5, 5.0, 10.0)
	if isFlagged {
		t.Errorf("Expected journey to NOT be flagged, diff: %f", diff)
	}

	// Case 2: Journey with high discrepancy > 5KM threshold
	diffFlagged, isFlagged2 := ValidateJourneyDiscrepancy(50.0, 22.5, 5.0, 10.0)
	if !isFlagged2 {
		t.Errorf("Expected journey to be flagged due to high discrepancy, diff: %f", diffFlagged)
	}
	if math.Abs(diffFlagged-27.5) > 0.01 {
		t.Errorf("Expected diff 27.5, got %f", diffFlagged)
	}
}

func TestCalculateTotalGPSDistance(t *testing.T) {
	pts := []models.GPSPoint{
		{Latitude: 9.9333, Longitude: -84.0833},
		{Latitude: 9.9800, Longitude: -84.1600},
		{Latitude: 10.0167, Longitude: -84.2167},
	}

	totalDist := CalculateTotalGPSDistance(pts)
	if totalDist <= 0 {
		t.Errorf("Expected positive total GPS distance, got %f", totalDist)
	}
}
