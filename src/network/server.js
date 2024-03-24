require('dotenv').config()
const { Server } = require("socket.io");
const { useAzureSocketIO } = require("@azure/web-pubsub-socket.io");

let io = new Server(3000);

// Use the following line to integrate with Web PubSub for Socket.IO
useAzureSocketIO(io, {
    hub: process.env.AZURE_HUB_NAME,
    connectionString: process.env.AZURE_CONNECTION_STRING
});

const db = new Map();

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("invalid username"));
    }
    socket.username = username;
    next();
});

io.on("connection", (socket) => {
    console.log(`New user connected: ${socket.username}`);

    // Broadcast the new user to all clients
    socket.broadcast.emit("users", { action: "add", id: socket.username });

    // Send the user list to the client
    const userList = Array.from(db.keys()).filter(x => x != socket.username);
    socket.emit("users", { action: "init", users: userList });
    console.log(userList);

    if (!db.has(socket.username)) {
        console.log(`Adding ${socket.username} to db`);
        db.set(socket.username, socket.id);
    }

    socket.on('disconnect', () => {
        console.log(`Removing ${socket.username} from db`);
        if (db.has(socket.username)) {
            db.delete(socket.username);
            socket.broadcast.emit("users", { action: "remove", id: socket.username });
        }
    });    

    // Receives a message from the client
    socket.on("action", (userData) => {
        socket.broadcast.emit("action", { action: userData.action, x: userData.x, y: userData.y, user: socket.username});
    })
});