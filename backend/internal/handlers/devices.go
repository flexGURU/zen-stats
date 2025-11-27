package handlers

import (
	"net/http"

	"github.com/Edwin9301/Zen/backend/internal/repository"
	"github.com/Edwin9301/Zen/backend/pkg"
	"github.com/gin-gonic/gin"
)

type createDeviceRequest struct {
	Name   string `json:"name" binding:"required"`
	Status bool   `json:"status"`
}

func (s *Server) createDeviceHandler(ctx *gin.Context) {
	var req createDeviceRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	device := &repository.Device{
		Name:   req.Name,
		Status: req.Status,
	}

	createdDevice, err := s.repo.DeviceRepository.CreateDevice(ctx, device)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"data": createdDevice})
}

func (s *Server) getDeviceByIDHandler(ctx *gin.Context) {
	id, err := pkg.StrToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid device ID")))
		return
	}

	device, err := s.repo.DeviceRepository.GetDeviceByID(ctx, id)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": device})
}

func (s *Server) listDevicesHandler(ctx *gin.Context) {
	devices, err := s.repo.DeviceRepository.ListDevice(ctx)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": devices})
}

func (s *Server) updateDeviceHandler(ctx *gin.Context) {
	var req repository.DeviceUpdate
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	id, err := pkg.StrToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid device ID")))
		return
	}

	updatedDevice, err := s.repo.DeviceRepository.UpdateDevice(ctx, id, &req)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": updatedDevice})
}

func (s *Server) deleteDeviceHandler(ctx *gin.Context) {
	id, err := pkg.StrToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid device ID")))
		return
	}

	err = s.repo.DeviceRepository.DeleteDevice(ctx, id)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": true})
}

func (s *Server) getDeviceStatsHandler(ctx *gin.Context) {
	stats, err := s.repo.DeviceRepository.GetDeviceStats(ctx)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": stats})
}
