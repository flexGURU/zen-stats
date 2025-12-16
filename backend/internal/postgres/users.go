package postgres

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"github.com/Edwin9301/Zen/backend/internal/postgres/generated"
	"github.com/Edwin9301/Zen/backend/internal/repository"
	"github.com/Edwin9301/Zen/backend/pkg"
	"github.com/jackc/pgx/v5/pgtype"
)

var _ repository.UserRepository = (*UserRepository)(nil)

type UserRepository struct {
	queries *generated.Queries
}

func NewUserRepository(store *Store) *UserRepository {
	return &UserRepository{queries: generated.New(store.pool)}
}

func (u *UserRepository) CreateUser(ctx context.Context, user *repository.User, hashedPassword string) (*repository.User, error) {
	createParams := generated.CreateUserParams{
		Name:        user.Name,
		Email:       user.Email,
		Password:    hashedPassword,
		Role:        generated.Role(user.Role),
		IsActive:    user.IsActive,
		PhoneNumber: pgtype.Text{Valid: false},
	}

	if user.PhoneNumber != "" {
		createParams.PhoneNumber = pgtype.Text{String: user.PhoneNumber, Valid: true}
	}

	dbUser, err := u.queries.CreateUser(ctx, createParams)
	if err != nil {
		if pkg.PgxErrorCode(err) == pkg.UNIQUE_VIOLATION {
			return nil, pkg.Errorf(pkg.ALREADY_EXISTS_ERROR, "user with email %s or phonenumber already exists", user.Email)
		}
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to create user: %v", err)
	}
	return mapDBUserToUser(dbUser), nil
}

func (u *UserRepository) GetUserByID(ctx context.Context, id uint32) (*repository.User, error) {
	dbUser, err := u.queries.GetUserByID(ctx, int64(id))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "user with id %d not found", id)
		}
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get user by id: %v", err)
	}

	return mapDBUserToUser(dbUser), nil
}

func (u *UserRepository) GetUserByEmail(ctx context.Context, email string) (*repository.User, error) {
	dbUser, err := u.queries.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "user with email %s not found", email)
		}
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get user by id: %v", err)
	}

	return mapDBUserToUser(dbUser), nil
}

func (u *UserRepository) UpdateUser(ctx context.Context, updateUser *repository.UpdateUser) error {
	updateParams := generated.UpdateUserParams{
		ID:          int64(updateUser.ID),
		Name:        pgtype.Text{Valid: false},
		Email:       pgtype.Text{Valid: false},
		PhoneNumber: pgtype.Text{Valid: false},
		Role:        generated.NullRole{Valid: false},
		IsActive:    pgtype.Bool{Valid: false},
	}

	if updateUser.Name != nil {
		updateParams.Name = pgtype.Text{String: *updateUser.Name, Valid: true}
	}
	if updateUser.Email != nil {
		updateParams.Email = pgtype.Text{String: *updateUser.Email, Valid: true}
	}
	if updateUser.PhoneNumber != nil {
		updateParams.PhoneNumber = pgtype.Text{String: *updateUser.PhoneNumber, Valid: true}
	}
	if updateUser.Role != nil {
		updateParams.Role = generated.NullRole{Role: generated.Role(*updateUser.Role), Valid: true}
	}
	if updateUser.IsActive != nil {
		updateParams.IsActive = pgtype.Bool{Bool: *updateUser.IsActive, Valid: true}
	}

	_, err := u.queries.UpdateUser(ctx, updateParams)
	if err != nil {
		if pkg.PgxErrorCode(err) == pkg.UNIQUE_VIOLATION {
			return pkg.Errorf(pkg.ALREADY_EXISTS_ERROR, "user with email %s or phonenumber already exists", *updateUser.Email)
		}
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update user: %v", err)
	}

	return nil
}

func (u *UserRepository) DeleteUser(ctx context.Context, userID uint32) error {
	if err := u.queries.DeleteUser(ctx, int64(userID)); err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to delete user: %v", err)
	}
	return nil
}

func (u *UserRepository) UpdateUserPassword(ctx context.Context, userID uint32, hashedPassword string) error {
	if err := u.queries.UpdateUserPassword(ctx, generated.UpdateUserPasswordParams{
		ID:       int64(userID),
		Password: hashedPassword,
	}); err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update user password: %v", err)
	}
	return nil
}

