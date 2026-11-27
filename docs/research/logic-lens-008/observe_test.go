package worker

import (
	"encoding/json"
	"fmt"
	"runtime"
	"slices"
	"sync"
	"testing"
)

type observation struct {
	Workers int   `json:"gomaxprocs"`
	Input   []int `json:"input"`
	Done    []int `json:"completed_at_return_sorted"`
}

func TestFanOut(t *testing.T) {
	for _, workers := range []int{1, 4} {
		old := runtime.GOMAXPROCS(workers)
		for _, ids := range [][]int{{}, {7}, {1, 2}, {3, 7, 3, 9}, {-1, -1, -1}, {8, 2, 8, -1}} {
			entered := make(chan struct{}, len(ids))
			release := make(chan struct{})
			returned := make(chan []int, 1)
			var mu sync.Mutex
			done := []int{}
			go func() {
				fanOut(ids, func(id int) {
					entered <- struct{}{}
					<-release
					mu.Lock()
					defer mu.Unlock()
					done = append(done, id)
				})
				mu.Lock()
				returned <- slices.Clone(done)
				mu.Unlock()
			}()
			for range ids {
				select {
				case <-entered:
				case <-returned:
					t.Fatal("fanOut returned before all callbacks entered")
				}
			}
			close(release)
			completed := <-returned
			// Callback order can change on every run. Retain multiplicities.
			slices.Sort(completed)
			row, err := json.Marshal(observation{workers, ids, completed})
			if err != nil {
				t.Fatal(err)
			}
			fmt.Println("OBS", string(row))
		}
		runtime.GOMAXPROCS(old)
	}
}
