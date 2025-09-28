import React from 'react'
import InterviewChat from './components/interviewChat';
import InterviewAudio from './components/interviewAudio';

const App = () => {
  return (
     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      {/* <InterviewChat /> */}
      <InterviewAudio />
    </div>
  )
}

export default App
