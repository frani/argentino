package db

import (
	"context"
	"database/sql"
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// IngestDebtorsFromCSV looks for YYYY-MM-DEUDORES.csv files in candidate directories
// and loads the debtor summary data into the debtor_summaries table.
// Safe to call on every startup: uses UPSERT so re-runs are idempotent.
func IngestDebtorsFromCSV(database *sql.DB) error {
	// Look for CSV in several candidate locations relative to CWD
	candidates := []string{
		".", // when run from /backend
		"..", // when run from root
		"/app", // Docker workdir
	}

	var csvPath string
	for _, dir := range candidates {
		pattern := filepath.Join(dir, "*-DEUDORES.csv")
		matches, err := filepath.Glob(pattern)
		if err == nil && len(matches) > 0 {
			// Take the lexicographically last (most recent) file
			csvPath = matches[len(matches)-1]
			break
		}
	}

	if csvPath == "" {
		log.Println("[IngestDebtors] No se encontró ningún archivo *-DEUDORES.csv. Saltando ingesta.")
		return nil
	}

	log.Printf("[IngestDebtors] Ingestando desde: %s", csvPath)

	// Parse period date from filename: YYYY-MM-DEUDORES.csv
	base := filepath.Base(csvPath)
	parts := strings.Split(base, "-")
	if len(parts) < 2 {
		return fmt.Errorf("nombre de archivo CSV inválido: %s", base)
	}
	periodDateStr := parts[0] + "-" + parts[1] + "-01"
	periodDate, err := time.Parse("2006-01-02", periodDateStr)
	if err != nil {
		return fmt.Errorf("error parseando fecha del nombre de archivo: %w", err)
	}

	file, err := os.Open(csvPath)
	if err != nil {
		return fmt.Errorf("error abriendo CSV: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return fmt.Errorf("error leyendo CSV: %w", err)
	}
	if len(records) < 2 {
		log.Println("[IngestDebtors] CSV vacío o solo header. Saltando.")
		return nil
	}

	// Build column index map from header
	header := records[0]
	colIdx := map[string]int{}
	for i, h := range header {
		colIdx[h] = i
	}

	getFloat := func(record []string, col string) float64 {
		idx, ok := colIdx[col]
		if !ok || idx >= len(record) {
			return 0
		}
		v, _ := strconv.ParseFloat(record[idx], 64)
		return v
	}
	getInt := func(record []string, col string) int {
		idx, ok := colIdx[col]
		if !ok || idx >= len(record) {
			return 0
		}
		v, _ := strconv.Atoi(record[idx])
		return v
	}

	tx, err := database.BeginTx(context.Background(), nil)
	if err != nil {
		return fmt.Errorf("error iniciando transacción: %w", err)
	}

	stmt, err := tx.Prepare(`
		INSERT INTO debtor_summaries (
			entity_id, bco_code, period_date, debtor_count, total_debt_amount,
			debt_sit_1, debt_sit_2, debt_sit_3, debt_sit_4, debt_sit_5, debt_sit_11
		)
		SELECT e.id, $1::VARCHAR, $2::DATE, $3::INTEGER, $4::NUMERIC, $5::NUMERIC, $6::NUMERIC, $7::NUMERIC, $8::NUMERIC, $9::NUMERIC, $10::NUMERIC
		FROM entities e
		WHERE e.bco_code = $1
		ON CONFLICT (entity_id, period_date) DO UPDATE 
		SET debtor_count = EXCLUDED.debtor_count, 
		    total_debt_amount = EXCLUDED.total_debt_amount,
		    debt_sit_1 = EXCLUDED.debt_sit_1,
		    debt_sit_2 = EXCLUDED.debt_sit_2,
		    debt_sit_3 = EXCLUDED.debt_sit_3,
		    debt_sit_4 = EXCLUDED.debt_sit_4,
		    debt_sit_5 = EXCLUDED.debt_sit_5,
		    debt_sit_11 = EXCLUDED.debt_sit_11
	`)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("error preparando statement: %w", err)
	}
	defer stmt.Close()

	inserted := 0
	for i, record := range records {
		if i == 0 || len(record) < 2 {
			continue
		}
		bcoInt, _ := strconv.Atoi(record[0])
		bcoCode := fmt.Sprintf("%d", bcoInt)
		count := getInt(record, "CANTIDAD_DEUDORES")
		amount := getFloat(record, "MONTO_TOTAL")
		sit1 := getFloat(record, "MONTO_SIT_1")
		sit2 := getFloat(record, "MONTO_SIT_2")
		sit3 := getFloat(record, "MONTO_SIT_3")
		sit4 := getFloat(record, "MONTO_SIT_4")
		sit5 := getFloat(record, "MONTO_SIT_5")
		sit11 := getFloat(record, "MONTO_SIT_11")

		_, err := stmt.Exec(bcoCode, periodDate, count, amount, sit1, sit2, sit3, sit4, sit5, sit11)
		if err != nil {
			log.Printf("[IngestDebtors] Error insertando entidad %s: %v", bcoCode, err)
		} else {
			inserted++
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("error haciendo commit: %w", err)
	}

	log.Printf("[IngestDebtors] Completado: %d/%d filas insertadas para periodo %s", inserted, len(records)-1, periodDate.Format("2006-01"))
	return nil
}
