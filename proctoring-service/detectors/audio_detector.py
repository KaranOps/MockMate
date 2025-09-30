# detectors/audio_detector.py
import numpy as np
import pyaudio
from config import Config

class AudioDetector:
    def __init__(self):
        self.chunk = 1024
        self.format = pyaudio.paInt16
        self.channels = 1
        self.rate = 44100
        self.p = None
        self.stream = None
    
    def start(self):
        """Start audio detection"""
        self.p = pyaudio.PyAudio()
        self.stream = self.p.open(
            format=self.format,
            channels=self.channels,
            rate=self.rate,
            input=True,
            frames_per_buffer=self.chunk
        )
    
    def detect(self):
        """
        Detect audio anomaly
        Returns: ('suspicious_audio' | 'normal_audio', volume_level)
        """
        if self.stream is None:
            return "not_started", 0
        
        try:
            data = self.stream.read(self.chunk, exception_on_overflow=False)
            audio_data = np.frombuffer(data, dtype=np.int16)
            volume = np.max(np.abs(audio_data))
            
            if volume > Config.AUDIO_THRESHOLD:
                return "suspicious_audio", volume
            else:
                return "normal_audio", volume
        except Exception as e:
            return "error", 0
    
    def stop(self):
        """Stop audio detection"""
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
        if self.p:
            self.p.terminate()
