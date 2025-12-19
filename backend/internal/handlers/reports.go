package handlers

import (
	"fmt"
	"net/http"

	"github.com/Edwin9301/Zen/backend/pkg"
	"github.com/gin-gonic/gin"
)

type generateReadingReportRequest struct {
	DeviceID  uint32 `json:"deviceId" binding:"required"`
	StartDate string `json:"start" binding:"required"`
	EndDate   string `json:"end" binding:"required"`
}

func (s *Server) generateReadingReportHandler(ctx *gin.Context) {
	var req generateReadingReportRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	startDate, err := pkg.StrToTime(req.StartDate)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid start date format")))
		return
	}

	endDate, err := pkg.StrToTime(req.EndDate)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid end date format")))
		return
	}

	excelData, err := s.report.GenerateReadingsReport(ctx.Request.Context(), req.DeviceID, startDate, endDate)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.Header("Content-Description", "File Transfer")
	ctx.Header("Content-Disposition", fmt.Sprintf("attachment; filename=readings_report%s-%s.xlsx", req.StartDate, req.EndDate))
	ctx.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	ctx.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelData)
}
