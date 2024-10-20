# Spatial Navigation Task - The Haunted House

The "Haunted House" task is designed as a text-based game where players navigate a grid-like map representing the rooms of a haunted house. The players must move from the starting point (C1) room to room using simple commands (e.g., C2 or B1). The goal is to find an escape route while avoiding the ghost, which can end the game if encountered. The game collects data locally such as final time taken and number of moves to complete the task.

## In depth explanation of the game:

Objectives: 

(1) Find the key and get out of the house.

(2) avoid the room with the ghost. There’s only one ghost in the house and it doesn’t move unless described otherwise.

The layout of the house is a grid composed of 9 rooms in 3 rows and 3 columns. You start from the room that is in the first row and the third column. The door outside of the house is in your starting room.

Every room has a unique code. The codes are marked as follows: the rows are indicated by
numbers from 1-3, where the top row corresponds with the number 1, the middle row with the number 2, and the bottom row with the number 3. The columns are marked by letters A-B-C, where the first column from the left is marked by the letter A, the middle B, and the right one C. You will have to tell the code of the room that you want to move to. Each time you enter a new room, you might get a message, which you must keep in mind. The following messages can be displayed when you enter a new room:

M1 “There’s a ghost nearby” – one of the doors from this room leads to the ghost.

M2 “There’s a ghost and a key nearby” – you get this message when one of the doors from the room that you are in leads to the key and another one to the ghost. The key and the ghost are never in the same room. Keep in mind, you only get this message when both the key and the ghost are nearby.

M3 “You found the key” – this means you found the key.

M4 “Game over” – you went into the room with the ghost.

M5 Other – throughout the game, you can get other messages that you need to keep in mind.

## Rules

1. The player cannot move to rooms diagonally.
2. The player can only move one room at a time.
3. The ghost and the key are never in the same room.




## Current bugs:

-  none
