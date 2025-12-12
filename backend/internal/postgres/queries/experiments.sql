-- name: CreateExperiment :one
INSERT INTO experiments (
    batch_id, operator, date, reactor_id, block_id, time_start, time_end,
    material_feedstock, exposure_conditions, analtical_tests
)
VALUES (
    sqlc.arg('batch_id'), sqlc.arg('operator'), sqlc.arg('date'), sqlc.arg('reactor_id'), sqlc.arg('block_id'),
    sqlc.arg('time_start'), sqlc.arg('time_end'),
    sqlc.arg('material_feedstock'), sqlc.arg('exposure_conditions'), sqlc.arg('analtical_tests')
)
RETURNING *;

-- name: GetExperimentByID :one
SELECT * FROM experiments WHERE id = sqlc.arg('id') AND deleted_at IS NULL;

-- name: UpdateExperiment :one
UPDATE experiments
SET
    batch_id = sqlc.arg('batch_id'),
    operator = sqlc.arg('operator'),
    date = sqlc.arg('date'),
    reactor_id = sqlc.arg('reactor_id'),
    block_id = sqlc.arg('block_id'),
    time_start = sqlc.arg('time_start'),
    time_end = sqlc.arg('time_end'),
    material_feedstock = sqlc.arg('material_feedstock'),
    exposure_conditions = sqlc.arg('exposure_conditions'),
    analtical_tests = sqlc.arg('analtical_tests')
WHERE id = sqlc.arg('id') AND deleted_at IS NULL
RETURNING *;

-- name: ListExperiments :many
SELECT * FROM experiments
WHERE deleted_at IS NULL
    AND (
        COALESCE(sqlc.narg('search'), '') = '' 
        OR LOWER(batch_id) LIKE sqlc.narg('search')
        OR LOWER(operator) LIKE sqlc.narg('search')
        OR LOWER(block_id) LIKE sqlc.narg('search')
    )
    AND (
        sqlc.narg('reactor_id')::bigint IS NULL 
        OR reactor_id = sqlc.narg('reactor_id')
    )
    AND (
        sqlc.narg('date')::timestamptz IS NULL 
        OR date::date = sqlc.narg('date')
    )
ORDER BY created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: CountListExperiments :one
SELECT COUNT(*) AS total_experiments
FROM experiments
WHERE deleted_at IS NULL
    AND (
        COALESCE(sqlc.narg('search'), '') = '' 
        OR LOWER(batch_id) LIKE sqlc.narg('search')
        OR LOWER(operator) LIKE sqlc.narg('search')
        OR LOWER(block_id) LIKE sqlc.narg('search')
    )
    AND (
        sqlc.narg('reactor_id')::bigint IS NULL 
        OR reactor_id = sqlc.narg('reactor_id')
    )
    AND (
        sqlc.narg('date')::timestamptz IS NULL 
        OR date::date = sqlc.narg('date')
    );

-- name: DeleteExperiment :exec
UPDATE experiments
SET deleted_at = now()
WHERE id = sqlc.arg('id') AND deleted_at IS NULL;

-- name: CountExperimentsRunToday :one
SELECT COUNT(*) AS experiments_done_today
FROM experiments
WHERE date::date = CURRENT_DATE AND deleted_at IS NULL;

-- name: CountExperimentsRunThisWeek :one
SELECT COUNT(*) AS experiments_done_this_week
FROM experiments
WHERE date::date >= date_trunc('week', CURRENT_DATE) AND deleted_at IS NULL;

-- name: GetAverageExperimentDuration :one
SELECT AVG(EXTRACT(EPOCH FROM (time_end - time_start))) AS average_experiment_duration
FROM experiments
WHERE deleted_at IS NULL;
