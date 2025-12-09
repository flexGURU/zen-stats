-- name: CreateReactor :one
INSERT INTO reactors (name, status, pathway, pdf_url)
VALUES (sqlc.arg('name'), sqlc.arg('status'), sqlc.narg('pathway'), sqlc.narg('pdf_url'))
RETURNING *;

-- name: GetReactorByID :one
SELECT * FROM reactors
WHERE id = $1 AND deleted_at IS NULL;

-- name: UpdateReactor :exec
UPDATE reactors
SET name = coalesce(sqlc.narg('name'), name),
    status = coalesce(sqlc.narg('status'), status),
    pathway = coalesce(sqlc.narg('pathway'), pathway),
    pdf_url = coalesce(sqlc.narg('pdf_url'), pdf_url)
WHERE id = sqlc.arg('id') AND deleted_at IS NULL;

-- name: ListReactors :many
SELECT * FROM reactors
WHERE deleted_at IS NULL
    AND (
        COALESCE(sqlc.narg('search'), '') = '' 
        OR LOWER(name) LIKE sqlc.narg('search')
    )
    AND (
        sqlc.narg('status')::text IS NULL 
        OR status = sqlc.narg('status')
    )
    AND (
        sqlc.narg('pathway')::text IS NULL 
        OR pathway = sqlc.narg('pathway')
    )
ORDER BY created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: CountListReactors :one
SELECT COUNT(*) AS total_reactors
FROM reactors
WHERE deleted_at IS NULL
    AND (
        COALESCE(sqlc.narg('search'), '') = '' 
        OR LOWER(name) LIKE sqlc.narg('search')
    )
    AND (
        sqlc.narg('status')::text IS NULL 
        OR status = sqlc.narg('status')
    )
    AND (
        sqlc.narg('pathway')::text IS NULL 
        OR pathway = sqlc.narg('pathway')
    );

-- name: DeleteReactor :exec
UPDATE reactors
SET deleted_at = now()
WHERE id = $1 AND deleted_at IS NULL;