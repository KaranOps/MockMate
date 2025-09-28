import React, { useState, useEffect } from 'react';
import InterviewAudio from './interviewAudio';
import VideoChat from './VideoChat';

const InterviewPage = () => {
  const [sessionId, setSessionId] = useState(null);

  // Example: You can set or fetch sessionId here via API or props
  useEffect(() => {
    // For demo, hardcoded sessionId or fetch from your backend
    const id = 'your-session-id'; // Replace it dynamically later
    setSessionId(id);
  }, []);

  if (!sessionId) return <div>Loading session...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex p-6 space-x-6">
      <div className="flex-1">
        <VideoChat sessionId={sessionId} />
      </div>
      <div className="flex-1">
        <InterviewAudio sessionId={sessionId} />
      </div>
    </div>
  );
};

export default InterviewPage;
