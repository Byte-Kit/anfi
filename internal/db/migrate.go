package db

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"anfi/internal/repository"
)

func Migrate(ctx context.Context, db repository.DBExecutor, pathToMigrations string) error {
	resolvedPath, err := filepath.Abs(pathToMigrations)
	if err != nil {
		return fmt.Errorf("failed to resolve migration path: %w", err)
	}

	entries, err := os.ReadDir(resolvedPath)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	var migrations []string
	for _, entry := range entries {
		if entry.IsDir() {
			upPath := filepath.Join(resolvedPath, entry.Name(), "up.sql")
			downPath := filepath.Join(resolvedPath, entry.Name(), "down.sql")
			if fileExists(upPath) && fileExists(downPath) {
				migrations = append(migrations, entry.Name())
			}
		}
	}

	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i] < migrations[j]
	})

	// Ensure _migration table exists
	createMigrationTableQuery := `
		CREATE TABLE IF NOT EXISTS "_migration" (
		  "name" TEXT NOT NULL,
		  PRIMARY KEY("name")
		);
	`
	if _, err := db.ExecContext(ctx, createMigrationTableQuery); err != nil {
		return fmt.Errorf("failed to create _migration table: %w", err)
	}

	for _, name := range migrations {
		scriptPath := filepath.Join(resolvedPath, name, "up.sql")
		content, err := os.ReadFile(scriptPath)
		if err != nil {
			return fmt.Errorf("failed to read migration %s: %w", name, err)
		}

		statements := splitStatements(string(content))
		for _, stmt := range statements {
			if stmt == "" {
				continue
			}
			if _, err := db.ExecContext(ctx, stmt); err != nil {
				return fmt.Errorf("failed to execute migration statement in %s (%s): %w", name, stmt, err)
			}
		}
	}

	return nil
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !info.IsDir()
}

func splitStatements(content string) []string {
	raw := strings.Split(content, ";")
	var statements []string
	for _, s := range raw {
		trimmed := strings.TrimSpace(s)
		if trimmed != "" {
			statements = append(statements, trimmed)
		}
	}
	return statements
}
