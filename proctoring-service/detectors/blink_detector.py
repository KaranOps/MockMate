# detectors/blink_detector.py - Simplified without dlib
import cv2

class BlinkDetector:
    def __init__(self):
        try:
            eye_cascade_path = cv2.data.haarcascades + 'haarcascade_eye.xml'
            self.eye_cascade = cv2.CascadeClassifier(eye_cascade_path)
            self.previous_eye_count = 0
            self.blink_count = 0
            print("Blink detector loaded successfully")
        except Exception as e:
            print(f"Warning: Could not load blink detector: {e}")
            self.eye_cascade = None
    
    def detect(self, faces, frame):
        """
        Simple blink detection by counting eyes
        Returns: ('blink' | 'no_blink', blink_count)
        """
        if self.eye_cascade is None or len(faces) == 0:
            return "no_blink", 0
        
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            current_eye_count = 0
            
            # Count eyes in all faces
            for face in faces:
                if isinstance(face, dict):
                    x, y, w, h = face['x'], face['y'], face['w'], face['h']
                    face_region = gray[y:y+h, x:x+w]
                    
                    eyes = self.eye_cascade.detectMultiScale(
                        face_region, 
                        scaleFactor=1.1, 
                        minNeighbors=5
                    )
                    current_eye_count += len(eyes)
            
            # Simple blink detection: if eye count drops significantly
            if self.previous_eye_count >= 2 and current_eye_count == 0:
                self.blink_count += 1
                self.previous_eye_count = current_eye_count
                return "blink", self.blink_count
            
            self.previous_eye_count = current_eye_count
            return "no_blink", self.blink_count
            
        except Exception as e:
            print(f"Error in blink detection: {e}")
            return "no_blink", 0
