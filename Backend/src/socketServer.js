const { Server } = require('socket.io');
const SignalingService = require('./services/signalingService');

function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000", // Adjust to your frontend URL
      methods: ["GET", "POST"]
    }
  });

  const signalingService = new SignalingService(io);

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    signalingService.initializeHandlers(socket);
  });

  return io;
}

module.exports = createSocketServer;
