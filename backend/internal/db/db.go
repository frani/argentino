package db

import (
	"context"
	"database/sql"
	"fmt"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	_ "embed"
)

//go:embed schema.sql
var schemaSQL string

func Connect() (*sql.DB, error) {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "postgres://finuser:finpassword@localhost:5432/finargentina?sslmode=disable"
	}
	db, err := sql.Open("pgx", connStr)
	if err != nil {
		return nil, fmt.Errorf("error opening db connection: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error pinging db: %w", err)
	}

	return db, nil
}

func InitSchema(db *sql.DB) error {
	_, err := db.ExecContext(context.Background(), schemaSQL)
	if err != nil {
		return fmt.Errorf("could not execute schema: %w", err)
	}

	return nil
}
