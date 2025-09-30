# detectors/eye_gaze_detector.py - Simplified without dlib
import cv2
import numpy as np

class EyeGazeDetector:
    def __init__(self):
        # Load eye cascade for basic eye detection
        try:
            eye_cascade_path = cv2.data.haarcascades + 'haarcascade_eye.xml'
            self.eye_cascade = cv2.CascadeClassifier(eye_cascade_path)
            print("Eye gaze detector loaded successfully")
        except Exception as e:
            print(f"Warning: Could not load eye detector: {e}")
            self.eye_cascade = None
    
    def detect(self, faces, frame):
        """
        Simple gaze detection based on eye positions
        Returns: 'center' | 'looking_away' | 'no_eyes'
        """
        if self.eye_cascade is None or len(faces) == 0:
            return "no_eyes"
        
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # For each face, detect eyes
            for face in faces:
                # Extract face region
                if isinstance(face, dict):  # OpenCV face format
                    x, y, w, h = face['x'], face['y'], face['w'], face['h']
                else:
                    continue
                
                face_region = gray[y:y+h, x:x+w]
                
                # Detect eyes in face region
                eyes = self.eye_cascade.detectMultiScale(
                    face_region, 
                    scaleFactor=1.1, 
                    minNeighbors=5,
                    minSize=(10, 10)
                )
                
                if len(eyes) >= 2:
                    # Simple heuristic: if eyes are detected normally, assume center gaze
                    return "center"
                elif len(eyes) == 1:
                    # Only one eye detected, might be looking away
                    return "looking_away"
                else:
                    return "no_eyes"
            
            return "no_eyes"
            
        except Exception as e:
            print(f"Error in gaze detection: {e}")
            return "no_eyes"
