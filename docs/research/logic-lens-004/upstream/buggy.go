package fileutil

import "os"

// processFiles scans each path in turn. Called with batches that can be thousands of paths.
func processFiles(paths []string) error {
	for _, p := range paths {
		f, err := os.Open(p)
		if err != nil {
			return err
		}
		defer f.Close()
		if err := scan(f); err != nil {
			return err
		}
	}
	return nil
}
