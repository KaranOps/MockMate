import React from 'react';
import { useProctoring } from './useProctoring';

export default function LiveProctoring({ sessionId }) {
  const { videoRef, status, analysis } = useProctoring(sessionId);

  return (
    <div>
      <h2>Live Proctoring</h2>
      <video ref={videoRef} autoPlay playsInline width={400} />
      <p>Status: {status}</p>
      {analysis && (
        <div style={{ marginTop: '10px' }}>
          <h3>Latest Proctoring Analysis:</h3>
          <pre>{JSON.stringify(analysis, null, 2)}</pre>
          {analysis.suspicious_activity && analysis.suspicious_activity.length > 0 && (
            <p style={{ color: 'red' }}>
              Warning: Suspicious activity detected! {analysis.suspicious_activity.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
