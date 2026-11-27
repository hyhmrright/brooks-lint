package fileutil

import (
	"errors"
	"fmt"
	"os"
	"testing"
)

// scan is the upstream snippet's unresolved dependency. Stat observes the
// original *os.File values (including their closed state) without closing them.
var handles []*os.File
var live []int

func scan(f *os.File) error {
	handles = append(handles, f)
	n := 0
	for _, h := range handles {
		if _, err := h.Stat(); err == nil {
			n++
		} else if !errors.Is(err, os.ErrClosed) {
			return err
		}
	}
	live = append(live, n)
	return nil
}

func TestObservation(t *testing.T) {
	path := t.TempDir() + "/input"
	if err := os.WriteFile(path, []byte("x"), 0600); err != nil {
		t.Fatal(err)
	}
	if err := processFiles([]string{path, path, path, path}); err != nil {
		t.Fatal(err)
	}
	for _, h := range handles {
		if _, err := h.Stat(); !errors.Is(err, os.ErrClosed) {
			t.Fatalf("expected closed file after return, got %v", err)
		}
	}
	fmt.Println("live", live)
}
