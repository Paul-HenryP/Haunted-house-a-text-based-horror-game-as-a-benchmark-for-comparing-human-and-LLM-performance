// Event listener for the "Enter" key.
document.getElementById("command").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        processCommand(); // Calls the function when Enter is pressed.
    }
});

document.addEventListener("DOMContentLoaded", function() {
    // Hide main content initially
    document.getElementById('main').style.display = 'none';
    document.getElementById('footer').style.display = 'none';
});

// Initializes the leaderboard display when the page loads.
window.onload = function() {
    updateLeaderboardDisplay();
};


// Game state.
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
let stepCount = 0; // Tracks the number of steps taken by the player.


// Mapping of rooms and their directional neighbors
const roomMap = {
    "A1": { up: null, down: "A2", left: null, right: "B1" },
    "A2": { up: "A1", down: "A3", left: null, right: "B2" },
    "A3": { up: "A2", down: null, left: null, right: "B3" },
    "B1": { up: null, down: "B2", left: "A1", right: "C1" },
    "B2": { up: "B1", down: "B3", left: "A2", right: "C2" },
    "B3": { up: "B2", down: null, left: "A3", right: "C3" },
    "C1": { up: null, down: "C2", left: "B1", right: null },
    "C2": { up: "C1", down: "C3", left: "B2", right: null },
    "C3": { up: "C2", down: null, left: "B3", right: null }
};

// Processes player's command.
function processCommand() {
    if (gameOver) return;

    // Records the start time if the game is starting.
    if (!startTime) {
        startTime = new Date(); // Records the current time when the first move is made.
    }

    const command = document.getElementById("command").value.trim().toLowerCase();
    movePlayerByDirection(command);
    document.getElementById("command").value = "";
}

// Moves the player based on the direction.
function movePlayerByDirection(direction) {
    if (!["up", "down", "left", "right"].includes(direction)) {
        displayMessage("Invalid direction. Please enter 'up', 'down', 'left', or 'right'.");
        return;
    }

    const newRoom = roomMap[playerPosition][direction];
    if (newRoom) {
        playerPosition = newRoom;
        stepCount++; // Increments step count.
        checkRoom();
    } else {
        displayMessage("You can't move " + direction + " from here.");
    }
}

function endGame(message) {
    gameOver = true;

    // Records the end time.
    endTime = new Date();

    // Calculates the total time taken.
    const timeTaken = (endTime - startTime) / 1000; // Time in seconds.

    // Combines the game result, time taken, and step count into a single message.
    const finalMessage = `${message} Total time taken: ${timeTaken.toFixed(2)} seconds. Steps taken: ${stepCount}.`;

    // Checks if the game was won or lost.
    const isSuccess = message.includes("escaped the haunted house");

    // Displays the final message with the success-message class if the game was won.
    displayMessage(finalMessage, isSuccess ? "success-message" : null);

    // Saves the score to the leaderboard only if the player escaped successfully.
    if (isSuccess) {
        saveScore(timeTaken, stepCount);
        updateLeaderboardDisplay();
    }
}



// Saves the score to the leaderboard.
function saveScore(timeTaken, steps) {
    // Get the existing leaderboard from localStorage, or start with an empty array.
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // Formats the date in European style (DD.MM.YYYY HH:MM).
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed.
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const formattedDate = `${day}.${month}.${year} ${hours}:${minutes}`;

    // Adds the new score to the leaderboard.
    leaderboard.push({ time: timeTaken.toFixed(2), steps: steps, date: formattedDate });

    // Sorts the leaderboard by time in ascending order (fastest times first).
    leaderboard.sort((a, b) => a.time - b.time);

    // Keep sonly the top 5 scores.
    leaderboard = leaderboard.slice(0, 5);

    // Saves the updated leaderboard back to localStorage.
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}


// Displays the leaderboard.
function updateLeaderboardDisplay() {
    // Gets the leaderboard data from localStorage
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // Gets the leaderboard element
    const leaderboardElement = document.getElementById("leaderboard");

    // Clears the existing leaderboard display
    leaderboardElement.innerHTML = "<h2>Leaderboard</h2>";

    // Adds each score to the leaderboard display
    leaderboard.forEach((entry, index) => {
        const scoreItem = document.createElement("p");
        scoreItem.textContent = `${index + 1}. Time: ${entry.time} seconds, Steps: ${entry.steps}, Date: ${entry.date}`;
        leaderboardElement.appendChild(scoreItem);
    });
}



