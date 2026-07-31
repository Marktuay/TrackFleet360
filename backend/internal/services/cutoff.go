package services

import (
	"time"

	"trackfleet360-backend/internal/models"
)

func Get2026CutoffPeriods() []models.CutoffPeriod {
	return []models.CutoffPeriod{
		{
			ID:          1,
			PeriodName:  "Enero 2026 - 1er Corte (1-15)",
			StartDate:   time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 1, 15, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 1, 18, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          2,
			PeriodName:  "Enero 2026 - 2do Corte (16-31)",
			StartDate:   time.Date(2026, 1, 16, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 1, 31, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 2, 3, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          3,
			PeriodName:  "Febrero 2026 - 1er Corte (1-15)",
			StartDate:   time.Date(2026, 2, 1, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 2, 15, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 2, 18, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          4,
			PeriodName:  "Febrero 2026 - 2do Corte (16-28)",
			StartDate:   time.Date(2026, 2, 16, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 2, 28, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 3, 3, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          5,
			PeriodName:  "Marzo 2026 - 1er Corte (1-15)",
			StartDate:   time.Date(2026, 3, 1, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 3, 15, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 3, 18, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          6,
			PeriodName:  "Marzo 2026 - 2do Corte (16-31)",
			StartDate:   time.Date(2026, 3, 16, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 3, 31, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 4, 3, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          7,
			PeriodName:  "Abril 2026 - 1er Corte (1-15)",
			StartDate:   time.Date(2026, 4, 1, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 4, 15, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 4, 18, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          8,
			PeriodName:  "Abril 2026 - 2do Corte (16-30)",
			StartDate:   time.Date(2026, 4, 16, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 4, 30, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 5, 3, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          9,
			PeriodName:  "Mayo 2026 - 1er Corte (1-15)",
			StartDate:   time.Date(2026, 5, 1, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 5, 15, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 5, 18, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          10,
			PeriodName:  "Mayo 2026 - 2do Corte (16-31)",
			StartDate:   time.Date(2026, 5, 16, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 5, 31, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 6, 3, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          11,
			PeriodName:  "Junio 2026 - 1er Corte (1-15)",
			StartDate:   time.Date(2026, 6, 1, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 6, 15, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 6, 18, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          12,
			PeriodName:  "Junio 2026 - 2do Corte (16-30)",
			StartDate:   time.Date(2026, 6, 16, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 6, 30, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 7, 3, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          13,
			PeriodName:  "Julio 2026 - 1er Corte (1-15)",
			StartDate:   time.Date(2026, 7, 1, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 7, 15, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 7, 18, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          14,
			PeriodName:  "Julio 2026 - 2do Corte (16-31 Actual)",
			StartDate:   time.Date(2026, 7, 16, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 7, 31, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 8, 3, 0, 0, 0, 0, time.UTC),
			Status:      "in_audit",
		},
		{
			ID:          15,
			PeriodName:  "Agosto 2026 - 1er Corte (1-15)",
			StartDate:   time.Date(2026, 8, 1, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 8, 15, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 8, 18, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          16,
			PeriodName:  "Agosto 2026 - 2do Corte (16-31)",
			StartDate:   time.Date(2026, 8, 16, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 8, 31, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 9, 3, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          17,
			PeriodName:  "Septiembre 2026 - 1er Corte (1-15)",
			StartDate:   time.Date(2026, 9, 1, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 9, 15, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 9, 18, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          18,
			PeriodName:  "Septiembre 2026 - 2do Corte (16-30)",
			StartDate:   time.Date(2026, 9, 16, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 9, 30, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 10, 3, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          19,
			PeriodName:  "Octubre 2026 - 1er Corte (1-15)",
			StartDate:   time.Date(2026, 10, 1, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 10, 15, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 10, 18, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          20,
			PeriodName:  "Octubre 2026 - 2do Corte (16-31)",
			StartDate:   time.Date(2026, 10, 16, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 10, 31, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 11, 3, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          21,
			PeriodName:  "Noviembre 2026 - 1er Corte (1-15)",
			StartDate:   time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 11, 15, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 11, 18, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          22,
			PeriodName:  "Noviembre 2026 - 2do Corte (16-30)",
			StartDate:   time.Date(2026, 11, 16, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 11, 30, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 12, 3, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          23,
			PeriodName:  "Diciembre 2026 - 1er Corte (1-15)",
			StartDate:   time.Date(2026, 12, 1, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 12, 15, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 12, 18, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          24,
			PeriodName:  "Diciembre 2026 - 2do Corte (16-31)",
			StartDate:   time.Date(2026, 12, 16, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 12, 31, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2027, 1, 3, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
	}
}

func GetCutoffPeriodByID(id int) *models.CutoffPeriod {
	periods := Get2026CutoffPeriods()
	for _, p := range periods {
		if p.ID == id {
			return &p
		}
	}
	return nil
}
