package postgres

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/Edwin9301/Zen/backend/internal/postgres/generated"
	"github.com/Edwin9301/Zen/backend/internal/repository"
	"github.com/Edwin9301/Zen/backend/pkg"
	"github.com/jackc/pgx/v5/pgtype"
)

var _ repository.ReactorRepository = (*ReactorRepository)(nil)

type ReactorRepository struct {
	queries *generated.Queries
}

func NewReactorRepository(store *Store) *ReactorRepository {
	return &ReactorRepository{queries: generated.New(store.pool)}
}

func (r *ReactorRepository) CreateReactor(ctx context.Context, reactor *repository.Reactor) (*repository.Reactor, error) {
	createParams := generated.CreateReactorParams{
		Name:    reactor.Name,
		Status:  reactor.Status,
		Pathway: pgtype.Text{Valid: false},
		PdfUrl:  pgtype.Text{Valid: false},
	}

	if reactor.Pathway != "" {
		createParams.Pathway = pgtype.Text{String: reactor.Pathway, Valid: true}
	}
	if reactor.PdfUrl != "" {
		createParams.PdfUrl = pgtype.Text{String: reactor.PdfUrl, Valid: true}
	}

	dbReactor, err := r.queries.CreateReactor(ctx, createParams)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to create reactor: %v", err)
	}

	return mapDBReactorToReactor(dbReactor), nil
}

func (r *ReactorRepository) GetReactorByID(ctx context.Context, id uint32) (*repository.Reactor, error) {
	dbReactor, err := r.queries.GetReactorByID(ctx, int64(id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "reactor with id %d not found", id)
		}
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get reactor by id: %v", err)
	}

	return mapDBReactorToReactor(dbReactor), nil
}

func (r *ReactorRepository) UpdateReactor(ctx context.Context, updateReactor *repository.UpdateReactor) error {
	updateParams := generated.UpdateReactorParams{
		ID:      int64(updateReactor.ID),
		Name:    pgtype.Text{Valid: false},
		Status:  pgtype.Text{Valid: false},
		Pathway: pgtype.Text{Valid: false},
		PdfUrl:  pgtype.Text{Valid: false},
	}

	if updateReactor.Name != nil {
		updateParams.Name = pgtype.Text{String: *updateReactor.Name, Valid: true}
	}
	if updateReactor.Status != nil {
		updateParams.Status = pgtype.Text{String: *updateReactor.Status, Valid: true}
	}
	if updateReactor.Pathway != nil {
		updateParams.Pathway = pgtype.Text{String: *updateReactor.Pathway, Valid: true}
	}
	if updateReactor.PdfUrl != nil {
		updateParams.PdfUrl = pgtype.Text{String: *updateReactor.PdfUrl, Valid: true}
	}

	err := r.queries.UpdateReactor(ctx, updateParams)
	if err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update reactor: %v", err)
	}

	return nil
}

func (r *ReactorRepository) ListReactors(ctx context.Context, filter *repository.FilterReactors) ([]*repository.Reactor, *pkg.Pagination, error) {
	listParams := generated.ListReactorsParams{
		Limit:   int32(filter.Pagination.PageSize),
		Offset:  pkg.Offset(filter.Pagination.Page, filter.Pagination.PageSize),
		Search:  pgtype.Text{Valid: false},
		Status:  pgtype.Text{Valid: false},
		Pathway: pgtype.Text{Valid: false},
	}

	countParams := generated.CountListReactorsParams{
		Search:  pgtype.Text{Valid: false},
		Status:  pgtype.Text{Valid: false},
		Pathway: pgtype.Text{Valid: false},
	}

	if filter.Search != nil {
		search := strings.ToLower(*filter.Search)
		listParams.Search = pgtype.Text{String: "%" + search + "%", Valid: true}
		countParams.Search = pgtype.Text{String: "%" + search + "%", Valid: true}
	}
	if filter.Status != nil {
		listParams.Status = pgtype.Text{String: *filter.Status, Valid: true}
		countParams.Status = pgtype.Text{String: *filter.Status, Valid: true}
	}
	if filter.Pathway != nil {
		listParams.Pathway = pgtype.Text{String: *filter.Pathway, Valid: true}
		countParams.Pathway = pgtype.Text{String: *filter.Pathway, Valid: true}
	}

	dbReactors, err := r.queries.ListReactors(ctx, listParams)
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to list reactors: %v", err)
	}

	totalCount, err := r.queries.CountListReactors(ctx, countParams)
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to count reactors: %v", err)
	}

	reactors := make([]*repository.Reactor, len(dbReactors))
	for i, dbReactor := range dbReactors {
		reactors[i] = mapDBReactorToReactor(dbReactor)
	}

	return reactors, pkg.CalculatePagination(uint32(totalCount), filter.Pagination.PageSize, filter.Pagination.Page), nil
}

func (r *ReactorRepository) DeleteReactor(ctx context.Context, id uint32) error {
	if err := r.queries.DeleteReactor(ctx, int64(id)); err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to delete reactor: %v", err)
	}
	return nil
}

func mapDBReactorToReactor(dbReactor generated.Reactor) *repository.Reactor {
	var deletedAt *time.Time
	if dbReactor.DeletedAt.Valid {
		deletedAt = &dbReactor.DeletedAt.Time
	}

	var pathway string
	if dbReactor.Pathway.Valid {
		pathway = dbReactor.Pathway.String
	}

	var pdfUrl string
	if dbReactor.PdfUrl.Valid {
		pdfUrl = dbReactor.PdfUrl.String
	}

	return &repository.Reactor{
		ID:        uint32(dbReactor.ID),
		Name:      dbReactor.Name,
		Status:    string(dbReactor.Status),
		Pathway:   pathway,
		PdfUrl:    pdfUrl,
		DeletedAt: deletedAt,
		CreatedAt: dbReactor.CreatedAt,
	}
}
