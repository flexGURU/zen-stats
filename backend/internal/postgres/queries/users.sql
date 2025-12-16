-- name: CreateUser :one
INSERT INTO users (name, email, phone_number, password, role, is_active)
VALUES (
    sqlc.arg('name'),
    sqlc.arg('email'),
    sqlc.narg('phone_number'),
    sqlc.arg('password'),
    sqlc.arg('role'),
    sqlc.arg('is_active')
)
RETURNING *;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 AND deleted_at IS NULL;

-- name: UpdateUser :one
UPDATE users
SET name = coalesce(sqlc.narg('name'), name),
    email = coalesce(sqlc.narg('email'), email),
    phone_number = coalesce(sqlc.narg('phone_number'), phone_number),
    role = coalesce(sqlc.narg('role'), role),
    is_active = coalesce(sqlc.narg('is_active'), is_active)
WHERE id = sqlc.arg('id') AND deleted_at IS NULL
RETURNING *;

-- name: DeleteUser :exec
UPDATE users
SET deleted_at = NOW()
WHERE id = $1 AND deleted_at IS NULL;

-- name: UpdateUserPassword :exec
UPDATE users
SET password = sqlc.arg('password')
WHERE id = $1 AND deleted_at IS NULL;

-- name: ListUsers :many
SELECT * FROM users
WHERE 
    deleted_at IS NULL
    AND (
        COALESCE(sqlc.narg('search'), '') = '' 
        OR LOWER(name) LIKE sqlc.narg('search')
        OR LOWER(email) LIKE sqlc.narg('search')
        OR LOWER(phone_number) LIKE sqlc.narg('search')
    )
    AND (
        sqlc.narg('is_active')::boolean IS NULL 
        OR is_active = sqlc.narg('is_active')
    )
    AND (
        sqlc.narg('role')::role IS NULL 
        OR role = sqlc.narg('role')
    )
ORDER BY created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: CountListUsers :one
SELECT COUNT(*) AS total_users
FROM users
WHERE 
    deleted_at IS NULL
    AND (
        COALESCE(sqlc.narg('search'), '') = '' 
        OR LOWER(name) LIKE sqlc.narg('search')
        OR LOWER(email) LIKE sqlc.narg('search')
        OR LOWER(phone_number) LIKE sqlc.narg('search')
    )
    AND (
        sqlc.narg('is_active')::boolean IS NULL 
        OR is_active = sqlc.narg('is_active')
    )
    AND (
        sqlc.narg('role')::role IS NULL 
        OR role = sqlc.narg('role')
    );

-- name: GetUserPasswordByEmail :one
SELECT password 
FROM users
WHERE email = $1;

-- name: GetUserRefreshTokenByID :one
SELECT refresh_token
FROM users
WHERE id = $1;

-- name: UpdateUserRefreshToken :exec
UPDATE users
SET refresh_token = sqlc.arg('refresh_token')
WHERE id = $1;

-- name: CountTotalInactiveActiveUsers :one
SELECT
    (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) AS total_users,
    (SELECT COUNT(*) FROM users WHERE is_active = true AND deleted_at IS NULL) AS active_users,
    (SELECT COUNT(*) FROM users WHERE is_active = false AND deleted_at IS NULL) AS inactive_users;
    