const button = document.createElement("button");
button.textContent = "ATC";
button.classList.add("mdl-button", "mdl-js-button", "mdl-button--raised", "geofs-f-standard-ui");
button.setAttribute("data-upgraded", ",MaterialButton");
const bottomDiv = document.querySelector(".geofs-ui-bottom");
bottomDiv.appendChild(button);
button.addEventListener("click", openChat);

let script1 = document.createElement('script');
script1.src="https://www.gstatic.com/firebasejs/9.9.0/firebase-app-compat.js";
document.head.appendChild(script1);
let script2 = document.createElement('script');
script2.src="https://www.gstatic.com/firebasejs/9.9.0/firebase-database-compat.js";
document.head.appendChild(script2);

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDPbJrbz-QBUw8aY2kvZLi-h4rVDDV26_A",
    authDomain: "atcchatpopup.firebaseapp.com",
    databaseURL: "https://atcchatpopup-default-rtdb.firebaseio.com",
    projectId: "atcchatpopup",
    storageBucket: "atcchatpopup.appspot.com",
    messagingSenderId: "495140373446",
    appId: "1:495140373446:web:d127215cab6676793d68c7",
    measurementId: "G-LWLS6C06R2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Inject styles and HTML
const style = document.createElement('style');
style.innerHTML = `
    /* Popup container */
    .popup {
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: 3px solid #666;
        z-index: 9;
        background-color: white;
        width: 400px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        overflow: hidden;
    }

    /* Popup header */
    .popup-header {
        padding: 15px;
        text-align: center;
        background: #333;
        color: white;
        font-size: 18px;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    /* Popup chat window */
    .popup-body {
        font-family: Arial, sans-serif;
        height: 300px;
        overflow-y: auto;
        padding: 10px;
        background: #f1f1f1;
    }

    .popup-body input[type="text"] {

        padding: 10px;
        border: none;
        border-radius: 5px;
        margin-bottom: 10px;
    }

    /* Popup footer */
    .popup-footer {
        padding: 10px;
        background: #333;
        color: white;
        text-align: center;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
    }

    /* Message input */
    .popup-footer input[type="text"] {
        width: 80%;
        padding: 10px;
        border: none;
        border-radius: 5px;
    }

    /* Send button */
    .popup-footer button {
        padding: 10px 15px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    /* Open button */
    .open-button {
        position: fixed;
        bottom: 15px;
        right: 15px;
        background-color: #555;
        color: white;
        padding: 10px 15px;
        border: none;
        cursor: pointer;
        border-radius: 5px;
    }

    /* Online users */
    .online-users {
        font-family: Arial, sans-serif;
        padding: 10px;
        background: #fff;
        border-top: 1px solid #ccc;
        text-align: left;
    }

    .popup-atc-map {
        width: 100%;
        height: 300px;
    }
    
    .popup-atc-map iframe {
        width: 100%;
        height: 100%;
    }
`;
document.head.appendChild(style);

const popupHTML = `
    <div class="popup" id="chatPopup">
        <div>
            <div class="popup-header">
            ATC Chat Room
            </div>
            <div class="popup-body" id="chatBody">
                <!-- Messages will appear here -->
            </div>
            <div class="popup-footer">
                <input type="text" id="messageInput" placeholder="Type your message...">
                <button onclick="sendMessage()">Send</button>
            </div>
            <div class="online-users" id="onlineUsers">
                <!-- Online users will appear here -->
            </div>
        </div>
        <div class="popup-atc-map">
            <iframe src="https://www.geo-fs.com/pages/map.php" frameborder="0"></iframe>
        </div>
    </div>
    
    <div class="popup" id="namePopup">
        <div class="popup-header">
            Enter Your Name
        </div>
        <div class="popup-body">
            <input type="text" id="nameInput" placeholder="Type your name...">
        </div>
        <div class="popup-footer">
            <button onclick="setName()">Submit</button>
        </div>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', popupHTML);

let userName = null;
let userId = null;

function setName() {
    const input = document.getElementById("nameInput");
    const name = input.value.trim();
    if (name) {
        nameWithCapital_letter_at_start = name.charAt(0).toUpperCase() + name.slice(1);
        userName = nameWithCapital_letter_at_start;
        userId = database.ref('onlineUsers').push().key;
        database.ref('onlineUsers/' + userId).set(userName);
        document.getElementById("namePopup").style.display = "none";
        document.getElementById("chatPopup").style.display = "block";
        loadMessages();
        loadOnlineUsers();
    }
}

function openChat() {
    document.getElementById("namePopup").style.display = "block";
}

function loadMessages() {
    const chatBody = document.getElementById("chatBody");
    chatBody.innerHTML = "";
    database.ref('messages').on('child_added', function(snapshot) {
        const message = snapshot.val();
        const messageElement = document.createElement("div");
        messageElement.textContent = `${message.sender}: ${message.text}`;
        chatBody.appendChild(messageElement);
        chatBody.scrollTop = chatBody.scrollHeight;
    });
}

function loadOnlineUsers() {
    const onlineUsers = document.getElementById("onlineUsers");
    onlineUsers.innerHTML = "<strong>Online Users:</strong><br>";
    database.ref('onlineUsers').on('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const user = childSnapshot.val();
            const userElement = document.createElement("div");
            userElement.textContent = user;
            onlineUsers.appendChild(userElement);
        });
    });
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value;
    if (message.trim() === "") return;

    database.ref('messages').push({
        sender: userName,
        text: message
    });

    input.value = "";
}

window.addEventListener("beforeunload", function() {
    if (userId) {
        database.ref('onlineUsers/' + userId).remove();
    }
});