package worker

import (
	"fmt"
	"slices"
	"sync"
	"testing"
)

func TestObservation(t *testing.T) {
	ids := []int{8, 2, 8, -1}
	var mu sync.Mutex
	var got []int
	fanOut(ids, func(id int) {
		mu.Lock()
		defer mu.Unlock()
		got = append(got, id)
	})
	slices.Sort(got)
	fmt.Println("ids", got)
}
