# HC-03: visible contract

The supplied launch function yields during preparation and may acquire a slot afterward. A signal can abort while the gate is pending. The caller has not supplied whether cancellation during preparation invalidates later admission, or is only a notification that applies after work starts. Slot count and listener behavior are observable, but the accepted-work ownership and cancellation policy are absent. No unseen caller contract is a supplied fact.
