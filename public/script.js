// Connect to server , socket will be our individual connection
const socket = io();

let currentAuthenticatedUsername = null;
let currentCharacterSheet = null; // To store the user's sheet
// --- GET AUTH ELEMENTS ---
const authArea = document.getElementById('auth-area');
const loginUsernameInput = document.getElementById('loginUsername');
const loginPasswordInput = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginButton');
const registerUsernameInput = document.getElementById('registerUsername');
const registerPasswordInput = document.getElementById('registerPassword');
const registerButton = document.getElementById('registerButton');
const authErrorDisplay = document.getElementById('authError');
// Get App Elements
const playerNameInput = document.getElementById('playerName');
const charHPInput = document.getElementById('charHP');
const RollD20Button = document.getElementById('rollD20');
const rollResultDisplay = document.getElementById('rollResult');
const chatMessagesDiv = document.getElementById('chat-messages');
const chatInput = document.getElementById('chatInput');
const sendChatButton = document.getElementById('sendChat');
const appContainer = document.getElementById('app-container')
// Connection Test
console.log("Socket.IO script loaded, trying to connect...");
// Listen for connect
socket.on('connect',()=>{
    console.log(`Connected to server! Socket ID:`, socket.id);

});
// Listen for disconnect
socket.on('disconnect',()=>{
    console.log('Disconnected from server!');
});
// Listen for roll error
socket.on('roll error', (errorData) => {
    console.error('Roll Error:', errorData.message);
    addMessageToChat(`Error: ${errorData.message}`); // Display error in chat
    // Show error on display
    rollResultDisplay.textContent = `Error: ${errorData.message}`;
});
// Give chat history to new user
socket.on('chat history',(history)=>{
    chatMessagesDiv.innerHTML=''; // Clear current messages
    history.forEach(msg=>{
        if (msg.type === 'roll') {
            addMessageToChat(msg.text); // msg.text already formatted for rolls
        } else if (msg.type === 'chat' && msg.sender && msg.text) {
            addMessageToChat(`${msg.sender}: ${msg.text}`);
        } else if (msg.text) { // For simple system messages
             addMessageToChat(msg.text);
        }
    });
});

// Basic chat implement.
function addMessageToChat(message){
    const msgElement = document.createElement('p');
    msgElement.textContent = message;
    chatMessagesDiv.appendChild(msgElement);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight; // Autoscroll
}

sendChatButton.addEventListener('click',()=>{
    const message = chatInput.value.trim();
    const senderName = getPlayerName();
    if(message){
        // Send the message to server.
        socket.emit('client message',{sender:senderName,text:message});
        chatInput.value = ''; // Clear input
    }
});

// Add enter to send chat
chatInput.addEventListener('keydown',(event)=>{
    if(event.key === "Enter"){
        console.log("Enter key was pressed!");
        const senderName = getPlayerName();
        const message = chatInput.value.trim();
        if(message){
            socket.emit('client message',{sender:senderName,text:message});
            chatInput.value='' // Clear input
        }
    }
});

// Listen to messages from server
socket.on('server message',(msgData)=>{
    // Check msgData type
    if(typeof(msgData)==='string'){
        addMessageToChat(msgData);
    }
    else if(msgData && msgData.sender && msgData.text){
        addMessageToChat(`${msgData.sender}: ${msgData.text}`);
    }
    else if (msgData && msgData.text){
        addMessageToChat(msgData.text);
    }
});

// Func to get player name
function getPlayerName(){
    return currentAuthenticatedUsername || playerNameInput.value.trim() || `Player ${socket.id.substring(0,5)}`;
}

// Dice Roll 
RollD20Button.addEventListener('click',() =>{
    const rollerName = getPlayerName();
    const rollType = "1d20" // ill make it more dynamic later
    // Send to server
    console.log(`Emitting 'dice roll' event :${rollerName} rolls ${rollType}`);
    // Roll data
    socket.emit('dice roll',{
        rollerName: rollerName,
        rollString: rollType,
    });
});

// Listen to roll results from the server
socket.on('roll result',(data)=>{
    console.log(`Recieved 'roll result' event`,data);
    const message = `${data.rollerName} rolled ${data.rollString}: ${data.result}`;
    addMessageToChat(message);// Display in chat
    rollResultDisplay.textContent = `Last roll: ${data.rollerName} got ${data.result}`; // Update general display
});
socket.on('auth success', (authData) => { 
    console.log('Auth Success:', authData);
    currentAuthenticatedUsername = authData.username;
    currentCharacterSheet = authData.sheet; // Store the sheet
    // Update UI and disable editing
    if (playerNameInput) {
        playerNameInput.value = currentAuthenticatedUsername;
        playerNameInput.disabled = true; 
    }
    if (charHPInput && currentCharacterSheet && typeof currentCharacterSheet.hpCurr !== 'undefined') {
         charHPInput.value = currentCharacterSheet.hpCurr;
    }
    
    addMessageToChat(`Logged in as ${currentAuthenticatedUsername}. Welcome!`);
});
// Placeholder for Character Sheet
// Add listeners to emit changes to server later

// Inital message
addMessageToChat('Welcome! Connecting to server...');

// Auth Handling
if(loginButton){
    loginButton.addEventListener('click',()=>{
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();
        if(username&&password){
            socket.emit('login',{username,password});
            authErrorDisplay.textContent='';
        }else{
            authErrorDisplay.textContent='Username and password are required for login';
        }
    });
}

if(registerButton){
    registerButton.addEventListener('click',()=>{
        const username = registerUsernameInput.value.trim();
        const password = registerPasswordInput.value.trim();
        if (username && password){
            socket.emit('register',{username,password});
            authErrorDisplay.textContent='';
        }else{
            authErrorDisplay.textContent="Username and password are required for registeration";
        }
    });
}
// Listen for auth success 
socket.on('auth success', (authData) => {
    console.log('Auth Success:', authData);
    currentAuthenticatedUsername = authData.username;
    currentCharacterSheet = authData.sheet;

    // Update UI
    if (authArea) authArea.style.display = 'none';
    if (appContainer) appContainer.style.display = 'block'; 

    if (playerNameInput) {
        playerNameInput.value = currentAuthenticatedUsername;
    }

    addMessageToChat(`Logged in as ${currentAuthenticatedUsername}. Welcome!`);
    authErrorDisplay.textContent = ''; // Clear any auth errors
});

// Listen for auth error
socket.on('auth error', (errorData) => {
    console.error('Auth Error:', errorData.message);
    if (authErrorDisplay) {
        authErrorDisplay.textContent = `Error: ${errorData.message}`;
    }
    
});
