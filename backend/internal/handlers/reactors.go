package handlers

import (
	"net/http"

	"github.com/Edwin9301/Zen/backend/internal/repository"
	"github.com/Edwin9301/Zen/backend/pkg"
	"github.com/gin-gonic/gin"
)

type createReactorReq struct {
	Name    string `json:"name" binding:"required"`
	Status  string `json:"status" binding:"required,oneof=active inactive maintenance"`
	Pathway string `json:"pathway"`
	PdfUrl  string `json:"pdfUrl"`
}

func (s *Server) createReactor(ctx *gin.Context) {
	var req createReactorReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	reactor := &repository.Reactor{
		Name:    req.Name,
		Status:  req.Status,
		Pathway: req.Pathway,
		PdfUrl:  req.PdfUrl,
	}

	createdReactor, err := s.repo.ReactorRepository.CreateReactor(ctx, reactor)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": createdReactor})
}

func (s *Server) getReactor(ctx *gin.Context) {
	id, err := pkg.StrToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	reactor, err := s.repo.ReactorRepository.GetReactorByID(ctx, id)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": reactor})
}

func (s *Server) updateReactor(ctx *gin.Context) {
	var req repository.UpdateReactor
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	id, err := pkg.StrToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}
	req.ID = id

	if err := s.repo.ReactorRepository.UpdateReactor(ctx, &req); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "reactor updated successfully"})
}

func (s *Server) deleteReactor(ctx *gin.Context) {
	id, err := pkg.StrToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	if err := s.repo.ReactorRepository.DeleteReactor(ctx, id); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "reactor deleted successfully"})
}

func (s *Server) listReactors(ctx *gin.Context) {
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

	filter := &repository.FilterReactors{
		Pagination: &pkg.Pagination{
			Page:     pageNo,
			PageSize: pageSize,
		},
		Search:  nil,
		Status:  nil,
		Pathway: nil,
	}

	if search := ctx.Query("search"); search != "" {
		filter.Search = &search
	}
	if status := ctx.Query("status"); status != "" {
		filter.Status = &status
	}
	if pathway := ctx.Query("pathway"); pathway != "" {
		filter.Pathway = &pathway
	}

	reactors, pagination, err := s.repo.ReactorRepository.ListReactors(ctx, filter)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":       reactors,
		"pagination": pagination,
	})
}
