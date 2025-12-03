package handlers

import (
	"net/http"

	"github.com/Edwin9301/Zen/backend/internal/repository"
	"github.com/Edwin9301/Zen/backend/pkg"
	"github.com/gin-gonic/gin"
)

type createExperimentReq struct {
	// Experiment Core
	BatchID   string `json:"batchId" binding:"required"`
	ReactorID uint32 `json:"reactorId" binding:"required"`
	Operator  string `json:"operator" binding:"required"`
	Date      string `json:"date" binding:"required"`
	BlockID   string `json:"blockId" binding:"required"`

	TimeStart string `json:"timeStart" binding:"required"`
	TimeEnd   string `json:"timeEnd" binding:"required"`

	// Material Feedstock (flattened)
	MixDesign        string `json:"mixDesign"`
	Cement           string `json:"cement"`
	FineAggregate    string `json:"fineAggregate"`
	CoarseAggregate  string `json:"coarseAggregate"`
	Water            string `json:"water"`
	WaterCementRatio string `json:"waterCementRatio"`
	BlockSizeLength  string `json:"blockSizeLength"`
	BlockSizeWidth   string `json:"blockSizeWidth"`
	BlockSizeHeight  string `json:"blockSizeHeight"`

	// Exposure Conditions (flattened)
	Co2Form           string `json:"co2Form"`
	Co2Mass           string `json:"co2Mass"`
	InjectionPressure string `json:"injectionPressure"`
	HeadSpace         string `json:"headSpace"`
	ReactionTime      string `json:"reactionTime"`

	// Analytical tests can stay optional for now
	AnalyticalTests []struct {
		Name     string `json:"name" binding:"required"`
		SampleID string `json:"sampleId" binding:"required"`
		Date     string `json:"date" binding:"required"`
		PdfUrl   string `json:"pdfUrl" binding:"required"`
	} `json:"analyticalTests"`
}

func (s *Server) createExperiment(ctx *gin.Context) {
	var req createExperimentReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	date, err := pkg.StrToDate(req.Date)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid date format: %v should be 2006-01-02", err)))
		return
	}

	// Build Experiment object
	experiment := &repository.Experiment{
		BatchID:   req.BatchID,
		ReactorID: req.ReactorID,
		Operator:  req.Operator,
		Date:      date,
		BlockID:   req.BlockID,
		TimeStart: req.TimeStart,
		TimeEnd:   req.TimeEnd,
		MaterialFeedstock: repository.MaterialFeedstock{
			MixDesign:        req.MixDesign,
			Cement:           req.Cement,
			FineAggregate:    req.FineAggregate,
			CoarseAggregate:  req.CoarseAggregate,
			Water:            req.Water,
			WaterCementRatio: req.WaterCementRatio,
			BlockSizeLength:  req.BlockSizeLength,
			BlockSizeWidth:   req.BlockSizeWidth,
			BlockSizeHeight:  req.BlockSizeHeight,
		},
		ExposureConditions: repository.ExposureConditions{
			Co2Form:           req.Co2Form,
			Co2Mass:           req.Co2Mass,
			InjectionPressure: req.InjectionPressure,
			HeadSpace:         req.HeadSpace,
			ReactionTime:      req.ReactionTime,
		},
		AnalyticalTests: make([]repository.AnalyticalTests, len(req.AnalyticalTests)),
	}

	for i, at := range req.AnalyticalTests {
		atDate, err := pkg.StrToDate(at.Date)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid analytical test date format: %v should be 2006-01-02", err)))
			return
		}
		experiment.AnalyticalTests[i] = repository.AnalyticalTests{
			Name:     at.Name,
			SampleID: at.SampleID,
			Date:     atDate,
			PdfUrl:   at.PdfUrl,
		}
	}

	createdExperiment, err := s.repo.ExperimentRepository.CreateExperiment(ctx, experiment)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": createdExperiment})
}

func (s *Server) getExperiment(ctx *gin.Context) {
	id, err := pkg.StrToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	experiment, err := s.repo.ExperimentRepository.GetExperimentByID(ctx, id)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": experiment})
}

func (s *Server) updateExperiment(ctx *gin.Context) {
	id, err := pkg.StrToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	var req createExperimentReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	date, err := pkg.StrToDate(req.Date)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid date format: %v should be 2006-01-02", err)))
		return
	}

	// Build Experiment object
	experiment := &repository.Experiment{
		ID:        id,
		BatchID:   req.BatchID,
		ReactorID: req.ReactorID,
		Operator:  req.Operator,
		Date:      date,
		BlockID:   req.BlockID,
		TimeStart: req.TimeStart,
		TimeEnd:   req.TimeEnd,
		MaterialFeedstock: repository.MaterialFeedstock{
			MixDesign:        req.MixDesign,
			Cement:           req.Cement,
			FineAggregate:    req.FineAggregate,
			CoarseAggregate:  req.CoarseAggregate,
			Water:            req.Water,
			WaterCementRatio: req.WaterCementRatio,
			BlockSizeLength:  req.BlockSizeLength,
			BlockSizeWidth:   req.BlockSizeWidth,
			BlockSizeHeight:  req.BlockSizeHeight,
		},
		ExposureConditions: repository.ExposureConditions{
			Co2Form:           req.Co2Form,
			Co2Mass:           req.Co2Mass,
			InjectionPressure: req.InjectionPressure,
			HeadSpace:         req.HeadSpace,
			ReactionTime:      req.ReactionTime,
		},
		AnalyticalTests: make([]repository.AnalyticalTests, len(req.AnalyticalTests)),
	}

	for i, at := range req.AnalyticalTests {
		atDate, err := pkg.StrToDate(at.Date)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid analytical test date format: %v should be 2006-01-02", err)))
			return
		}
		experiment.AnalyticalTests[i] = repository.AnalyticalTests{
			Name:     at.Name,
			SampleID: at.SampleID,
			Date:     atDate,
			PdfUrl:   at.PdfUrl,
		}
	}

	err = s.repo.ExperimentRepository.UpdateExperiment(ctx, experiment)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "experiment updated successfully"})
}

func (s *Server) deleteExperiment(ctx *gin.Context) {
	id, err := pkg.StrToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	if err := s.repo.ExperimentRepository.DeleteExperiment(ctx, id); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "experiment deleted successfully"})
}

func (s *Server) listExperiments(ctx *gin.Context) {
	pageNoStr := ctx.DefaultQuery("page", "1")
	pageNo, err := pkg.StrToUint32(pageNoStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	pageSizeStr := ctx.DefaultQuery("limit", "10")
	pageSize, err := pkg.StrToUint32(pageSizeStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	filter := repository.FilterExperiments{
		Pagination: &pkg.Pagination{
			Page:     pageNo,
			PageSize: pageSize,
		},
		Search:    nil,
		ReactorID: nil,
		Date:      nil,
	}
	if search := ctx.Query("search"); search != "" {
		filter.Search = &search
	}
	if reactorIDStr := ctx.Query("reactord"); reactorIDStr != "" {
		reactorID, err := pkg.StrToUint32(reactorIDStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

			return
		}
		filter.ReactorID = &reactorID
	}
	if dateStr := ctx.Query("date"); dateStr != "" {
		date, err := pkg.StrToDate(dateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid date format: %v should be 2006-01-02", err)))

			return
		}
		filter.Date = &date
	}

	experiments, pagination, err := s.repo.ExperimentRepository.ListExperiments(ctx, &filter)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": experiments, "pagination": pagination})
}