// Moves player to the specified room code.
function movePlayer(targetRoom) {
    const validRooms = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"];

    // Checks if the target room is a valid room.
    if (validRooms.includes(targetRoom)) {
        // Checks if the target room is adjacent to the current room.
        if (isNearby(targetRoom)) {
            playerPosition = targetRoom;
            stepCount++; // Increment.
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
    let message = "";

    if (playerPosition === ghostPosition) {
        endGame("Game over - You encountered the ghost!");
        return;
    }

    if (playerPosition === keyPosition) {
        message += "You found the key! ";
        hasKey = true;
        keyPosition = null; // Removes the key from the room.
    }

    if (playerPosition === "A3") {
        if (ghostBlockedDoor) {
            endGame("You have reached the door, but it was blocked by the ghost and it killed you!");
        } else if (!layoutChanged) {
            message += "Nothing of interest here.";
        } else {
            endGame("Congratulations! You have reached the door at A3 and escaped the haunted house!");
        }
        displayMessage(message);
        return;
    }

    if (playerPosition === "C1" && hasKey && !layoutChanged) {
        // Layout changes once the player returns to C1 with the key.
        layoutChanged = true;
        doorPosition = "A3"; // Moves the door to A3.
        message += "The layout of the house has changed. The door has moved to the room that is of maximum distance from your current location. ";
    } else if ((playerPosition === "B1" || playerPosition === "C2") && layoutChanged && !ghostMovementComplete && !ghostAlreadyMovedDownOnce) {
        // Moves the ghost down by one room when the player reaches C2 or B1 after layout change.
        if (ghostPosition === "B2") {
            ghostPosition = "B3";
            ghostAlreadyMovedDownOnce = true;
            message += "The ghost has moved down one room from its previous location.";
        }
    } else if (playerPosition === "A2" && layoutChanged && !ghostMovementComplete && !ghostBlockedDoor) {
        // Moves the ghost left by one room when the player reaches A2 (ghost blocks the door).
        ghostPosition = "A3";
        ghostBlockedDoor = true; // Updates the flag since the ghost is now at A3.
        message += "The ghost has moved one room to the left.";
    } else if ((playerPosition === "A1" || playerPosition === "B2") && layoutChanged && ghostBlockedDoor && !ghostMovementComplete) {
        // Move the ghost two rooms to the right when the player moves from A1 or B2.
        ghostBlockedDoor = false; // Updates the flag since the ghost is now not at A3.
        if (ghostPosition === "A2") {
            ghostPosition = "C2"; // Move the ghost from A2 to C2.
        } else if (ghostPosition === "A3") {
            ghostPosition = "C3"; // Move the ghost from A3 to C3.
        }
        message += "The ghost has moved two rooms to the right. ";
        ghostMovementComplete = true; // The ghost will no longer move after this.
    }

    // Checks for nearby entities if no special event has occurred.
    checkForNearbyEntities(message);
}

// Modified checkForNearbyEntities to accept a message parameter.
function checkForNearbyEntities(existingMessage) {
    let messages = [];
    if (isNearby(ghostPosition) && !layoutChanged) {
        messages.push("There's a ghost nearby. ");
    }
    if (isNearby(keyPosition) && !hasKey) {
        messages.push("There's a key nearby. ");
    }
    let combinedMessage = existingMessage + " " + messages.join(" ").trim();
    if (combinedMessage.trim()) {
        displayMessage(combinedMessage);
    } else {
        displayMessage("Nothing of interest here. ");
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

// Displays the messages with an optional additional class.
function displayMessage(msg, extraClass = null) {
    if (!msg || !msg.trim()) return; // Do nothing if the message is empty or just whitespace.

    const output = document.getElementById("output");

    // Clears the existing highlight for older messages.
    Array.from(output.children).forEach(child => {
        child.classList.remove("latest-message");
    });

    // Creates a new message element and add the latest-message class.
    const newMessage = document.createElement("p");
    newMessage.innerHTML = msg;
    newMessage.classList.add("latest-message");

    // If an extra class is provided (e.g., "success-message"), adds it.
    if (extraClass) {
        newMessage.classList.add(extraClass);
    }

    // Adds the new message to the top of the output.
    output.prepend(newMessage);
}

//languageModal
function redirectEstonian() {
    window.location.href = "est.html"; // Replace with the Estonian version URL
}

function closeModal() {
    document.getElementById('languageModal').style.display = 'none';
    document.getElementById('main').style.display = 'block'; // Shows stuff.
    document.getElementById('footer').style.display = 'block';
}
