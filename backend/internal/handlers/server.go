package handlers

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"sort"
	"strings"
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
}

func NewServer(config pkg.Config, tokenMaker pkg.JWTMaker, repo *postgres.PostgresRepo) *Server {
	if config.ENVIRONMENT == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	s := &Server{
		router: r,
		ln:     nil,

		config:     config,
		tokenMaker: tokenMaker,
		repo:       repo,
	}

	s.setUpRoutes()

	return s
}

func (s *Server) setUpRoutes() {
	s.router.Use(CORSmiddleware(s.config.FRONTEND_URL))

	v1 := s.router.Group("/api/v1")

	// health check
	v1.GET("/health-check", s.healthCheckHandler)

	// device routes
	v1.POST("/devices", s.createDeviceHandler)
	v1.GET("/devices/:id", s.getDeviceByIDHandler)
	v1.GET("/devices", s.listDevicesHandler)
	v1.PUT("/devices/:id", s.updateDeviceHandler)
	v1.DELETE("/devices/:id", s.deleteDeviceHandler)
	v1.GET("/devices/stats", s.getDeviceStatsHandler)

	// sensor readings routes
	v1.POST("/readings", s.createSensorReadingHandler)
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

func constructCacheKey(path string, queryParams map[string][]string) string {
	const prefix = "/api/v1/"
	if ok := strings.HasPrefix(path, prefix); ok {
		path = strings.TrimPrefix(path, prefix)
	}

	var queryParts []string
	for key, values := range queryParams {
		for _, value := range values {
			queryParts = append(queryParts, fmt.Sprintf("%s=%s", key, value))
		}
	}
	sort.Strings(queryParts) // Sort to ensure cache key consistency

	return fmt.Sprintf("%s:%s", path, strings.Join(queryParts, ":"))
}
