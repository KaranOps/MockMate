import React, { useRef, useEffect } from 'react';
import { WebRTCService } from '../service/webRTCService';

const VideoChat = ({ sessionId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const rtcServiceRef = React.useRef(null);

  useEffect(() => {
    rtcServiceRef.current = new WebRTCService(sessionId);
    rtcServiceRef.current.init(localVideoRef, remoteVideoRef);

    // Start WebRTC call for interviewer side or candidate as required
    // For simplicity, candidate can call startCall to initiate offer here
    rtcServiceRef.current.startCall();

    return () => {
      rtcServiceRef.current.closeConnection();
    };
  }, [sessionId]);

  return (
    <div className="flex space-x-4">
      <div>
        <h3>Your Video</h3>
        <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '300px', borderRadius: '8px' }} />
      </div>
      <div>
        <h3>Interviewer Video</h3>
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '300px', borderRadius: '8px' }} />
      </div>
    </div>
  );
};

export default VideoChat;
