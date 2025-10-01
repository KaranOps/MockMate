import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

export function useProctoring(sessionId) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('Initializing...');
  const [analysis, setAnalysis] = useState(null);
  const intervalRef = useRef(null);

  // Initialize webcam on mount
  useEffect(() => {
    async function startVideo() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('Camera started');
      } catch (err) {
        setStatus('Error accessing webcam: ' + err.message);
      }
    }
    startVideo();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Setup socket connection and subscription
  useEffect(() => {
    if (!sessionId) return;

    socket.emit('join-interview', sessionId);
    socket.emit('subscribe-proctoring', sessionId);

    socket.on('proctoringUpdate', data => {
      setAnalysis(data);
    });

    return () => {
      socket.off('proctoringUpdate');
    };
  }, [sessionId]);

  // Capture & send frame every second
  useEffect(() => {
    if (!sessionId || !videoRef.current) return;

    intervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [sessionId, videoRef.current]);

  const captureAndSendFrame = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    const base64Image = dataUrl.split(',')[1];

    try {
      await fetch(`/api/proctoring/session/${sessionId}/analyze-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frameData: base64Image }),
      });
      setStatus('Frame sent for analysis');
    } catch (err) {
      setStatus('Error sending frame: ' + err.message);
    }
  };

  return { videoRef, status, analysis };
}
