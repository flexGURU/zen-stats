-- name: InsertReading :one
INSERT INTO sensor_readings (device_id, payload)
VALUES ($1, $2)
RETURNING *;

-- name: GetReadingByID :one
SELECT *
FROM sensor_readings
WHERE id = $1;

-- name: GetDeviceReadings :many
SELECT *
FROM sensor_readings
WHERE device_id = $1
ORDER BY timestamp DESC
LIMIT $2 OFFSET $3;

-- name: CountDeviceReadings :one
SELECT COUNT(*) AS count
FROM sensor_readings
WHERE device_id = $1;

-- name: GetReadingsByDate :many
SELECT *
FROM sensor_readings
WHERE device_id = $1
  AND timestamp >= $2::date
  AND timestamp <  ($2::date + INTERVAL '1 day')
ORDER BY timestamp DESC;

-- name: GetReadingsByTimeRange :many
SELECT *
FROM sensor_readings
WHERE device_id = $1
  AND timestamp >= $2
  AND timestamp <= $3
ORDER BY timestamp ASC;

-- name: GetDeviceReadingsPaged :many
SELECT *
FROM sensor_readings
WHERE device_id = $1
  AND timestamp < $2
ORDER BY timestamp DESC
LIMIT $3 OFFSET $4;