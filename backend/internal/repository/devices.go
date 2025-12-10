package repository

import (
	"context"
	"time"

	"github.com/Edwin9301/Zen/backend/pkg"
)

// DEVICE
type Device struct {
	ID        uint32    `json:"id"`
	Name      string    `json:"name"`
	ReactorID uint32    `json:"reactorId"`
	Status    bool      `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
}

type DeviceUpdate struct {
	ReactorID *uint32 `json:"reactorId"`
	Name      *string `json:"name"`
	Status    *bool   `json:"status"`
}

// SENSOR READINGS
type Reading struct {
	ID        uint32    `json:"id"`
	DeviceID  uint32    `json:"device_id"`
	Payload   any       `json:"payload"` // jsonb
	Timestamp time.Time `json:"timestamp"`
}

// type ReadingPayload struct {
// 	CO2       *float64 `json:"co2"`
// 	Pressure  *float64 `json:"pressure"`
// 	Temp      *float64 `json:"temperature1"`
// 	Temp2     *float64 `json:"temperature2"`
// 	ServerTS  string   `json:"ServerTS"`
// 	Timestamp string   `json:"timestamp"`
// }

// func (rp *ReadingPayload) Validate() error {
// 	if rp.CO2 == nil && rp.Pressure == nil && rp.Temp == nil {
// 		return pkg.Errorf(pkg.INVALID_ERROR, "at least one sensor reading must be provided")
// 	}
// 	return nil
// }

type ReadingFilter struct {
	DeviceID   uint32
	Pagination *pkg.Pagination
	Start      *time.Time // optional timeslot start
	End        *time.Time // optional timeslot end
	Date       *time.Time // optional "single day" filter
}

type DeviceRepository interface {
	// Devices
	CreateDevice(ctx context.Context, device *Device) (*Device, error)
	GetDeviceByID(ctx context.Context, id uint32) (*Device, error)
	UpdateDevice(ctx context.Context, id uint32, update *DeviceUpdate) (*Device, error)
	DeleteDevice(ctx context.Context, id uint32) error
	ListDevice(ctx context.Context) ([]*Device, error)
	GetDeviceStats(ctx context.Context) (*DeviceStats, error)

	// Readings
	AddReading(ctx context.Context, reading *Reading) (*Reading, error)
	GetReadingByID(ctx context.Context, id uint32) (*Reading, error)
	ListReadingByDevice(ctx context.Context, filter *ReadingFilter) ([]*Reading, *pkg.Pagination, error)
	ListReadingByDate(ctx context.Context, filter *ReadingFilter) ([]*Reading, error)
	ListReadingByTimeRange(ctx context.Context, filter *ReadingFilter) ([]*Reading, error)
}

// Optional stats result object
type DeviceStats struct {
	TotalDevices        int64 `json:"total_devices"`
	ActiveDevices       int64 `json:"active_devices"`
	InactiveDevices     int64 `json:"inactive_devices"`
	TotalSensorReadings int64 `json:"total_sensor_readings"`
}
