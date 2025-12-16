package reports

import (
	"context"
	"time"

	"github.com/Edwin9301/Zen/backend/internal/postgres"
	"github.com/Edwin9301/Zen/backend/internal/repository"
	"github.com/Edwin9301/Zen/backend/internal/services"
)

var _ services.ReportService = (*ReportService)(nil)

type ReportService struct {
	store *postgres.PostgresRepo
}

func NewReportService(store *postgres.PostgresRepo) *ReportService {
	return &ReportService{
		store: store,
	}
}

func (r *ReportService) GenerateReadingsReport(ctx context.Context, deviceID uint32, startDate, endDate time.Time) ([]byte, error) {
	filter := &repository.ReadingFilter{
		DeviceID: deviceID,
		Start:    &startDate,
		End:      &endDate,
	}

	readings, err := r.store.DeviceRepository.ListReadingByTimeRange(ctx, filter)
	if err != nil {
		return nil, err
	}

	generator := newReadingReport(readings)

	return generator.generateExcel("Sheet1")
}
