package repository

import (
	"context"
	"fmt"
	"os"
	"sync"
	"testing"
	"time"

	"trackfleet360-backend/internal/models"
)

func TestStoreStabilityAndConcurrency(t *testing.T) {
	// Clean previous state file for test isolation
	_ = os.Remove("data/store_state.json")
	_ = os.Remove("data/store_state.json.tmp")

	store := NewMemoryStore()
	ctx := context.Background()

	// 1. Initial State Check
	vehicles, err := store.ListVehicles(ctx)
	if err != nil {
		t.Fatalf("Error listing initial vehicles: %v", err)
	}
	if len(vehicles) == 0 {
		t.Fatalf("Expected seeded vehicles, got 0")
	}

	// 2. High Concurrency Stress Test (50 goroutines)
	var wg sync.WaitGroup
	numWorkers := 50
	startTime := time.Now()

	for i := 1; i <= numWorkers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()

			// Create a test journey
			j := &models.Journey{
				DriverID:     1,
				VehicleID:    (workerID % 15) + 1,
				Destination:  fmt.Sprintf("Destino Prueba %d", workerID),
				StartLat:     12.136389,
				StartLng:     -86.251389,
				StartAddress: "Managua, Nicaragua",
				StartKM:      100.0,
			}
			err := store.CreateJourney(ctx, j)
			if err != nil {
				t.Errorf("Worker %d failed to create journey: %v", workerID, err)
				return
			}

			// Add GPS points
			pts := []models.GPSPoint{
				{JourneyID: j.ID, Latitude: 12.1365, Longitude: -86.2515, Speed: 40.0, RecordedAt: time.Now()},
				{JourneyID: j.ID, Latitude: 12.1370, Longitude: -86.2520, Speed: 45.0, RecordedAt: time.Now()},
			}
			_ = store.AddGPSPoints(ctx, pts)

			// Read vehicle list
			_, _ = store.ListVehicles(ctx)

			// Read report summary
			_, _ = store.GetReportSummary(ctx, 0)
		}(i)
	}

	wg.Wait()
	duration := time.Since(startTime)
	t.Logf("✅ Concurrency Stress Test Completed: 50 workers processed in %v (avg %.2f ms/worker)", duration, float64(duration.Milliseconds())/50.0)

	// 3. Verify Persistence Restoration
	restoredStore := NewMemoryStore()
	restoredJourneys, err := restoredStore.ListJourneys(ctx, 0, 0, "", 0)
	if err != nil {
		t.Fatalf("Error listing restored journeys: %v", err)
	}

	if len(restoredJourneys) != numWorkers {
		t.Fatalf("Expected %d restored journeys, got %d", numWorkers, len(restoredJourneys))
	}

	t.Logf("✅ Persistence Verification Passed: Successfully restored all %d journeys from data/store_state.json!", len(restoredJourneys))

	// Cleanup test file after verification
	_ = os.Remove("data/store_state.json")
	_ = os.Remove("data/store_state.json.tmp")
}
