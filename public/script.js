// Connect to server , socket will be our individual connection
const socket = io();

// Get Elements
const playerNameInput = document.getElementById('playerName');
const charHPInput = document.getElementById('charHP');
const RollD20Button = document.getElementById('rollD20');
const rollResultDisplay = document.getElementById('rollResult');
const chatMessagesDiv = document.getElementById('chat-messages');
const chatInput = document.getElementById('chatInput');
const sendChatButton = document.getElementById('sendChat');

// Connection Test
console.log("Socket.IO script loaded, trying to connect...");
socket.on('connect',()=>{
    console.log(`Connected to server! Socket ID:`, socket.id);
    addMessageToChat(`You connected! ID:${socket.id.substring(0,5)}`);
});

socket.on('disconnect',()=>{
    console.log('Disconnected from server!');
    addMessageToChat('You disconnected from server.');
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
    if(message){
        // Send the message to server.
        socket.emit('client message',message);
        chatInput.value = ''; // Clear input
    }
});

// Listen to messages from server
socket.on('server message',(msg)=>{
    addMessageToChat(msg);
});


// Dice Roll 
RollD20Button.addEventListener('click',() =>{
    const result = Math.floor(Math.random() * 20) + 1;
    rollResultDisplay.textContent = result;
    // Will have to emit to server and broadcast.
});

// Placeholder for Character Sheet
// Add listeners to emit changes to server later

// Inital message
addMessageToChat('Welcome! Connecting to server...')