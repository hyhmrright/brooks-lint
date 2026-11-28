package fileutil

import "os"

// processFiles scans each path in turn. Called with batches that can be thousands of paths.
func processFiles(paths []string) error {
	for _, p := range paths {
		if err := processOne(p); err != nil {
			return err
		}
	}
	return nil
}

// processOne opens, scans, and closes a single file. The defer runs at THIS function's
// return — i.e. per iteration — so at most one descriptor is held open at a time.
func processOne(p string) error {
	f, err := os.Open(p)
	if err != nil {
		return err
	}
	defer f.Close()
	return scan(f)
}
