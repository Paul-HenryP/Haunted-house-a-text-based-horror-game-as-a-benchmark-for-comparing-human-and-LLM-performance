# ghost-house-experiment

## Current bugs:

-  After the key finding phase the player moves: C1->C2 (ghost moves 1 down: correct), C2->B2 (The gost moves 2 rooms to the right: wrong, the ghost should move 2 rooms to the right only when the player has ended up in A2 (and Ghost blocks the door on A3)->Player moves to A1 OR B2 and THEN the ghost makes the final move two rooms right.)     

  The ghost should only move 2 rooms to the right IF( The player has reached A1 OR b2 AND the ghost has previously blocked the door AT A3 ) after which the ghost will not move ever again. (FIXED)

-  No notification when the player reaches the door.
