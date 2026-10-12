package db

import (
	"context"
	"testing"
	"anfi/internal/repository/sqlite"
)

func TestMigrate(t *testing.T) {
	ctx := context.Background()
	conn, err := sqlite.OpenDB(":memory:")
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	defer conn.Close()

	if err := Migrate(ctx, conn, "../../migrations"); err != nil {
		t.Fatalf("migration failed: %v", err)
	}
}
