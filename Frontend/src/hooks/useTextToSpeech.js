import { useState, useRef, useCallback } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);
  const speakingRef = useRef(false);

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      return;
    }

    if (speakingRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      speakingRef.current = false;
      setIsSpeaking(false);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      speakingRef.current = true;
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      speakingRef.current = false;
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      speakingRef.current = false;
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
  };
};
