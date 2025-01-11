// Event listener for the "Enter" key.
document.getElementById("command").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        processCommand();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    // Hides the main content initially before the language selection.
    
    document.getElementById('main').style.display = 'none';
    document.getElementById('footer').style.display = 'none';
    /*
    const instructionContent = document.getElementById("instructionContent");
    const toggleButton = document.getElementById("toggleInstructions");

    // Toggle the 'open' class to expand content.
    instructionContent.classList.toggle("open");
    toggleButton.classList.toggle("open");
    */
});

// Initializes the leaderboard display when the page loads.
window.onload = function() {
    updateLeaderboardDisplay();
};

// Event listener for the "Copy Log" button.
document.getElementById('copyLogButton').addEventListener('click', copyLogToClipboard);


//To collapse instructions.
/*
function toggleInstructions() {
    const instructionContent = document.getElementById("instructionContent");
    const toggleButton = document.getElementById("toggleInstructions");

    // Toggles the 'open' class to collapse/expand content.
    instructionContent.classList.toggle("open");
    toggleButton.classList.toggle("open");

    if (instructionContent.classList.contains("open")) {
        instructionContent.style.maxHeight = instructionContent.scrollHeight + "px";
    } else {
        instructionContent.style.maxHeight = "0";
    }
}
*/
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
let moveLog = []; // Tracks the player's moves.


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

function copyLogToClipboard() {
    // Gets the moves log content.
    const movesLogContent = document.getElementById('movesLogContent').innerText;
    // Creates a temporary textarea element.
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = movesLogContent;
    document.body.appendChild(tempTextArea);
    // Selects the text and copy it to the clipboard.
    tempTextArea.select();
    document.execCommand('copy');
    // Removes the temporary textarea element.
    document.body.removeChild(tempTextArea);
    // Displays a message indicating that the log has been copied.
    alert('Moves log copied to clipboard!');
}

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
        moveLog.push(`Moved ${direction} to ${newRoom}`); // Logs the move.
        playerPosition = newRoom;
        stepCount++;
        checkRoom();
    } else {
        moveLog.push(`Attempted to move ${direction} but hit a wall.`); // Logs invalid move.
        stepCount++;
        displayMessage("You cannot move there. ");
    }
}

// Saves the score to the leaderboard.
function saveScore(timeTaken, steps) {
    // Get the existing leaderboard from localStorage, or start with an empty array.
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // Formats the date in European style.
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
    // Gets the leaderboard data from localStorage.
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    // Gets the leaderboard element.
    const leaderboardElement = document.getElementById("leaderboard");

    // Clears the existing leaderboard display.
    leaderboardElement.innerHTML = "<h2>Leaderboard</h2>";

    // Adds each score to the leaderboard display.
    leaderboard.forEach((entry, index) => {
        const scoreItem = document.createElement("p");
        scoreItem.textContent = `${index + 1}. Time: ${entry.time} seconds, Steps: ${entry.steps}, Date: ${entry.date}`;
        leaderboardElement.appendChild(scoreItem);
    });
}

// Moves player to the specified room code. (Old function)
/*
function movePlayer(targetRoom) {
    const validRooms = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"];

    // Checks if the target room is a valid room.
    if (validRooms.includes(targetRoom)) {
        // Checks if the target room is adjacent to the current room.
        if (isNearby(targetRoom)) {
            playerPosition = targetRoom;
            stepCount++;
            checkRoom();
        } else {
            stepCount++;
            displayMessage("You cannot move there. ");
        }
    } else {
        displayMessage("Invalid room code. Please enter a valid room code (up, down, left or right). "); //old, consider removal.
    }
}
*/

