A and B are request handles sharing one read. A cancels before completion, while B still asks for a result. The supplied handoff omits the ownership and cancellation policy for these handles.
