package handlers

import (
	"net/http"

	"github.com/Edwin9301/Zen/backend/internal/repository"
	"github.com/Edwin9301/Zen/backend/pkg"
	"github.com/gin-gonic/gin"
)

type createUserReq struct {
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Role        string `json:"role" binding:"required,oneof=admin user"`
	IsActive    bool   `json:"isActive"`
	PhoneNumber string `json:"phoneNumber"`
	Password    string `json:"password" binding:"required"`
}

func (s *Server) createUser(ctx *gin.Context) {
	var req createUserReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	user := &repository.User{
		Name:        req.Name,
		Email:       req.Email,
		Role:        req.Role,
		IsActive:    req.IsActive,
		PhoneNumber: req.PhoneNumber,
	}

	// randomPassword, err := pkg.GenerateRandomPassword(6)
	// if err != nil {
	// 	ctx.JSON(http.StatusInternalServerError, errorResponse(pkg.Errorf(pkg.INTERNAL_ERROR, "failed to generate random password: %v", err)))

	// 	return
	// }

	// log.Println("Generated password for new user:", randomPassword)

	hashedPassword, err := pkg.GenerateHashPassword(req.Password, s.config.PASSWORD_COST)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	createdUser, err := s.repo.UserRepository.CreateUser(ctx, user, hashedPassword)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	// refreshToken, err := s.tokenMaker.CreateToken(createdUser.ID, createdUser.Name, createdUser.Email, createdUser.Role, s.config.REFRESH_TOKEN_DURATION)
	// if err != nil {
	// 	ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

	// 	return
	// }

	// emailBody, err := pkg.GenerateText("welcome_email", pkg.InviteUserTemplate, map[string]any{
	// 	"FullName":   createdUser.Name,
	// 	"Email":      createdUser.Email,
	// 	"InviteLink": fmt.Sprintf("%s/reset-password?token=%s", s.config.FRONTEND_ACTIVE_URL, refreshToken),
	// })
	// if err != nil {
	// 	log.Printf("failed to generate welcome email for user %s: %v", createdUser.Email, err)
	// 	return
	// }

	// go func(email string, emailBody string) {
	// 	if err := s.email.SendMail("Welcome Message", emailBody, "text/html", []string{email}, nil, nil, nil, nil); err != nil {
	// 		log.Printf("failed to send password reset email to %s: %v", email, err)
	// 	}
	// }(createdUser.Email, emailBody)

	ctx.JSON(http.StatusCreated, gin.H{"data": createdUser})
}

func (s *Server) getUser(ctx *gin.Context) {
	id, err := pkg.StrToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	payload, exists := ctx.Get(authorizationPayloadKey)
	if !exists {
		ctx.JSON(
			http.StatusUnauthorized,
			errorResponse(pkg.Errorf(pkg.AUTHENTICATION_ERROR, "Unauthorized")),
		)
		return
	}

	userPayload, ok := payload.(*pkg.Payload)
	if !ok {
		ctx.JSON(
			http.StatusUnauthorized,
			errorResponse(pkg.Errorf(pkg.AUTHENTICATION_ERROR, "Invalid auth payload")),
		)
		return
	}

	if userPayload.Role != "admin" && userPayload.UserID != id {
		ctx.JSON(
			http.StatusForbidden,
			errorResponse(pkg.Errorf(pkg.FORBIDDEN_ERROR, "Access to the requested resource is forbidden")),
		)
		return
	}

	user, err := s.repo.UserRepository.GetUserByID(ctx, id)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": user})
}

func (s *Server) updateUser(ctx *gin.Context) {
	var req repository.UpdateUser
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	payload, exists := ctx.Get(authorizationPayloadKey)
	if !exists {
		ctx.JSON(
			http.StatusUnauthorized,
			errorResponse(pkg.Errorf(pkg.AUTHENTICATION_ERROR, "Unauthorized")),
		)
		return
	}

	userPayload, ok := payload.(*pkg.Payload)
	if !ok {
		ctx.JSON(
			http.StatusUnauthorized,
			errorResponse(pkg.Errorf(pkg.AUTHENTICATION_ERROR, "Invalid auth payload")),
		)
		return
	}

	if req.Role != nil && userPayload.Role != "admin" {
		ctx.JSON(
			http.StatusForbidden,
			errorResponse(pkg.Errorf(pkg.FORBIDDEN_ERROR, "Only admin users can update roles")),
		)
		return
	}

	id, err := pkg.StrToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}
	req.ID = id

	if err := s.repo.UserRepository.UpdateUser(ctx, &req); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "user updated successfully"})
}

func (s *Server) deleteUser(ctx *gin.Context) {
	id, err := pkg.StrToUint32(ctx.Param("id"))
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	payload, exists := ctx.Get(authorizationPayloadKey)
	if !exists {
		ctx.JSON(
			http.StatusUnauthorized,
			errorResponse(pkg.Errorf(pkg.AUTHENTICATION_ERROR, "Unauthorized")),
		)
		return
	}

	userPayload, ok := payload.(*pkg.Payload)
	if !ok {
		ctx.JSON(
			http.StatusUnauthorized,
			errorResponse(pkg.Errorf(pkg.AUTHENTICATION_ERROR, "Invalid auth payload")),
		)
		return
	}

	if userPayload.Role != "admin" {
		ctx.JSON(
			http.StatusForbidden,
			errorResponse(pkg.Errorf(pkg.FORBIDDEN_ERROR, "Only admin users can delete users")),
		)
		return
	}

	if err := s.repo.UserRepository.DeleteUser(ctx, id); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "user deleted successfully"})
}

func (s *Server) listUsers(ctx *gin.Context) {
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

	filter := repository.FilterUsers{
		Pagination: &pkg.Pagination{
			Page:     pageNo,
			PageSize: pageSize,
		},
		Search:   nil,
		IsActive: nil,
		Role:     nil,
	}

	if search := ctx.Query("search"); search != "" {
		filter.Search = &search
	}
	if isActiveStr := ctx.Query("isActive"); isActiveStr != "" {
		isActive := pkg.StrToBool(isActiveStr)
		filter.IsActive = &isActive
	}
	if role := ctx.Query("role"); role != "" {
		filter.Role = &role
	}

	users, pagination, err := s.repo.UserRepository.ListUsers(ctx, &filter)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":       users,
		"pagination": pagination,
	})
}
