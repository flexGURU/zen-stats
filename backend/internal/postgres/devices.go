package postgres

import (
	"context"
	"database/sql"
	"errors"

	"github.com/Edwin9301/Zen/backend/internal/postgres/generated"
	"github.com/Edwin9301/Zen/backend/internal/repository"
	"github.com/Edwin9301/Zen/backend/pkg"
	"github.com/jackc/pgx/v5/pgtype"
)

var _ repository.DeviceRepository = (*DeviceRepository)(nil)

type DeviceRepository struct {
	store   *Store
	queries *generated.Queries
}

func NewDeviceRepository(store *Store) *DeviceRepository {
	return &DeviceRepository{
		store:   store,
		queries: generated.New(store.pool),
	}
}

func (r *DeviceRepository) CreateDevice(ctx context.Context, device *repository.Device) (*repository.Device, error) {
	arg := generated.CreateDeviceParams{
		Name:   device.Name,
		Status: device.Status,
	}

	dbDevice, err := r.queries.CreateDevice(ctx, arg)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to create device: %s", err.Error())
	}

	return &repository.Device{
		ID:        uint32(dbDevice.ID),
		Name:      dbDevice.Name,
		Status:    dbDevice.Status,
		CreatedAt: dbDevice.CreatedAt,
	}, nil
}

func (r *DeviceRepository) GetDeviceByID(ctx context.Context, id uint32) (*repository.Device, error) {
	dbDevice, err := r.queries.GetDevice(ctx, int64(id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "device with id %d not found", id)
		}
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get device: %s", err.Error())
	}

	return &repository.Device{
		ID:        uint32(dbDevice.ID),
		Name:      dbDevice.Name,
		Status:    dbDevice.Status,
		CreatedAt: dbDevice.CreatedAt,
	}, nil
}

func (r *DeviceRepository) UpdateDevice(ctx context.Context, id uint32, update *repository.DeviceUpdate) (*repository.Device, error) {
	params := generated.UpdateDeviceParams{
		ID: int64(id),
	}

	if update.Name != nil {
		params.Name = pgtype.Text{
			String: *update.Name,
			Valid:  true,
		}
	}

	if update.Status != nil {
		params.Status = pgtype.Bool{
			Bool:  *update.Status,
			Valid: true,
		}
	}

	dbDevice, err := r.queries.UpdateDevice(ctx, params)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "device with id %d not found", id)
		}
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update device: %s", err.Error())
	}

	return &repository.Device{
		ID:        uint32(dbDevice.ID),
		Name:      dbDevice.Name,
		Status:    dbDevice.Status,
		CreatedAt: dbDevice.CreatedAt,
	}, nil
}

func (r *DeviceRepository) DeleteDevice(ctx context.Context, id uint32) error {
	err := r.queries.DeleteDevice(ctx, int64(id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return pkg.Errorf(pkg.NOT_FOUND_ERROR, "device with id %d not found", id)
		}
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to delete device: %s", err.Error())
	}

	return nil
}

func (r *DeviceRepository) ListDevice(ctx context.Context) ([]*repository.Device, error) {
	dbDevices, err := r.queries.ListDevices(ctx)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to list devices: %s", err.Error())
	}

	devices := make([]*repository.Device, 0, len(dbDevices))
	for _, dbDevice := range dbDevices {
		devices = append(devices, &repository.Device{
			ID:        uint32(dbDevice.ID),
			Name:      dbDevice.Name,
			Status:    dbDevice.Status,
			CreatedAt: dbDevice.CreatedAt,
		})
	}

	return devices, nil
}

func (r *DeviceRepository) GetDeviceStats(ctx context.Context) (*repository.DeviceStats, error) {
	stats, err := r.queries.GetDeviceStats(ctx)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get device stats: %s", err.Error())
	}

	return &repository.DeviceStats{
		TotalDevices:        stats.TotalDevices,
		ActiveDevices:       stats.ActiveDevices,
		InactiveDevices:     stats.InactiveDevices,
		TotalSensorReadings: stats.TotalSensorReadings,
	}, nil
}
