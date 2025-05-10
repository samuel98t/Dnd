// Server imports
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app) // Creates HTTP server with Express app.
const io = socketIO(server) // Attaches Socket.IO to the HTTP server
// simple storage
const LEN = 50 // Chat history max len
let chatHistory = [];
const PORT = process.env.PORT || 3000;
// Serve the static files from 'public'
app.use(express.static(path.join(__dirname,'public')));

// Dice roller helper func
function rollDice(diceString){
    const match = diceString.match(/(\d+)[dD](\d+)(?:([+-])(\d+))?/); // simple parser
    if(!match) return null; // Invalid dice format
    const numDice = parseInt(match[1]);
    const diceSides = parseInt(match[2]);
    const modifierSign = match[3];
    const modifierValue = parseInt(match[4]) || 0;

    let total = 0;
    for(let i=0; i <numDice; i++){
        total+= Math.floor(Math.random()*diceSides)+1;
    }
    if (modifierSign==='+'){
        total += modifierValue;
    }
    else if(modifierSign==='-'){
        total-=modifierValue;
    }
    return total;
}
// When a client connects
io.on('connection',(socket)=>{
    console.log('A user connected:', socket.id);
    // Send current chat history to new user
    socket.emit('chat history', chatHistory);
    socket.emit('server message', { text: 'Welcome! You are connected.' }); // Send welcome msg 

    // Disconnect event
    socket.on('disconnect',()=>{
        console.log(`User disconnected: ${socket.id}`);
        const disconnectMsg = { text: `User ${socket.id.substring(0,5)} disconnected.`, timestamp: new Date().toLocaleTimeString() };
        io.emit('server message',disconnectMsg);
        chatHistory.push({type:'system',...disconnectMsg});
        if(chatHistory.length >50) chatHistory.shift();
    });
    // Client message
    socket.on('client message',(msgData)=>{
        console.log(`Message from client ${msgData.sender || socket.id} `);
        const messageToBroadcast = {
            sender: msgData.sender,
            text: msgData.text,
            timestamp: new Date().toLocaleTimeString()
        };
        io.emit('server message',messageToBroadcast);
        // Add to chat history
        chatHistory.push({ type: 'chat', ...messageToBroadcast });
        if (chatHistory.length > 50) chatHistory.shift();
    })
    // Dice rolls
    socket.on('dice roll',(data)=>{
        console.log(`Roll request from ${data.rollerName || socket.id}: ${data.rollString}`);
        const serverRollResult = rollDice(data.rollString);
        if (serverRollResult === null){
            // Handle invalid/errors
            socket.emit('roll error',{message:`Invalid dice format: ${data.rollString}`});
            console.error(`Invalid dice roll string from ${data.rollerName || socket.id.substring(0,5)} : ${data.rollString}`);
            return;
        }
        const rollDataToBroadcast ={
            rollerName: data.rollerName,
            rollString: data.rollString,
            result :serverRollResult,
            timestamp: new Date().toLocaleTimeString()
        };
        io.emit('roll result',(rollDataToBroadcast));
        const chatMessage = `${rollDataToBroadcast.rollerName} rolled ${rollDataToBroadcast.rollString}: ${rollDataToBroadcast.result}`;
        chatHistory.push({ type: 'roll', text: chatMessage, timestamp: rollDataToBroadcast.timestamp });
        if (chatHistory.length > LEN) chatHistory.shift();
        });
    });


// Start the server.
server.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});
