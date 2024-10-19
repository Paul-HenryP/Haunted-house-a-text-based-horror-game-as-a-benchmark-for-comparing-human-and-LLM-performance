// Event listener for the "Enter" key.
document.getElementById("command").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        processCommand(); // Calls the function when Enter is pressed.
    }
});
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
let startTime = null; // Tracks the start time of the game.
let endTime = null;   // Tracks the end time of the game.


// Process player's command.
function processCommand() {
    if (gameOver) return;

    // Records the start time if the game is starting.
    if (!startTime) {
        startTime = new Date(); // Records the current time when the first move is made.
    }

    const command = document.getElementById("command").value.trim().toUpperCase();
    movePlayer(command);
    document.getElementById("command").value = "";
}

function endGame(message) {
    gameOver = true;

    // Record the end time
    endTime = new Date();

    // Calculate the total time taken
    const timeTaken = (endTime - startTime) / 1000; // Time in seconds

    // Combine the game result and time taken into a single message
    const finalMessage = `${message} Total time taken: ${timeTaken.toFixed(2)} seconds.`;
    displayMessage(finalMessage);
}



// Moves player to the specified room code.
function movePlayer(targetRoom) {
    const validRooms = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"];

    // Checks if the target room is a valid room.
    if (validRooms.includes(targetRoom)) {
        // Checks if the target room is adjacent to the current room.
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

// Checks current room status.
function checkRoom() {
    if (playerPosition === ghostPosition) {
        endGame("Game over - You encountered the ghost!");
        return;
    }

    if (playerPosition === keyPosition) {
        displayMessage("You found the key!");
        hasKey = true;
        keyPosition = null; // Removes the key from the room.
        return;
    }

    // Check if the player has reached the door at A3.
    if (playerPosition === "A3") {
        if (ghostBlockedDoor) {
            endGame("You have reached the door, but it was blocked by the ghost and it killed you!");
        } else {
        endGame("Congratulations! You have reached the door at A3 and escaped the haunted house!");
        }
        return;
    }

    if (playerPosition === "C1" && hasKey && !layoutChanged) {
        // Layout changes once the player returns to C1 with the key.
        layoutChanged = true;
        doorPosition = "A3"; // Moves the door to A3.
        displayMessage("The layout of the house has changed. The door has moved to room A3.");
    } else if ((playerPosition === "B1" || playerPosition === "C2") && layoutChanged && !ghostMovementComplete && !ghostAlreadyMovedDownOnce) {
        // Moves the ghost down by one room when the player reaches C2 or B1 after layout change.
        if (ghostPosition === "B2") {
            ghostPosition = "B3";
            ghostAlreadyMovedDownOnce = true;
        } 
        displayMessage("The ghost has moved down from its previous location.");

    } else if (playerPosition === "A2" && layoutChanged && !ghostMovementComplete && !ghostBlockedDoor) {
        // Move the ghost left by one room when the player reaches A2 (ghost blocks the door).
        ghostPosition = "A3";
        ghostBlockedDoor = true; // Updates the flag since the ghost is now at A3.
        displayMessage("The ghost has moved one room to the left. (Blocked the door)");
    } else if ((playerPosition === "A1" || playerPosition === "B2") && layoutChanged && ghostBlockedDoor && !ghostMovementComplete) {
        // Move the ghost two rooms to the right when the player moves from A1 or B2.
        ghostBlockedDoor = false;// Updates the flag since the ghost is now not at A3.
        if (ghostPosition === "A2") {
            ghostPosition = "C2"; // Move the ghost from A2 to C2.
        } else if (ghostPosition === "A3") {
            ghostPosition = "C3"; // Move the ghost from A3 to C3.
        }
        displayMessage("The ghost has moved two rooms to the right. (Final move)");
        ghostMovementComplete = true; // The ghost will no longer move after this.
    }
    // Checks for nearby entities if no special event has occurred.
    checkForNearbyEntities();
}

// Checks if there are nearby entities (ghost or key).
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

// Checks if a position is adjacent.
function isNearby(position) {
    const adjacentRooms = {
        "A1": ["A2", "B1"], "B1": ["A1", "B2", "C1"], "C1": ["B1", "C2"],
        "A2": ["A1", "A3", "B2"], "B2": ["B1", "B3", "A2", "C2"], "C2": ["B2", "C3", "C1"],
        "A3": ["A2", "B3"], "B3": ["A3", "B2", "C3"], "C3": ["B3", "C2"]
    };
    return position && adjacentRooms[playerPosition].includes(position);
}

// Displays the messages.
function displayMessage(msg) {
    const output = document.getElementById("output");

    // Clear the existing highlight for older messages
    Array.from(output.children).forEach(child => {
        child.classList.remove("latest-message");
    });

    // Create a new message element and add the latest-message class
    const newMessage = document.createElement("p");
    newMessage.innerHTML = msg;
    newMessage.classList.add("latest-message");

    // Add the new message to the top of the output
    output.prepend(newMessage);
}

