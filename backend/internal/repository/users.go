package repository

import (
	"context"
	"time"

	"github.com/Edwin9301/Zen/backend/pkg"
)

type User struct {
	ID          uint32    `json:"id"`
	Name        string    `json:"name"`
	Email       string    `json:"email"`
	PhoneNumber string    `json:"phoneNumber"`
	Role        string    `json:"role"`
	IsActive    bool      `json:"isActive"`
	CreatedAt   time.Time `json:"createdAt"`
}

type UpdateUser struct {
	ID          uint32  `json:"id"`
	Name        *string `json:"name"`
	Email       *string `json:"email"`
	PhoneNumber *string `json:"phoneNumber"`
	Role        *string `json:"role"`
	IsActive    *bool   `json:"isActive"`
}

type FilterUsers struct {
	Pagination *pkg.Pagination
	Search     *string
	IsActive   *bool
	Role       *string
}

type DashboardStats struct {
	TotalUsers                       uint32  `json:"totalUsers"`
	ActiveUsers                      uint32  `json:"activeUsers"`
	InactiveUsers                    uint32  `json:"inactiveUsers"`
	TotalDevices                     uint32  `json:"totalDevices"`
	ActiveDevices                    uint32  `json:"activeDevices"`
	InactiveDevices                  uint32  `json:"inactiveDevices"`
	TotalReactors                    uint32  `json:"totalReactors"`
	ActiveReactors                   uint32  `json:"activeReactors"`
	InactiveReactors                 uint32  `json:"inactiveReactors"`
	ExperimentsRunToday              uint32  `json:"experimentsRunToday"`
	ExperimentsRunThisWeek           uint32  `json:"experimentsRunThisWeek"`
	AverageExperimentDurationSeconds float64 `json:"averageExperimentDurationSeconds"`
}

type UserRepository interface {
	CreateUser(ctx context.Context, user *User, hashedPassword string) (*User, error)
	GetUserByID(ctx context.Context, id uint32) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	UpdateUser(ctx context.Context, updateUser *UpdateUser) error
	UpdateUserPassword(ctx context.Context, userID uint32, hashedPassword string) error
	ListUsers(ctx context.Context, filter *FilterUsers) ([]*User, *pkg.Pagination, error)
	DeleteUser(ctx context.Context, userID uint32) error

	// internal use only
	GetUserPassword(ctx context.Context, email string) (string, error)
	GetUserRefreshToken(ctx context.Context, userID uint32) (string, error)
	UpdateUserRefreshToken(ctx context.Context, userID uint32, refreshToken string) error

	// dashboard stats
	GetDashboardData(ctx context.Context, isAdmin bool) (*DashboardStats, error)
}
