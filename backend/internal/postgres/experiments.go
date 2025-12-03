package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/Edwin9301/Zen/backend/internal/postgres/generated"
	"github.com/Edwin9301/Zen/backend/internal/repository"
	"github.com/Edwin9301/Zen/backend/pkg"
	"github.com/jackc/pgx/v5/pgtype"
)

var _ repository.ExperimentRepository = (*ExperimentRepository)(nil)

type ExperimentRepository struct {
	queries *generated.Queries
}

func NewExperimentRepository(store *Store) *ExperimentRepository {
	return &ExperimentRepository{queries: generated.New(store.pool)}
}

func (e *ExperimentRepository) CreateExperiment(ctx context.Context, experiment *repository.Experiment) (*repository.Experiment, error) {
	materialFeedstockJSON, err := json.Marshal(experiment.MaterialFeedstock)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to marshal material feedstock: %v", err)
	}

	exposureConditionsJSON, err := json.Marshal(experiment.ExposureConditions)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to marshal exposure conditions: %v", err)
	}

	analyticalTestsJSON, err := json.Marshal(experiment.AnalyticalTests)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to marshal analytical tests: %v", err)
	}

	startTime, err := pkg.StrToPgTime(experiment.TimeStart)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to parse start time: %v", err)
	}

	endTime, err := pkg.StrToPgTime(experiment.TimeEnd)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to parse end time: %v", err)
	}

	createParams := generated.CreateExperimentParams{
		BatchID:            experiment.BatchID,
		ReactorID:          int64(experiment.ReactorID),
		Operator:           experiment.Operator,
		Date:               experiment.Date,
		BlockID:            experiment.BlockID,
		TimeStart:          startTime,
		TimeEnd:            endTime,
		MaterialFeedstock:  materialFeedstockJSON,
		ExposureConditions: exposureConditionsJSON,
		AnalticalTests:     analyticalTestsJSON,
	}

	dbExperiment, err := e.queries.CreateExperiment(ctx, createParams)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to create experiment: %v", err)
	}

	return mapDBExperimentToExperiment(dbExperiment)
}

func (e *ExperimentRepository) GetExperimentByID(ctx context.Context, id uint32) (*repository.Experiment, error) {
	dbExperiment, err := e.queries.GetExperimentByID(ctx, int64(id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "experiment with id %d not found", id)
		}

		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get experiment by id: %v", err)
	}

	return mapDBExperimentToExperiment(dbExperiment)
}

func (e *ExperimentRepository) UpdateExperiment(ctx context.Context, experiment *repository.Experiment) error {
	materialFeedstockJSON, err := json.Marshal(experiment.MaterialFeedstock)
	if err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to marshal material feedstock: %v", err)
	}

	exposureConditionsJSON, err := json.Marshal(experiment.ExposureConditions)
	if err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to marshal exposure conditions: %v", err)
	}

	analyticalTestsJSON, err := json.Marshal(experiment.AnalyticalTests)
	if err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to marshal analytical tests: %v", err)
	}

	startTime, err := pkg.StrToPgTime(experiment.TimeStart)
	if err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to parse start time: %v", err)
	}

	endTime, err := pkg.StrToPgTime(experiment.TimeEnd)
	if err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to parse end time: %v", err)
	}

	updateParams := generated.UpdateExperimentParams{
		ID:                 int64(experiment.ID),
		BatchID:            experiment.BatchID,
		ReactorID:          int64(experiment.ReactorID),
		Operator:           experiment.Operator,
		Date:               experiment.Date,
		BlockID:            experiment.BlockID,
		TimeStart:          startTime,
		TimeEnd:            endTime,
		MaterialFeedstock:  materialFeedstockJSON,
		ExposureConditions: exposureConditionsJSON,
		AnalticalTests:     analyticalTestsJSON,
	}

	_, err = e.queries.UpdateExperiment(ctx, updateParams)
	if err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to create experiment: %v", err)
	}

	return nil
}