// Checks current room status.
function checkRoom() {
    let message = "";

    if (playerPosition === ghostPosition) {
        endGame("Game over - You encountered the ghost!");
        return;
    }

    if (playerPosition === keyPosition) {
        message += "You found the key! You will no longer be warned when a ghost is nearby.";
        hasKey = true;
        keyPosition = null; // Removes the key from the room.
    }

    if (playerPosition === "A3") {
        if (ghostBlockedDoor) {
            endGame("Game over - You encountered the ghost!");
        } else if (!layoutChanged) {
            message += "There’s nothing of interest here.";
        } else {
            endGame("Congratulations - You have escaped the haunted house!");
        }
        displayMessage(message);
        return;
    }

    if (playerPosition === "C1" && hasKey && !layoutChanged) {
        // Layout changes once the player returns to C1 with the key.
        layoutChanged = true;
        doorPosition = "A3"; // Moves the door to A3.
        message += "The layout of the house has changed. The door has moved to the location that is the maximum distance from your current room. ";
    } else if ((playerPosition === "B1" || playerPosition === "C2") && layoutChanged && !ghostMovementComplete && !ghostAlreadyMovedDownOnce) {
        // Moves the ghost down by one room when the player reaches C2 or B1 after layout change.
        if (ghostPosition === "B2") {
            ghostPosition = "B3";
            ghostAlreadyMovedDownOnce = true;
            message += "The ghost has moved one room down. ";
        }
    } else if (playerPosition === "A2" && layoutChanged && !ghostMovementComplete && !ghostBlockedDoor) {
        // Moves the ghost left by one room when the player reaches A2 (ghost blocks the door).
        ghostPosition = "A3";
        ghostBlockedDoor = true; // Updates the flag since the ghost is now at A3.
        message += "The ghost has moved one room left. ";
    } else if ((playerPosition === "A1" || playerPosition === "B2") && layoutChanged && ghostBlockedDoor && !ghostMovementComplete) {
        // Move the ghost two rooms to the right when the player moves from A1 or B2.
        ghostBlockedDoor = false; // Updates the flag.
        if (ghostPosition === "A2") {
            ghostPosition = "C2"; // Move the ghost from A2 to C2.
        } else if (ghostPosition === "A3") {
            ghostPosition = "C3"; // Move the ghost from A3 to C3.
        }
        message += "The ghost has moved two rooms right. ";
        ghostMovementComplete = true; // The ghost will no longer move after this.
    }

    // Checks for nearby entities if no special event has occurred.
    checkForNearbyEntities(message);
}

// Modified checkForNearbyEntities to accept a message parameter.
function checkForNearbyEntities(existingMessage) {
    let messages = [];
    if (isNearby(ghostPosition) && !layoutChanged && !hasKey) {
        messages.push("There’s a ghost nearby. ");
    }
    if (isNearby(keyPosition) && !hasKey) {
        messages.push("There’s a key nearby. ");
    }
    let combinedMessage = existingMessage + " " + messages.join(" ").trim();
    if (combinedMessage.trim()) {
        displayMessage(combinedMessage);
    } else {
        displayMessage("There’s nothing of interest here. ");
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

// LanguageModal link redirection.
function redirectEstonian() {
    window.location.href = "est.html";
}

// Function to open the moves log modal.
function openMovesLogModal() {
    // Populates the moves log content.
    var movesLogContent = document.getElementById('movesLogContent');
    movesLogContent.innerHTML = ''; // Clears previous content.

    moveLog.forEach(move => {
        var logEntry = document.createElement('p');
        logEntry.textContent = move;
        movesLogContent.appendChild(logEntry);
    });

    // Displays the modal.
    modal.style.display = 'block';
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

    openMovesLogModal();
}

var modal = document.getElementById('movesLogModal');
// Get the <span> element that closes the modal.
var span = document.getElementsByClassName('close')[0];
// When the user clicks on <span> (x), closes the modal.
span.onclick = function() {
    modal.style.display = 'none';
}

// When the user clicks anywhere outside of the modal, closes it.
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Shows the page after language is selected.
function closeModal() {
    document.getElementById('languageModal').style.display = 'none';
    document.getElementById('main').style.display = 'block';
    document.getElementById('footer').style.display = 'block';
}
