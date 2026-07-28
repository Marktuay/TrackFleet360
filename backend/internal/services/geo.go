package services

import (
	"math"

	"trackfleet360-backend/internal/models"
)

const EarthRadiusKM = 6371.0

// Haversine calculates the distance in kilometers between two GPS coordinates
func Haversine(lat1, lng1, lat2, lng2 float64) float64 {
	dLat := (lat2 - lat1) * math.Pi / 180.0
	dLng := (lng2 - lng1) * math.Pi / 180.0

	radLat1 := lat1 * math.Pi / 180.0
	radLat2 := lat2 * math.Pi / 180.0

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Sin(dLng/2)*math.Sin(dLng/2)*math.Cos(radLat1)*math.Cos(radLat2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return EarthRadiusKM * c
}

// CalculateTotalGPSDistance sums up distances between consecutive recorded GPS points
func CalculateTotalGPSDistance(points []models.GPSPoint) float64 {
	if len(points) < 2 {
		return 0.0
	}

	var totalDist float64
	for i := 1; i < len(points); i++ {
		dist := Haversine(points[i-1].Latitude, points[i-1].Longitude, points[i].Latitude, points[i].Longitude)
		// Filter out unrealistic GPS jump noise (> 200km between consecutive points)
		if dist < 200.0 {
			totalDist += dist
		}
	}
	return math.Round(totalDist*100) / 100
}

// ValidateJourneyDiscrepancy compares declared odometer distance against GPS distance
// Returns diff_km, whether it exceeds threshold (isFlagged), and detailed discrepancy
func ValidateJourneyDiscrepancy(declaredKM, gpsKM, thresholdKM, thresholdPercent float64) (diffKM float64, isFlagged bool) {
	diffKM = math.Abs(declaredKM - gpsKM)
	diffKM = math.Round(diffKM*100) / 100

	if diffKM > thresholdKM {
		return diffKM, true
	}

	if gpsKM > 0 {
		percentDiff := (diffKM / gpsKM) * 100
		if percentDiff > thresholdPercent {
			return diffKM, true
		}
	}

	return diffKM, false
}
