package main

import (
	"finargentina-server/internal/db"
	"finargentina-server/internal/mcp"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"time"
)

func main() {
	// Load .env file but don't fail if it's missing (it won't be in production)
	_ = godotenv.Load()

	database, err := db.Connect()
	if err != nil {
		log.Fatal("Could not connect to database:", err)
	}
	defer database.Close()

	if err := db.InitSchema(database); err != nil {
		log.Println("Note: schema init failed (might already exist):", err)
	}

	// Auto-ingest debtor CSV data on every startup (idempotent UPSERT)
	if err := db.IngestDebtorsFromCSV(database); err != nil {
		log.Printf("Warning: debtor ingestion failed: %v", err)
	}

	service := db.NewService(database)
	mcpServer := mcp.NewServer(service)

	// Background Hourly Sync
	go func() {
		log.Println("Starting background sync ticker (1 hour interval)")
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()

		// Run once on startup
		mcpServer.SyncData()

		for range ticker.C {
			log.Println("Global ticker triggered: Syncing all data...")
			mcpServer.SyncData()
		}
	}()

	http.HandleFunc("/mcp", func(w http.ResponseWriter, r *http.Request) {
		// Enable CORS for frontend
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		mcpServer.ServeHTTP(w, r)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("FinArgentina Backend running on :%s/mcp\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
