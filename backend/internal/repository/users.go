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
	CreatedAt   time.Time `json:"created_at"`
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

type UserRepository interface {
	CreateUser(ctx context.Context, user *User, hashedPassword string) (*User, error)
	GetUserByID(ctx context.Context, id uint32) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	UpdateUser(ctx context.Context, updateUser *UpdateUser) error
	UpdateUserPassword(ctx context.Context, userID uint32, hashedPassword string) error
	ListUsers(ctx context.Context, filter *FilterUsers) ([]*User, *pkg.Pagination, error)

	// internal use only
	GetUserPassword(ctx context.Context, email string) (string, error)
	GetUserRefreshToken(ctx context.Context, userID uint32) (string, error)
	UpdateUserRefreshToken(ctx context.Context, userID uint32, refreshToken string) error
}
