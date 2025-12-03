package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/Edwin9301/Zen/backend/pkg"
	"github.com/gin-gonic/gin"
)

type loginReq struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (s *Server) login(ctx *gin.Context) {
	var req loginReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))

		return
	}

	password, err := s.repo.UserRepository.GetUserPassword(ctx, req.Email)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	if err := pkg.ComparePasswordAndHash(password, req.Password); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	user, err := s.repo.UserRepository.GetUserByEmail(ctx, req.Email)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	refreshToken, err := s.tokenMaker.CreateToken(user.ID, user.Name, user.Email, user.Role, s.config.REFRESH_TOKEN_DURATION)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	accessToken, err := s.tokenMaker.CreateToken(user.ID, user.Name, user.Email, user.Role, s.config.TOKEN_DURATION)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	if err := s.repo.UserRepository.UpdateUserRefreshToken(ctx, user.ID, refreshToken); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))

		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"user":          user,
	})
}

func (s *Server) logout(ctx *gin.Context) {
	ctx.SetCookie("refreshToken", "", -1, "/", "", true, true)
	ctx.JSON(http.StatusOK, gin.H{"data": "success"})
}

type refreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

func (s *Server) refreshToken(ctx *gin.Context) {
	var req refreshTokenRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	payload, err := s.tokenMaker.VerifyToken(req.RefreshToken)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	accessToken, err := s.tokenMaker.CreateToken(payload.UserID, payload.Name, payload.Email, payload.Role, s.config.TOKEN_DURATION)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"access_token":            accessToken,
		"access_token_expires_at": time.Now().Add(s.config.TOKEN_DURATION),
	})
}

type requestPasswordResetRequest struct {
	Email string `json:"email" binding:"required,email"`
}

func (s *Server) requestPasswordReset(ctx *gin.Context) {
	var req requestPasswordResetRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	user, err := s.repo.UserRepository.GetUserByEmail(ctx, req.Email)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	// Generate a password reset token
	resetToken, err := s.tokenMaker.CreateToken(user.ID, user.Name, user.Email, user.Role, s.config.PASSWORD_RESET_DURATION)
	if err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	emailBody, err := pkg.GenerateText("reset_password", pkg.ResetPasswordTemplate, map[string]any{
		"Name":  user.Name,
		"Link":  fmt.Sprintf("%s/reset-password?token=%s", s.config.FRONTEND_ACTIVE_URL, resetToken),
		"Valid": s.config.PASSWORD_RESET_DURATION.String(),
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	go func(email string, emailBody string) {
		// if err := s.email.SendMail("Reset Password", emailBody, "text/html", []string{email}, nil, nil, nil, nil); err != nil {
		// 	log.Printf("failed to send password reset email to %s: %v", email, err)
		// }
	}(user.Email, emailBody)

	ctx.JSON(http.StatusOK, gin.H{"data": "password reset email sent"})
}

type resetPasswordReq struct {
	Password string `json:"password" binding:"required"`
}

func (s *Server) resetPassword(ctx *gin.Context) {
	token := ctx.Query("token")
	if token == "" {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "token is required")))
		return
	}

	tokenPayload, err := s.tokenMaker.VerifyToken(token)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, "invalid or expired token")))
		return
	}

	var req resetPasswordReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(pkg.Errorf(pkg.INVALID_ERROR, err.Error())))
		return
	}

	hashPassword, err := pkg.GenerateHashPassword(req.Password, s.config.PASSWORD_COST)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if err := s.repo.UserRepository.UpdateUserPassword(ctx, tokenPayload.UserID, hashPassword); err != nil {
		ctx.JSON(pkg.ErrorToStatusCode(err), errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "password reset successful"})
}
