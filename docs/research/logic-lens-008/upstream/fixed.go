//go:build go1.22

package worker

import "sync"

// fanOut starts one goroutine per id and waits for all of them.
//
// Under Go 1.22+ each loop iteration has its OWN `id` variable (the loop-variable
// semantics changed in 1.22), so capturing `id` in the closure is safe — every
// goroutine sees its own value. This is NOT the pre-1.22 loop-variable capture bug,
// as the //go:build go1.22 constraint makes explicit.
func fanOut(ids []int, handle func(int)) {
	var wg sync.WaitGroup
	for _, id := range ids {
		wg.Add(1)
		go func() {
			defer wg.Done()
			handle(id)
		}()
	}
	wg.Wait()
}
