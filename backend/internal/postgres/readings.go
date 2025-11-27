package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"

	"github.com/Edwin9301/Zen/backend/internal/postgres/generated"
	"github.com/Edwin9301/Zen/backend/internal/repository"
	"github.com/Edwin9301/Zen/backend/pkg"
	"github.com/jackc/pgx/v5/pgtype"
)

func (r *DeviceRepository) AddReading(ctx context.Context, reading *repository.Reading) (*repository.Reading, error) {
	if err := reading.Payload.Validate(); err != nil {
		return nil, err
	}

	payloadBytes, err := json.Marshal(reading.Payload)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to marshal reading payload: %s", err.Error())
	}

	arg := generated.InsertReadingParams{
		DeviceID: int64(reading.DeviceID),
		Payload:  payloadBytes,
	}
	dbReading, err := r.queries.InsertReading(ctx, arg)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to add reading: %s", err.Error())
	}

	var payload repository.ReadingPayload
	if len(dbReading.Payload) > 0 {
		if err := json.Unmarshal(dbReading.Payload, &payload); err != nil {
			return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to unmarshal reading payload: %s", err.Error())
		}
	}

	return &repository.Reading{
		ID:        uint32(dbReading.ID),
		DeviceID:  uint32(dbReading.DeviceID),
		Payload:   payload,
		Timestamp: dbReading.Timestamp,
	}, nil
}

func (r *DeviceRepository) GetReadingByID(ctx context.Context, id uint32) (*repository.Reading, error) {
	dbReading, err := r.queries.GetReadingByID(ctx, int64(id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "reading with id %d not found", id)
		}
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get reading: %s", err.Error())
	}

	var payload repository.ReadingPayload
	if len(dbReading.Payload) > 0 {
		if err := json.Unmarshal(dbReading.Payload, &payload); err != nil {
			return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to unmarshal reading payload: %s", err.Error())
		}
	}

	return &repository.Reading{
		ID:        uint32(dbReading.ID),
		DeviceID:  uint32(dbReading.DeviceID),
		Payload:   payload,
		Timestamp: dbReading.Timestamp,
	}, nil
}

func (r *DeviceRepository) ListReadingByDevice(ctx context.Context, filter *repository.ReadingFilter) ([]*repository.Reading, *pkg.Pagination, error) {
	args := generated.GetDeviceReadingsParams{
		DeviceID: int64(filter.DeviceID),
		Limit:    int32(filter.Pagination.PageSize),
		Offset:   pkg.Offset(filter.Pagination.Page, filter.Pagination.PageSize),
	}

	dbReadings, err := r.queries.GetDeviceReadings(ctx, args)
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to list readings by device: %s", err.Error())
	}

	readings := make([]*repository.Reading, 0, len(dbReadings))
	for _, dbReading := range dbReadings {
		var payload repository.ReadingPayload
		if len(dbReading.Payload) > 0 {
			if err := json.Unmarshal(dbReading.Payload, &payload); err != nil {
				return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to unmarshal reading payload: %s", err.Error())
			}
		}

		readings = append(readings, &repository.Reading{
			ID:        uint32(dbReading.ID),
			DeviceID:  uint32(dbReading.DeviceID),
			Payload:   payload,
			Timestamp: dbReading.Timestamp,
		})
	}

	count, err := r.queries.CountDeviceReadings(ctx, int64(filter.DeviceID))
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to count readings by device: %s", err.Error())
	}

	return readings, pkg.CalculatePagination(uint32(count), filter.Pagination.PageSize, filter.Pagination.Page), nil
}

func (r *DeviceRepository) ListReadingByDate(ctx context.Context, filter *repository.ReadingFilter) ([]*repository.Reading, error) {
	dbReadings, err := r.queries.GetReadingsByDate(ctx, generated.GetReadingsByDateParams{
		DeviceID: int64(filter.DeviceID),
		Column2: pgtype.Date{
			Time:  *filter.Date,
			Valid: true,
		},
	})
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to list readings by date: %s", err.Error())
	}

	readings := make([]*repository.Reading, 0, len(dbReadings))
	for _, dbReading := range dbReadings {
		var payload repository.ReadingPayload
		if len(dbReading.Payload) > 0 {
			if err := json.Unmarshal(dbReading.Payload, &payload); err != nil {
				return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to unmarshal reading payload: %s", err.Error())
			}
		}

		readings = append(readings, &repository.Reading{
			ID:        uint32(dbReading.ID),
			DeviceID:  uint32(dbReading.DeviceID),
			Payload:   payload,
			Timestamp: dbReading.Timestamp,
		})
	}

	return readings, nil
}

func (r *DeviceRepository) ListReadingByTimeRange(ctx context.Context, filter *repository.ReadingFilter) ([]*repository.Reading, error) {
	if filter.Start == nil || filter.End == nil {
		return nil, pkg.Errorf(pkg.INVALID_ERROR, "start and end time must be provided")
	}

	args := generated.GetReadingsByTimeRangeParams{
		DeviceID:    int64(filter.DeviceID),
		Timestamp:   *filter.Start,
		Timestamp_2: *filter.End,
	}

	dbReadings, err := r.queries.GetReadingsByTimeRange(ctx, args)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to list readings by time range: %s", err.Error())
	}

	readings := make([]*repository.Reading, 0, len(dbReadings))
	for _, dbReading := range dbReadings {
		var payload repository.ReadingPayload
		if len(dbReading.Payload) > 0 {
			if err := json.Unmarshal(dbReading.Payload, &payload); err != nil {
				return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to unmarshal reading payload: %s", err.Error())
			}
		}

		readings = append(readings, &repository.Reading{
			ID:        uint32(dbReading.ID),
			DeviceID:  uint32(dbReading.DeviceID),
			Payload:   payload,
			Timestamp: dbReading.Timestamp,
		})
	}

	return readings, nil
}
