package handlers

import (
	"net/http"

	"github.com/Edwin9301/Zen/backend/internal/repository"
	"github.com/Edwin9301/Zen/backend/pkg"
	"github.com/gin-gonic/gin"
)

func (s *Server) createSensorReadingHandler(ctx *gin.Context) {
	var req repository.ReadingPayload
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	reading := &repository.Reading{
		DeviceID: req.DeviceID,
		Payload:  req,
	}

	createdReading, err := s.repo.DeviceRepository.AddReading(ctx, reading)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"data": createdReading})
}

func (s *Server) getSensorReadingByIDHandler(ctx *gin.Context) {
	id, err := pkg.StrToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid reading ID")))
		return
	}

	reading, err := s.repo.DeviceRepository.GetReadingByID(ctx, id)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": reading})
}

func (s *Server) listSensorReadingsHandler(ctx *gin.Context) {
	listBy := ctx.DefaultQuery("list_by", "date")

	switch listBy {
	case "device":
		deviceId, err := pkg.StrToUint32(ctx.Query("device_id"))
		if err != nil {
			ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "device_id query parameter is required for date-based listing")))
			return
		}

		pageNoStr := ctx.DefaultQuery("page", "1")
		pageNo, err := pkg.StrToInt64(pageNoStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

			return
		}

		pageSizeStr := ctx.DefaultQuery("limit", "10")
		pageSize, err := pkg.StrToInt64(pageSizeStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

			return
		}

		filter := &repository.ReadingFilter{
			DeviceID: deviceId,
			Pagination: &pkg.Pagination{
				Page:     uint32(pageNo),
				PageSize: uint32(pageSize),
			},
		}

		readings, pagination, err := s.repo.DeviceRepository.ListReadingByDevice(ctx, filter)
		if err != nil {
			ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"data": readings, "pagination": pagination})

		return
	case "timeslot":
		startStr := ctx.Query("start")
		endStr := ctx.Query("end")
		if startStr == "" || endStr == "" {
			ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "start and end query parameters are required for timeslot-based listing")))
			return
		}

		startTime, err := pkg.StrToTime(startStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid start time format")))
			return
		}

		endTime, err := pkg.StrToTime(endStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid end time format")))
			return
		}

		deviceId, err := pkg.StrToUint32(ctx.Query("device_id"))
		if err != nil {
			ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "device_id query parameter is required for timeslot-based listing")))
			return
		}

		filter := &repository.ReadingFilter{
			DeviceID: deviceId,
			Start:    &startTime,
			End:      &endTime,
		}

		readings, err := s.repo.DeviceRepository.ListReadingByTimeRange(ctx, filter)
		if err != nil {
			ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"data": readings})

		return
	default:
		deviceId, err := pkg.StrToUint32(ctx.Query("device_id"))
		if err != nil {
			ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "device_id query parameter is required for timeslot-based listing")))
			return
		}

		dateStr := ctx.Query("date")
		if dateStr == "" {
			ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "date query parameter is required for date-based listing")))
			return
		}

		date, err := pkg.StrToDate(dateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid date format")))
			return
		}

		filter := &repository.ReadingFilter{
			DeviceID: deviceId,
			Date:     &date,
		}

		readings, err := s.repo.DeviceRepository.ListReadingByDate(ctx, filter)
		if err != nil {
			ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
			return
		}

		ctx.JSON(http.StatusOK, gin.H{"data": readings})

		return
	}
}
