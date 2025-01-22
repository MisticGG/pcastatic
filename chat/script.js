// app.js

let socket = new WebSocket("wss://palegardenchatapp.uk/");
let lastSender = "";

// Clear the page and set up base styles
const recentMessages = new Map();

const userColors = {}; // Store assigned colors for each username

// Generate a color based on the username
function getColorForUsername(username) {
    if (!userColors[username]) {
        const colorHash = username
            .split('')
            .reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0);
        const color = `hsl(${Math.abs(colorHash) % 360}, 90%, 75%)`;
        userColors[username] = color;
    }
    return userColors[username];
}

// Notification permissions
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
        console.log(`Notification permission: ${permission}`);
    });
}

let canReceiveNotifications = true;

function showNotification(title, message) {
    if (!message.trim()) return;
    if (Notification.permission === "granted" && canReceiveNotifications) {
        new Notification(title, {
            body: message,
            icon: "",
        });
    }
}

// Get saved settings from localStorage
let username = sessionStorage.getItem("username"); // Default username
let password = sessionStorage.getItem("password")


function simulateLoadingProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        const loadingBar = document.getElementById("loadingBar");
        if (loadingBar) {
            loadingBar.style.width = `${progress}%`;
        }

        if (progress >= 100) {
            clearInterval(interval);
            const loadingScreen = document.getElementById("loadingScreen");
            const loadingScreenBg = document.getElementById("loadingScreenBg");
            if (loadingScreen) {
                loadingScreen.classList.add("fade-out");
                loadingScreenBg.classList.add("fade-out");
                setTimeout(() => {
                    loadingScreen.style.display = "none";
                    loadingScreenBg.style.display = "none"
                }, 500);
            }
        }
    }, 300);
}

// Handle WebSocket
socket.onopen = () => {
    socket.send(JSON.stringify({ action: "join", username: username, password: password }));
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.action === "load") {
        data.content.forEach((doc) => {
            addMessage(doc.username, doc.message);
        });
        simulateLoadingProgress();
    } else {
        const { ignore, count, kick } = shouldIgnoreMessage(data.username, data.message);

        if (!ignore) {
            addMessage(data.username, data.message);
        } else {
            updateLastMessage(data.username, data.message, count);
        }

        if (data.username !== username && !ignore) {
            showNotification(`${data.username}`, `${data.message}`);
        }

        if (kick) {
            const kickMessage = `/kick "${data.username}"`;
            socket.send(JSON.stringify({ action: "chat", username: username, message: kickMessage }));
        }
    }
};

socket.onerror = () => {
    console.error("WebSocket connection failed.");
    document.getElementById("loadingScreen").style.display = "none";
    document.getElementById("errorMessage").style.display = "block";
};

function reconnectWebSocket() {
    if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
    }

    console.log("Attempting to reconnect...");
    socket = new WebSocket("wss://palegardenchatapp.uk");

    socket.onopen = () => {
        console.log("Reconnected successfully!");
        socket.send(JSON.stringify({ action: "join", username: username, password: "1234" }));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.action === "load") {
            data.content.forEach((doc) => addMessage(doc.username, doc.message));
            simulateLoadingProgress();
        } else {
            addMessage(data.username, data.message);
            if (data.username !== username) {
                showNotification(`${data.username}`, `${data.message}`);
            }
        }
    };
}

function addMessage(user, msg) {
    const messageContainer = document.getElementById("messageContainer");

    // Create a container for each message
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    // Check if the last sender is the same as the current user
    const showUsername = lastSender !== user;

    if (showUsername) {
        // Create an element for the username
        const usernameSpan = document.createElement("span");
        usernameSpan.classList.add("username");
        usernameSpan.textContent = user;
        usernameSpan.style.color = getColorForUsername(user);

        // Append the username only if it's a new sender
        messageDiv.appendChild(usernameSpan);
    }

    // Create an element for the message text
    const messageText = document.createElement("p");
    messageText.classList.add("message-text");
    messageText.textContent = msg;

    // Append message text to the message container
    messageDiv.appendChild(messageText);
    messageContainer.appendChild(messageDiv);

    // Update the last sender
    lastSender = user;

    // Scroll to the bottom
    messageContainer.scrollTop = messageContainer.scrollHeight;
}


function updateLastMessage(user, msg, count) {
    const messageContainer = document.getElementById("messageContainer");
    const paragraphs = messageContainer.querySelectorAll("p");
    const lastMessage = paragraphs[paragraphs.length - 1];
    if (lastMessage && lastMessage.innerHTML.startsWith(`${user}: ${msg}`)) {
        lastMessage.innerHTML = `${user}: ${msg} (${count})`;
    }
}

document.getElementById("accountLink").addEventListener("click", () => {
    const newUsername = prompt("Enter your new username:", username);
    if (newUsername && newUsername.trim()) {
        username = newUsername.trim();
        sessionStorage.setItem("username", username);
        alert(`Username changed to: ${username}`);
        reconnectWebSocket();
    }
});



document.getElementById("reconnectLink").addEventListener("click", reconnectWebSocket);

document.getElementById("spamMessagesLink").addEventListener("click", () => {
    const messageCount = parseInt(prompt("How many messages do you want to send?"), 10);
    const messageContent = prompt("Enter the message content:");

    if (!isNaN(messageCount) && messageCount > 0 && messageContent.trim()) {
        for (let i = 0; i < messageCount; i++) {
            socket.send(JSON.stringify({ action: "chat", username: username, message: messageContent }));
        }
    } else {
        alert("Invalid input. Please try again.");
    }
});

function shouldIgnoreMessage(user, msg, threshold = 5000) {
    const currentTime = Date.now();
    const key = `${user}:${msg}`;

    if (lastSender !== user) {
        recentMessages.clear();
    }
    lastSender = user;

    if (recentMessages.has(key)) {
        const { count, timestamp } = recentMessages.get(key);
        if (currentTime - timestamp < threshold) {
            recentMessages.set(key, { count: count + 1, timestamp: currentTime });
            if (count + 1 > 100) {
                return { ignore: true, count: count + 1, kick: true };
            }
            return { ignore: true, count: count + 1, kick: false };
        }
    }

    recentMessages.set(key, { count: 1, timestamp: currentTime });

    recentMessages.forEach((value, msgKey) => {
        if (currentTime - value.timestamp > threshold) {
            recentMessages.delete(msgKey);
        }
    });

    return { ignore: false, count: 1, kick: false };
}

document.getElementById("messageForm").addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent the form from reloading the page
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (message) {
      socket.send(JSON.stringify({ action: "chat", username: username, message: message }));
      messageInput.value = ""; // Clear the input field
  }
});