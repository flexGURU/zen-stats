-- name: ListDevices :many
SELECT *
FROM device
WHERE deleted = false
ORDER BY created_at DESC;

-- name: GetDevice :one
SELECT *
FROM device
WHERE id = $1 AND deleted = false;

-- name: CreateDevice :one
INSERT INTO device (name, status)
VALUES ($1, $2)
RETURNING *;

-- name: UpdateDevice :one
UPDATE device
SET name   = COALESCE(sqlc.narg('name'), name),
    status = COALESCE(sqlc.narg('status'), status)
WHERE id = sqlc.arg('id') AND deleted = false
RETURNING *;

-- name: DeleteDevice :exec
UPDATE device
SET deleted = true
WHERE id = $1;

-- name: GetDeviceStats :one
SELECT
    (SELECT COUNT(*) FROM device) AS total_devices,
    (SELECT COUNT(*) FROM device WHERE status = TRUE) AS active_devices,
    (SELECT COUNT(*) FROM device WHERE status = FALSE) AS inactive_devices,
    (SELECT COUNT(*) FROM sensor_readings) AS total_sensor_readings;