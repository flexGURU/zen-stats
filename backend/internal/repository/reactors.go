package repository

import (
	"context"
	"time"

	"github.com/Edwin9301/Zen/backend/pkg"
)

type Reactor struct {
	ID        uint32     `json:"id"`
	DeviceID  uint32     `json:"deviceId"`
	Name      string     `json:"name"`
	Status    string     `json:"status"`
	Pathway   string     `json:"pathway"`
	PdfUrl    string     `json:"pdfUrl"`
	DeletedAt *time.Time `json:"deletedAt"`
	CreatedAt time.Time  `json:"created_at"`
}

type UpdateReactor struct {
	ID       uint32  `json:"id"`
	DeviceID *uint32 `json:"deviceId"`
	Name     *string `json:"name"`
	Status   *string `json:"status"`
	Pathway  *string `json:"pathway"`
	PdfUrl   *string `json:"pdfUrl"`
}

type FilterReactors struct {
	Pagination *pkg.Pagination
	Search     *string
	DeviceID   *uint32
	Status     *string
	Pathway    *string
}

type ReactorRepository interface {
	CreateReactor(ctx context.Context, reactor *Reactor) (*Reactor, error)
	GetReactorByID(ctx context.Context, id uint32) (*Reactor, error)
	UpdateReactor(ctx context.Context, updateReactor *UpdateReactor) error
	ListReactors(ctx context.Context, filter *FilterReactors) ([]*Reactor, *pkg.Pagination, error)
	DeleteReactor(ctx context.Context, id uint32) error
}
