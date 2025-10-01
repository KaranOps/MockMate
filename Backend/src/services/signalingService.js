class SignalingService {
  constructor(io) {
    this.io = io;
    this.interviewRooms = new Map();
  }

  initializeHandlers(socket) {
    socket.on('join-interview', (sessionId) => {
      this.handleJoinInterview(socket, sessionId);
    });

    socket.on('webrtc-offer', (data) => {
      this.handleWebRTCOffer(socket, data);
    });

    socket.on('webrtc-answer', (data) => {
      this.handleWebRTCAnswer(socket, data);
    });

    socket.on('ice-candidate', (data) => {
      this.handleICECandidate(socket, data);
    });

    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });

    // New event listener or you can trigger emit from backend directly
    socket.on('subscribe-proctoring', (sessionId) => {
      socket.join(sessionId);
      console.log(`Socket ${socket.id} subscribed to proctoring for session ${sessionId}`);
    });


  }

  handleJoinInterview(socket, sessionId) {
    socket.join(sessionId);

    if (!this.interviewRooms.has(sessionId)) {
      this.interviewRooms.set(sessionId, new Set());
    }
    this.interviewRooms.get(sessionId).add(socket.id);

    console.log(`Socket ${socket.id} joined interview room: ${sessionId}`);

    socket.to(sessionId).emit('user-joined', {
      userId: socket.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleWebRTCOffer(socket, data) {
    const { sessionId, offer } = data;
    socket.to(sessionId).emit('webrtc-offer', {
      offer,
      from: socket.id,
    });
  }

  handleWebRTCAnswer(socket, data) {
    const { sessionId, answer } = data;
    socket.to(sessionId).emit('webrtc-answer', {
      answer,
      from: socket.id,
    });
  }

  handleICECandidate(socket, data) {
    const { sessionId, candidate } = data;
    socket.to(sessionId).emit('ice-candidate', {
      candidate,
      from: socket.id,
    });
  }

  handleDisconnect(socket) {
    for (const [sessionId, participants] of this.interviewRooms.entries()) {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        socket.to(sessionId).emit('user-left', socket.id);

        if (participants.size === 0) {
          this.interviewRooms.delete(sessionId);
        }
      }
    }

    console.log(`Socket ${socket.id} disconnected`);
  }

  emitProctoringUpdate(sessionId, analysis) {
    this.io.to(sessionId).emit('proctoringUpdate', analysis);
  }
}

module.exports = SignalingService;
