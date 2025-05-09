// Server imports
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app) // Creates HTTP server with Express app.
const io = socketIO(server) // Attaches Socket.IO to the HTTP server

const PORT = process.env.PORT || 3000;
// Serve the static files from 'public'
app.use(express.static(path.join(__dirname,'public')));

// When a client connects
io.on('connection',(socket)=>{
    console.log('A user connected:', socket.id);
    // Disconnect event
    socket.on('disconnect',()=>{
        console.log(`User disconnected: ${socket.id}`);
        io.emit('server message',`User ${socket.id.substring(0,5)} disconnected.`);
    });
});

// Start the server.
server.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});
