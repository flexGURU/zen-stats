package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Edwin9301/Zen/backend/internal/handlers"
	"github.com/Edwin9301/Zen/backend/internal/postgres"
	"github.com/Edwin9301/Zen/backend/pkg"
)

func main() {
	// Setup signal handlers.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	config, err := pkg.LoadConfig("/home/emilio-cliff/Zen/backend/.envs/.local")
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	tokenMaker := pkg.NewJWTMaker(config.TOKEN_SYMMETRIC_KEY, config.TOKEN_ISSUER)
	if err != nil {
		log.Fatalf("Error creating token maker: %v", err)
	}

	// open database
	store := postgres.NewStore(config)
	err = store.OpenDB(context.Background())
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	// initialize repository
	postgresRepo := postgres.NewPostgresRepo(store)

	// start server
	server := handlers.NewServer(config, tokenMaker, postgresRepo)
	log.Println("starting server at address: ", config.SERVER_ADDRESS)
	if err := server.Start(); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}

	<-quit

	signal.Stop(quit)

	log.Println("shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Stop(ctx); err != nil {
		log.Fatalf("Error stopping server: %v", err)
	}

	store.CloseDB()

	log.Println("Server shutdown ...")
}
