import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000'; // your backend URL

export class WebRTCService {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.socket = io(SERVER_URL);
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN server here if available
      ],
    };
  }

  async init(localVideoRef, remoteVideoRef) {
    this.localVideoRef = localVideoRef;
    this.remoteVideoRef = remoteVideoRef;

    this.peerConnection = new RTCPeerConnection(this.iceServers);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          sessionId: this.sessionId,
          candidate: event.candidate,
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (this.remoteVideoRef.current) {
        this.remoteStream = event.streams[0];
        this.remoteVideoRef.current.srcObject = this.remoteStream;
      }
    };

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (this.localVideoRef.current) {
        this.localVideoRef.current.srcObject = this.localStream;
      }

      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      this.registerSocketEvents();
      this.socket.emit('join-interview', this.sessionId);
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  }

  registerSocketEvents() {
    this.socket.on('webrtc-offer', async (data) => {
      const desc = new RTCSessionDescription(data.offer);
      await this.peerConnection.setRemoteDescription(desc);

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.socket.emit('webrtc-answer', {
        sessionId: this.sessionId,
        answer,
      });
    });

    this.socket.on('webrtc-answer', async (data) => {
      const desc = new RTCSessionDescription(data.answer);
      await this.peerConnection.setRemoteDescription(desc);
    });

    this.socket.on('ice-candidate', async (data) => {
      try {
        await this.peerConnection.addIceCandidate(data.candidate);
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    });

    this.socket.on('user-left', (userId) => {
      console.log(`User ${userId} left`);
      // Handle cleanup UI if needed
    });
  }

  async startCall() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.socket.emit('webrtc-offer', {
      sessionId: this.sessionId,
      offer,
    });
  }

  closeConnection() {
    this.peerConnection?.close();
    this.socket.disconnect();
  }
}
