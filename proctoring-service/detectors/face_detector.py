# detectors/face_detector.py - OpenCV Version
import cv2
import os

class FaceDetector:
    def __init__(self):
        try:
            print(f"Loading OpenCV face detector...")
            
            # Load OpenCV's pre-trained Haar cascade
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            
            if self.face_cascade.empty():
                raise Exception("Failed to load OpenCV face cascade")
            
            print(f"OpenCV face detector loaded successfully")
            
        except Exception as e:
            print(f"Error initializing FaceDetector: {e}")
            raise e
    
    def _resize_frame_if_needed(self, frame, max_width=800, max_height=600):
        """Resize frame if it's too large for processing"""
        height, width = frame.shape[:2]
        
        if width <= max_width and height <= max_height:
            return frame, 1.0
        
        scale_width = max_width / width
        scale_height = max_height / height
        scale = min(scale_width, scale_height)
        
        new_width = int(width * scale)
        new_height = int(height * scale)
        
        resized = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)
        print(f"Resized image from {width}x{height} to {new_width}x{new_height}")
        
        return resized, scale
    
    def detect(self, frame):
        """
        Detect faces using OpenCV Haar Cascades
        Returns: (status, faces)
        """
        try:
            if frame is None:
                return "no_frame", []
            
            if frame.dtype != 'uint8':
                frame = frame.astype('uint8')
            
            # Resize if needed
            processed_frame, scale_factor = self._resize_frame_if_needed(frame)
            
            # Convert to grayscale
            if len(processed_frame.shape) == 3:
                gray = cv2.cvtColor(processed_frame, cv2.COLOR_BGR2GRAY)
            else:
                gray = processed_frame
            
            if gray.dtype != 'uint8':
                gray = gray.astype('uint8')
            
            print(f"Processing frame: shape={gray.shape}, dtype={gray.dtype}")
            
            # Detect faces using OpenCV
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30),
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            
            face_count = len(faces)
            print(f"OpenCV face detection completed: found {face_count} faces")
            
            # Convert to list of face rectangles (compatible format)
            face_rects = []
            for (x, y, w, h) in faces:
                # Scale back to original size if needed
                if scale_factor != 1.0:
                    x = int(x / scale_factor)
                    y = int(y / scale_factor)
                    w = int(w / scale_factor)
                    h = int(h / scale_factor)
                
                # Create a simple rectangle object
                face_rects.append({
                    'x': x, 'y': y, 'w': w, 'h': h,
                    'left': x, 'top': y, 'right': x + w, 'bottom': y + h
                })
            
            if face_count > 1:
                return "multiple_faces", face_rects
            elif face_count == 0:
                return "no_face", face_rects
            else:
                return "normal", face_rects
                
        except Exception as e:
            print(f"Error in OpenCV face detection: {e}")
            import traceback
            print(traceback.format_exc())
            return "error", []
    
    def get_landmarks(self, frame, face):
        """
        Placeholder for landmarks (OpenCV doesn't provide landmarks directly)
        """
        print("Note: Landmark detection not available with OpenCV face detector")
        return None
