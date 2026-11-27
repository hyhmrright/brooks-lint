//go:build go1.22

package worker

import "sync"

// Synthetic regression: release readers only after the final assignment.
func fanOut(ids []int, handle func(int)) {
	var wg sync.WaitGroup
	ready := make(chan struct{})
	var id int
	for _, id = range ids {
		wg.Add(1)
		go func() {
			defer wg.Done()
			<-ready
			handle(id)
		}()
	}
	close(ready)
	wg.Wait()
}
