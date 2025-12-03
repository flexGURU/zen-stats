package handlers

import (
	"context"
	"log"
	"net"
	"net/http"
	"time"

	"github.com/Edwin9301/Zen/backend/internal/postgres"
	"github.com/Edwin9301/Zen/backend/pkg"
	"github.com/gin-gonic/gin"
)

type Server struct {
	router *gin.Engine
	ln     net.Listener
	srv    *http.Server

	config     pkg.Config
	tokenMaker pkg.JWTMaker
	repo       *postgres.PostgresRepo

	email pkg.EmailSender
}

func NewServer(config pkg.Config, tokenMaker pkg.JWTMaker, repo *postgres.PostgresRepo) *Server {
	if config.ENVIRONMENT == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	emailSender := pkg.NewGmailSender(config.EMAIL_SENDER_NAME, config.EMAIL_SENDER_ADDRESS, config.EMAIL_SENDER_PASSWORD)

	r := gin.Default()

	s := &Server{
		router: r,
		ln:     nil,

		config:     config,
		tokenMaker: tokenMaker,
		repo:       repo,

		email: emailSender,
	}

	s.setUpRoutes()

	return s
}

func (s *Server) setUpRoutes() {
	s.router.Use(CORSmiddleware(s.config.FRONTEND_URL))

	// Public
	v1 := s.router.Group("/api/v1")

	// Auth-only group
	authGroup := v1.Group("/")
	authGroup.Use(authMiddleware(s.tokenMaker))

	// Admin-only group
	adminGroup := authGroup.Group("/")
	adminGroup.Use(adminOnlyMiddleware())

	// health check
	v1.GET("/health-check", s.healthCheckHandler)

	// auth routes
	v1.POST("/login", s.login)
	v1.GET("/logout", s.logout)
	v1.POST("/refresh-token", s.refreshToken)
	v1.POST("/request-password-reset", s.requestPasswordReset)
	v1.POST("/reset-password", s.resetPassword)

	// user routes
	adminGroup.POST("/users", s.createUser)
	authGroup.GET("/users/:id", s.getUser)
	adminGroup.GET("/users", s.listUsers)
	authGroup.PUT("/users/:id", s.updateUser)

	// experiment routes
	adminGroup.POST("/experiments", s.createExperiment)
	authGroup.GET("/experiments/:id", s.getExperiment)
	authGroup.GET("/experiments", s.listExperiments)
	adminGroup.PUT("/experiments/:id", s.updateExperiment)
	adminGroup.DELETE("/experiments/:id", s.deleteExperiment)

	// reactor routes
	adminGroup.POST("/reactors", s.createReactor)
	authGroup.GET("/reactors/:id", s.getReactor)
	adminGroup.PUT("/reactors/:id", s.updateReactor)
	adminGroup.DELETE("/reactors/:id", s.deleteReactor)
	authGroup.GET("/reactors", s.listReactors)

	// device routes
	adminGroup.POST("/devices", s.createDeviceHandler)
	authGroup.GET("/devices/:id", s.getDeviceByIDHandler)
	authGroup.GET("/devices", s.listDevicesHandler)
	adminGroup.PUT("/devices/:id", s.updateDeviceHandler)
	adminGroup.DELETE("/devices/:id", s.deleteDeviceHandler)
	authGroup.GET("/devices/stats", s.getDeviceStatsHandler)

	// sensor readings routes
	v1.POST("/readings/:id", s.createSensorReadingHandler)
	v1.GET("/readings/:id", s.getSensorReadingByIDHandler)
	v1.GET("/readings", s.listSensorReadingsHandler)

	s.srv = &http.Server{
		Addr:         s.config.SERVER_ADDRESS,
		Handler:      s.router.Handler(),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
}

func (s *Server) healthCheckHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (s *Server) Start() error {
	var err error
	if s.ln, err = net.Listen("tcp", s.config.SERVER_ADDRESS); err != nil {
		return err
	}

	go func(s *Server) {
		err := s.srv.Serve(s.ln)
		if err != nil && err != http.ErrServerClosed {
			panic(err)
		}
	}(s)

	return nil
}

func (s *Server) Stop(ctx context.Context) error {
	log.Println("Shutting down http server...")

	return s.srv.Shutdown(ctx)
}

func (s *Server) GetPort() int {
	if s.ln == nil {
		return 0
	}

	return s.ln.Addr().(*net.TCPAddr).Port
}

func errorResponse(err error) gin.H {
	return gin.H{
		"status_code": pkg.ErrorCode(err),
		"message":     pkg.ErrorMessage(err),
	}
}

// func constructCacheKey(path string, queryParams map[string][]string) string {
// 	const prefix = "/api/v1/"
// 	if ok := strings.HasPrefix(path, prefix); ok {
// 		path = strings.TrimPrefix(path, prefix)
// 	}

// 	var queryParts []string
// 	for key, values := range queryParams {
// 		for _, value := range values {
// 			queryParts = append(queryParts, fmt.Sprintf("%s=%s", key, value))
// 		}
// 	}
// 	sort.Strings(queryParts) // Sort to ensure cache key consistency

// 	return fmt.Sprintf("%s:%s", path, strings.Join(queryParts, ":"))
// }
