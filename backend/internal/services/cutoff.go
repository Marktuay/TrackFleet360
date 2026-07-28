package services

import (
	"time"

	"trackfleet360-backend/internal/models"
)

func Get2026CutoffPeriods() []models.CutoffPeriod {
	return []models.CutoffPeriod{
		{
			ID:          1,
			PeriodName:  "Enero 2026 - 1er Corte",
			StartDate:   time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 1, 7, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 1, 12, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          2,
			PeriodName:  "Enero 2026 - 2do Corte",
			StartDate:   time.Date(2026, 1, 8, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 1, 22, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 1, 26, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          3,
			PeriodName:  "Febrero 2026 - 1er Corte",
			StartDate:   time.Date(2026, 1, 23, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 2, 6, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 2, 9, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          4,
			PeriodName:  "Febrero 2026 - 2do Corte",
			StartDate:   time.Date(2026, 2, 7, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 2, 20, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 2, 23, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          5,
			PeriodName:  "Marzo 2026 - 1er Corte",
			StartDate:   time.Date(2026, 2, 21, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 3, 6, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 3, 9, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          6,
			PeriodName:  "Marzo 2026 - 2do Corte",
			StartDate:   time.Date(2026, 3, 7, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 3, 20, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 3, 23, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          7,
			PeriodName:  "Abril 2026 - 1er Corte",
			StartDate:   time.Date(2026, 3, 21, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 4, 7, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 4, 10, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          8,
			PeriodName:  "Abril 2026 - 2do Corte",
			StartDate:   time.Date(2026, 4, 8, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 4, 21, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 4, 24, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          9,
			PeriodName:  "Mayo 2026 - 1er Corte",
			StartDate:   time.Date(2026, 4, 22, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 5, 7, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 5, 11, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          10,
			PeriodName:  "Mayo 2026 - 2do Corte",
			StartDate:   time.Date(2026, 5, 8, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 5, 21, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 5, 25, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          11,
			PeriodName:  "Junio 2026 - 1er Corte",
			StartDate:   time.Date(2026, 5, 22, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 6, 5, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 6, 8, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          12,
			PeriodName:  "Junio 2026 - 2do Corte",
			StartDate:   time.Date(2026, 6, 6, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 6, 22, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 6, 24, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          13,
			PeriodName:  "Julio 2026 - 1er Corte",
			StartDate:   time.Date(2026, 6, 23, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 7, 7, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 7, 10, 0, 0, 0, 0, time.UTC),
			Status:      "paid",
		},
		{
			ID:          14,
			PeriodName:  "Julio 2026 - 2do Corte (Actual)",
			StartDate:   time.Date(2026, 7, 8, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 7, 22, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 7, 24, 0, 0, 0, 0, time.UTC),
			Status:      "in_audit",
		},
		{
			ID:          15,
			PeriodName:  "Agosto 2026 - 1er Corte",
			StartDate:   time.Date(2026, 7, 23, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 8, 6, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 8, 10, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          16,
			PeriodName:  "Agosto 2026 - 2do Corte",
			StartDate:   time.Date(2026, 8, 7, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 8, 20, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 8, 24, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          17,
			PeriodName:  "Septiembre 2026 - 1er Corte",
			StartDate:   time.Date(2026, 8, 21, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 9, 7, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 9, 9, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          18,
			PeriodName:  "Septiembre 2026 - 2do Corte",
			StartDate:   time.Date(2026, 9, 8, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 9, 21, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 9, 23, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          19,
			PeriodName:  "Octubre 2026 - 1er Corte",
			StartDate:   time.Date(2026, 9, 22, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 10, 7, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 10, 9, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          20,
			PeriodName:  "Octubre 2026 - 2do Corte",
			StartDate:   time.Date(2026, 10, 8, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 10, 22, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 10, 23, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          21,
			PeriodName:  "Noviembre 2026 - 1er Corte",
			StartDate:   time.Date(2026, 10, 23, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 11, 6, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 11, 9, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          22,
			PeriodName:  "Noviembre 2026 - 2do Corte",
			StartDate:   time.Date(2026, 11, 7, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 11, 20, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 11, 23, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          23,
			PeriodName:  "Diciembre 2026 - 1er Corte",
			StartDate:   time.Date(2026, 11, 21, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 12, 7, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 12, 9, 0, 0, 0, 0, time.UTC),
			Status:      "pending",
		},
		{
			ID:          24,
			PeriodName:  "Diciembre 2026 - 2do Corte",
			StartDate:   time.Date(2026, 12, 8, 0, 0, 0, 0, time.UTC),
			CutoffDate:  time.Date(2026, 12, 21, 23, 59, 59, 0, time.UTC),
			PaymentDate: time.Date(2026, 12, 23, 0, 0, 0, 0, time.UTC),
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