func (e *ExperimentRepository) ListExperiments(ctx context.Context, filter *repository.FilterExperiments) ([]*repository.Experiment, *pkg.Pagination, error) {
	listParams := generated.ListExperimentsParams{
		Limit:     int32(filter.Pagination.PageSize),
		Offset:    pkg.Offset(filter.Pagination.Page, filter.Pagination.PageSize),
		Search:    pgtype.Text{Valid: false},
		ReactorID: pgtype.Int8{Valid: false},
		Date:      pgtype.Timestamptz{Valid: false},
	}

	countParams := generated.CountListExperimentsParams{
		Search:    pgtype.Text{Valid: false},
		ReactorID: pgtype.Int8{Valid: false},
		Date:      pgtype.Timestamptz{Valid: false},
	}

	if filter.ReactorID != nil {
		listParams.ReactorID = pgtype.Int8{Int64: int64(*filter.ReactorID), Valid: true}
		countParams.ReactorID = pgtype.Int8{Int64: int64(*filter.ReactorID), Valid: true}
	}
	if filter.Search != nil {
		search := strings.ToLower(*filter.Search)
		listParams.Search = pgtype.Text{String: "%" + search + "%", Valid: true}
		countParams.Search = pgtype.Text{String: "%" + search + "%", Valid: true}
	}
	if filter.Date != nil {
		listParams.Date = pgtype.Timestamptz{Time: *filter.Date, Valid: true}
		countParams.Date = pgtype.Timestamptz{Time: *filter.Date, Valid: true}
	}

	dbExperiments, err := e.queries.ListExperiments(ctx, listParams)
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to list experiments: %v", err)
	}

	totalCount, err := e.queries.CountListExperiments(ctx, countParams)
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to count experiments: %v", err)
	}

	experiments := make([]*repository.Experiment, len(dbExperiments))
	for i, dbExperiment := range dbExperiments {
		experiment, err := mapDBExperimentToExperiment(dbExperiment)
		if err != nil {
			return nil, nil, err
		}
		experiments[i] = experiment
	}

	return experiments, pkg.CalculatePagination(uint32(totalCount), filter.Pagination.PageSize, filter.Pagination.Page), nil
}

func (e *ExperimentRepository) DeleteExperiment(ctx context.Context, id uint32) error {
	if err := e.queries.DeleteExperiment(ctx, int64(id)); err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to delete experiment: %v", err)
	}
	return nil
}

func mapDBExperimentToExperiment(dbExperiment generated.Experiment) (*repository.Experiment, error) {
	var materialFeedstock repository.MaterialFeedstock
	if err := json.Unmarshal(dbExperiment.MaterialFeedstock, &materialFeedstock); err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to unmarshal material feedstock: %v", err)
	}

	var exposureConditions repository.ExposureConditions
	if err := json.Unmarshal(dbExperiment.ExposureConditions, &exposureConditions); err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to unmarshal exposure conditions: %v", err)
	}

	var analyticalTests []repository.AnalyticalTests
	if err := json.Unmarshal(dbExperiment.AnalticalTests, &analyticalTests); err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to unmarshal analytical tests: %v", err)
	}

	var deletedAt *time.Time
	if dbExperiment.DeletedAt.Valid {
		deletedAt = &dbExperiment.DeletedAt.Time
	}

	return &repository.Experiment{
		ID:                 uint32(dbExperiment.ID),
		BatchID:            dbExperiment.BatchID,
		ReactorID:          uint32(dbExperiment.ReactorID),
		Operator:           dbExperiment.Operator,
		Date:               dbExperiment.Date,
		BlockID:            dbExperiment.BlockID,
		TimeStart:          pkg.PgTimeToTime(dbExperiment.TimeStart).Format("15:04"),
		TimeEnd:            pkg.PgTimeToTime(dbExperiment.TimeEnd).Format("15:04"),
		MaterialFeedstock:  materialFeedstock,
		ExposureConditions: exposureConditions,
		AnalyticalTests:    analyticalTests,
		DeletedAt:          deletedAt,
		CreatedAt:          dbExperiment.CreatedAt,
	}, nil
}
