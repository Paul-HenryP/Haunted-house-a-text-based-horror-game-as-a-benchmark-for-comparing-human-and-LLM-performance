// Game state
let playerPosition = "C1";
let keyPosition = "A1";
let ghostPosition = "B2"; // Ghost starts at B2 during the key-finding phase.
let doorPosition = null; // Initially, there is no door.
let hasKey = false;
let gameOver = false;
let layoutChanged = false; // Indicates if the layout has changed.
let ghostMovementComplete = false; // Indicates if the ghost has stopped moving.
let ghostBlockedDoor = false; // Indicates if the ghost has blocked the door in A3.
let ghostAlreadyMovedDownOnce = false; //Ghost has already moved down once.

// Process player's command.
function processCommand() {
    if (gameOver) return;

    const command = document.getElementById("command").value.trim().toUpperCase();
    movePlayer(command);
    document.getElementById("command").value = "";
}

// Move player to the specified room code
function movePlayer(targetRoom) {
    const validRooms = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"];

    // Check if the target room is a valid room
    if (validRooms.includes(targetRoom)) {
        // Check if the target room is adjacent to the current room
        if (isNearby(targetRoom)) {
            playerPosition = targetRoom;
            checkRoom();
        } else {
            displayMessage("You can't move directly to " + targetRoom + ". It is not adjacent to your current position.");
        }
    } else {
        displayMessage("Invalid room code. Please enter a valid room code (e.g., A1, B2).");
    }
}

// Check current room status
function checkRoom() {
    if (playerPosition === ghostPosition) {
        displayMessage("Game over - You encountered the ghost!");
        gameOver = true;
        return;
    }

    if (playerPosition === keyPosition) {
        displayMessage("You found the key!");
        hasKey = true;
        keyPosition = null; // Removes the key from the room
        return;
    }

    // Check if the player has reached the door at A3
    if (playerPosition === "A3") {
        if (ghostBlockedDoor) {
            displayMessage("You have reached the door at, but it was blocked by the ghost and it killed you!");
            gameOver = true;
        } else {
            displayMessage("You have reached the door at A3! You can escape now.");
            // Optionally set game state to indicate victory
            gameOver = true; // Mark the game as over if needed
        }
        return;
    }

    if (playerPosition === "C1" && hasKey && !layoutChanged) {
        // Layout changes once the player returns to C1 with the key
        layoutChanged = true;
        doorPosition = "A3"; // Move the door to A3
        displayMessage("The layout of the house has changed. The door has moved to room A3.");
    } else if ((playerPosition === "B1" || playerPosition === "C2") && layoutChanged && !ghostMovementComplete && !ghostAlreadyMovedDownOnce) {
        // Move the ghost down by one room when the player reaches C2 or B1 after layout change
        if (ghostPosition === "B2") {
            ghostPosition = "B3";
            ghostAlreadyMovedDownOnce = true;
        } 
        displayMessage("The ghost has moved down from its previous location.");

    } else if (playerPosition === "A2" && layoutChanged && !ghostMovementComplete && !ghostBlockedDoor) {
        // Move the ghost left by one room when the player reaches A2 (ghost blocks the door)
        ghostPosition = "A3";
        ghostBlockedDoor = true; // Updates the flag since the ghost is now at A3.
        displayMessage("The ghost has moved one room to the left. (Blocked the door)");
    } else if ((playerPosition === "A1" || playerPosition === "B2") && layoutChanged && ghostBlockedDoor && !ghostMovementComplete) {
        // Move the ghost two rooms to the right when the player moves from A1 or B2
        ghostBlockedDoor = false;// Updates the flag since the ghost is now not at A3.
        if (ghostPosition === "A2") {
            ghostPosition = "C2"; // Move the ghost from A2 to C2
        } else if (ghostPosition === "A3") {
            ghostPosition = "C3"; // Move the ghost from A3 to C3
        }
        displayMessage("The ghost has moved two rooms to the right. (Final move)");
        ghostMovementComplete = true; // The ghost will no longer move after this
    }
    // Checks for nearby entities if no special event has occurred
    checkForNearbyEntities();
}

// Check if there are nearby entities (ghost or key)
function checkForNearbyEntities() {
    let messages = [];
    if (isNearby(ghostPosition) && !layoutChanged) {
        messages.push("There's a ghost nearby.");
    }
    if (isNearby(keyPosition) && !hasKey) {
        messages.push("There's a key nearby.");
    }
    if (messages.length > 0) {
        displayMessage(messages.join(" ") + " You are currently in: " + playerPosition);
    } else {
        displayMessage("Nothing of interest here. You are currently in: " + playerPosition);
    }
}

// Check if a position is adjacent
function isNearby(position) {
    const adjacentRooms = {
        "A1": ["A2", "B1"], "B1": ["A1", "B2", "C1"], "C1": ["B1", "C2"],
        "A2": ["A1", "A3", "B2"], "B2": ["B1", "B3", "A2", "C2"], "C2": ["B2", "C3", "C1"],
        "A3": ["A2", "B3"], "B3": ["A3", "B2", "C3"], "C3": ["B3", "C2"]
    };
    return position && adjacentRooms[playerPosition].includes(position);
}

// Display a message
function displayMessage(msg) {
    const output = document.getElementById("output");
    output.innerHTML = "<p>" + msg + "</p>" + output.innerHTML;
}
