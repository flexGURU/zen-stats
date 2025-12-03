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
WHERE id = $1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1;

-- name: UpdateUser :one
UPDATE users
SET name = coalesce(sqlc.narg('name'), name),
    email = coalesce(sqlc.narg('email'), email),
    phone_number = coalesce(sqlc.narg('phone_number'), phone_number),
    role = coalesce(sqlc.narg('role'), role),
    is_active = coalesce(sqlc.narg('is_active'), is_active)
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: UpdateUserPassword :exec
UPDATE users
SET password = sqlc.arg('password')
WHERE id = $1;

-- name: ListUsers :many
SELECT * FROM users
WHERE 
    (
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
    (
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