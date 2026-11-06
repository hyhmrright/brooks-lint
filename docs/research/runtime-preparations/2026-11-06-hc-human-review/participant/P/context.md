# HC-01: visible contract

The request is cancelable throughout asynchronous preparation and work. An abort during the supplied preparation gate must prevent any slot acquisition or work start after that gate opens. A pre-aborted request also starts nothing. Work admitted without cancellation may finish normally; cancellation while running releases its one slot and listener. Use the supplied finite SlotPool and an actual awaited gate. This is a single-process synthetic lifecycle, not a production outage model.
