package main

import (
	"finargentina-server/internal/db"
	"finargentina-server/internal/mcp"
	"log"
	"net/http"
)

func main() {
	database, err := db.Connect()
	if err != nil {
		log.Fatal("Could not connect to database:", err)
	}
	defer database.Close()

	if err := db.InitSchema(database); err != nil {
		log.Println("Note: schema init failed (might already exist):", err)
	}

	service := db.NewService(database)
	mcpServer := mcp.NewServer(service)

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

	log.Println("FinArgentina Backend running on :8080/mcp")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
