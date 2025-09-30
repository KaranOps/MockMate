import React, { useEffect, useRef, useState } from 'react';

export default function LiveProctoring({ sessionId }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('Initializing...');
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    async function startVideo() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        setStatus('Camera started');
      } catch (err) {
        setStatus('Error accessing webcam: ' + err.message);
      }
    }
    startVideo();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const id = setInterval(() => {
      captureAndSendFrame();
    }, 1000); // Capture every 1 second

    setIntervalId(id);

    return () => clearInterval(id);
  }, [sessionId]);

  const captureAndSendFrame = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    const base64Image = dataUrl.split(',')[1];

    try {
      await fetch(`/api/proctoring/session/${sessionId}/analyze-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frameData: base64Image }),
      });
      setStatus('Frame sent and analyzed');
    } catch (e) {
      setStatus('Network error: ' + e.message);
    }
  };

  return (
    <div>
      <h2>Live Proctoring</h2>
      <video ref={videoRef} autoPlay playsInline width={400} />
      <p>Status: {status}</p>
    </div>
  );
}
