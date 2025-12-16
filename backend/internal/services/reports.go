package services

import (
	"context"
	"time"
)

type ReportService interface {
	GenerateReadingsReport(ctx context.Context, deviceID uint32, startDate, endDate time.Time) ([]byte, error)
}
