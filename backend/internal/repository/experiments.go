package repository

import (
	"context"
	"time"

	"github.com/Edwin9301/Zen/backend/pkg"
)

type Experiment struct {
	ID                 uint32             `json:"id"`
	BatchID            string             `json:"batchId"`
	ReactorID          uint32             `json:"reactorId"`
	Operator           string             `json:"operator"`
	Date               time.Time          `json:"date"`
	BlockID            string             `json:"blockId"`
	TimeStart          string             `json:"timeStart"`
	TimeEnd            string             `json:"timeEnd"`
	MaterialFeedstock  MaterialFeedstock  `json:"materialFeedstock"`
	ExposureConditions ExposureConditions `json:"exposureConditions"`
	AnalyticalTests    []AnalyticalTests  `json:"analyticalTests"`
	DeletedAt          *time.Time         `json:"deletedAt"`
	CreatedAt          time.Time          `json:"created_at"`
}

type MaterialFeedstock struct {
	MixDesign        string `json:"mixDesign"`
	Cement           string `json:"cement"`
	FineAggregate    string `json:"fineAggregate"`
	CoarseAggregate  string `json:"coarseAggregate"`
	Water            string `json:"water"`
	WaterCementRatio string `json:"waterCementRatio"`
	BlockSizeLength  string `json:"blockSizeLength"`
	BlockSizeWidth   string `json:"blockSizeWidth"`
	BlockSizeHeight  string `json:"blockSizeHeight"`
}

type ExposureConditions struct {
	Co2Form           string `json:"co2Form"`
	Co2Mass           string `json:"co2Mass"`
	InjectionPressure string `json:"injectionPressure"`
	HeadSpace         string `json:"headSpace"`
	ReactionTime      string `json:"reactionTime"`
}

type AnalyticalTests struct {
	Name     string    `json:"name"`
	SampleID string    `json:"sampleId"`
	Date     time.Time `json:"date"`
	PdfUrl   string    `json:"pdfUrl"`
}

type FilterExperiments struct {
	Pagination *pkg.Pagination
	Search     *string
	ReactorID  *uint32
	Date       *time.Time
}

type ExperimentRepository interface {
	CreateExperiment(ctx context.Context, experiment *Experiment) (*Experiment, error)
	GetExperimentByID(ctx context.Context, id uint32) (*Experiment, error)
	UpdateExperiment(ctx context.Context, experiment *Experiment) error
	ListExperiments(ctx context.Context, filter *FilterExperiments) ([]*Experiment, *pkg.Pagination, error)
	DeleteExperiment(ctx context.Context, id uint32) error
}