func (u *UserRepository) ListUsers(ctx context.Context, filter *repository.FilterUsers) ([]*repository.User, *pkg.Pagination, error) {
	listParams := generated.ListUsersParams{
		Limit:    int32(filter.Pagination.PageSize),
		Offset:   pkg.Offset(filter.Pagination.Page, filter.Pagination.PageSize),
		Search:   pgtype.Text{Valid: false},
		IsActive: pgtype.Bool{Valid: false},
		Role:     generated.NullRole{Valid: false},
	}

	countParams := generated.CountListUsersParams{
		Search:   pgtype.Text{Valid: false},
		IsActive: pgtype.Bool{Valid: false},
		Role:     generated.NullRole{Valid: false},
	}

	if filter.Search != nil {
		search := strings.ToLower(*filter.Search)
		listParams.Search = pgtype.Text{String: "%" + search + "%", Valid: true}
		countParams.Search = pgtype.Text{String: "%" + search + "%", Valid: true}
	}
	if filter.IsActive != nil {
		listParams.IsActive = pgtype.Bool{Bool: *filter.IsActive, Valid: true}
		countParams.IsActive = pgtype.Bool{Bool: *filter.IsActive, Valid: true}
	}
	if filter.Role != nil {
		listParams.Role = generated.NullRole{Role: generated.Role(*filter.Role), Valid: true}
		countParams.Role = generated.NullRole{Role: generated.Role(*filter.Role), Valid: true}
	}

	dbUsers, err := u.queries.ListUsers(ctx, listParams)
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to list users: %v", err)
	}

	totalCount, err := u.queries.CountListUsers(ctx, countParams)
	if err != nil {
		return nil, nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to count users: %v", err)
	}

	users := make([]*repository.User, len(dbUsers))
	for i, dbUser := range dbUsers {
		users[i] = mapDBUserToUser(dbUser)
	}

	return users, pkg.CalculatePagination(uint32(totalCount), filter.Pagination.PageSize, filter.Pagination.Page), nil
}

func (u *UserRepository) GetUserPassword(ctx context.Context, email string) (string, error) {
	password, err := u.queries.GetUserPasswordByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", pkg.Errorf(pkg.NOT_FOUND_ERROR, "user with email %s not found", email)
		}
		return "", pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get user password by email: %v", err)
	}
	return password, nil
}

func (u *UserRepository) GetUserRefreshToken(ctx context.Context, userID uint32) (string, error) {
	refreshToken, err := u.queries.GetUserRefreshTokenByID(ctx, int64(userID))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", pkg.Errorf(pkg.NOT_FOUND_ERROR, "user with id %d not found", userID)
		}
		return "", pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get user refresh token by id: %v", err)
	}

	if !refreshToken.Valid {
		return "", pkg.Errorf(pkg.NOT_FOUND_ERROR, "refresh token for user id %d not found", userID)
	}

	return refreshToken.String, nil
}

func (u *UserRepository) UpdateUserRefreshToken(ctx context.Context, userID uint32, refreshToken string) error {
	if err := u.queries.UpdateUserRefreshToken(ctx, generated.UpdateUserRefreshTokenParams{
		ID:           int64(userID),
		RefreshToken: pgtype.Text{String: refreshToken, Valid: true},
	}); err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to update user refresh token: %v", err)
	}
	return nil
}

func mapDBUserToUser(dbUser generated.User) *repository.User {
	var phoneNumber string
	if dbUser.PhoneNumber.Valid {
		phoneNumber = dbUser.PhoneNumber.String
	}

	return &repository.User{
		ID:          uint32(dbUser.ID),
		Name:        dbUser.Name,
		Email:       dbUser.Email,
		PhoneNumber: phoneNumber,
		Role:        string(dbUser.Role),
		IsActive:    dbUser.IsActive,
		CreatedAt:   dbUser.CreatedAt,
	}
}

func (u *UserRepository) GetDashboardData(ctx context.Context, isAdmin bool) (*repository.DashboardStats, error) {
	dashboardStats := &repository.DashboardStats{}

	if isAdmin {
		dbUserStats, err := u.queries.CountTotalInactiveActiveUsers(ctx)
		if err != nil {
			return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get user stats: %v", err)
		}
		dashboardStats.TotalUsers = uint32(dbUserStats.TotalUsers)
		dashboardStats.ActiveUsers = uint32(dbUserStats.ActiveUsers)
		dashboardStats.InactiveUsers = uint32(dbUserStats.InactiveUsers)
	}

	dbDeviceStats, err := u.queries.CountTotalActiveInactiveDevices(ctx)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get device stats: %v", err)
	}
	dashboardStats.TotalDevices = uint32(dbDeviceStats.TotalDevices)
	dashboardStats.ActiveDevices = uint32(dbDeviceStats.ActiveDevices)
	dashboardStats.InactiveDevices = uint32(dbDeviceStats.InactiveDevices)

	dbReactorStats, err := u.queries.CountActiveInactiveReactors(ctx)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get reactor stats: %v", err)
	}
	dashboardStats.TotalReactors = uint32(dbReactorStats.TotalReactors)
	dashboardStats.ActiveReactors = uint32(dbReactorStats.ActiveReactors)
	dashboardStats.InactiveReactors = uint32(dbReactorStats.InactiveReactors)

	experimentsDoneToday, err := u.queries.CountExperimentsRunToday(ctx)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get experiments run today: %v", err)
	}
	dashboardStats.ExperimentsRunToday = uint32(experimentsDoneToday)

	experimentsDoneThisWeek, err := u.queries.CountExperimentsRunThisWeek(ctx)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get experiments run this week: %v", err)
	}
	dashboardStats.ExperimentsRunThisWeek = uint32(experimentsDoneThisWeek)

	avgExperimentDuration, err := u.queries.GetAverageExperimentDuration(ctx)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to get average experiment duration: %v", err)
	}
	dashboardStats.AverageExperimentDurationSeconds = avgExperimentDuration

	return dashboardStats, nil
}
