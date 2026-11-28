package fileutil

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"testing"
)

type observation struct {
	Case   string   `json:"case"`
	Inputs []string `json:"inputs"`
	Scans  []int    `json:"scans"`
	AtExit int      `json:"live_at_return"`
	Status string   `json:"status"`
}

var opened []*os.File
var scans []int
var failScanAt int
var scanError = errors.New("fixture scan error")

func countLive() (int, error) {
	n := 0
	for _, f := range opened {
		if _, err := f.Stat(); err == nil {
			n++
		} else if !errors.Is(err, os.ErrClosed) {
			return 0, err
		}
	}
	return n, nil
}

// The upstream snippet supplies processFiles and expects scan from its caller.
func scan(f *os.File) error {
	opened = append(opened, f)
	live, err := countLive()
	if err != nil {
		return err
	}
	scans = append(scans, live)
	if len(scans) == failScanAt {
		return scanError
	}
	return nil
}

func TestLifetime(t *testing.T) {
	root := t.TempDir()
	path := filepath.Join(root, "input")
	if err := os.WriteFile(path, []byte("fixture"), 0600); err != nil {
		t.Fatal(err)
	}
	cases := []struct {
		name   string
		inputs []string
	}{
		{"empty", []string{}},
		{"one", []string{"ok"}},
		{"witness", []string{"ok", "ok"}},
		{"four", []string{"ok", "ok", "ok", "ok"}},
		{"open-first", []string{"openError", "ok"}},
		{"open-later", []string{"ok", "ok", "openError", "ok"}},
		{"scan-first", []string{"scanError", "ok"}},
		{"scan-later", []string{"ok", "ok", "scanError", "ok"}},
	}
	for _, c := range cases {
		opened, scans, failScanAt = nil, []int{}, 0
		var paths []string
		for i, outcome := range c.inputs {
			p := path
			switch outcome {
			case "openError":
				p = filepath.Join(root, "absent")
			case "scanError":
				failScanAt = i + 1
			}
			paths = append(paths, p)
		}
		err := processFiles(paths)
		status := "ok"
		switch {
		case errors.Is(err, os.ErrNotExist):
			status = "openError"
		case errors.Is(err, scanError):
			status = "scanError"
		case err != nil:
			t.Fatal(err)
		}
		live, err := countLive()
		if err != nil {
			t.Fatal(err)
		}
		row, err := json.Marshal(observation{c.name, c.inputs, scans, live, status})
		if err != nil {
			t.Fatal(err)
		}
		fmt.Println("OBS", string(row))
	}
}
