# detectors/head_pose_detector.py - Simplified
import cv2
import numpy as np

class HeadPoseDetector:
    def __init__(self):
        print("Head pose detector initialized (simplified version)")
    
    def detect(self, faces, frame):
        """
        Simple head pose detection based on face position
        Returns: 'normal' | 'head_turned' | 'no_face'
        """
        if len(faces) == 0:
            return "no_face"
        
        try:
            frame_height, frame_width = frame.shape[:2]
            frame_center_x = frame_width // 2
            
            for face in faces:
                if isinstance(face, dict):  # OpenCV face format
                    x, y, w, h = face['x'], face['y'], face['w'], face['h']
                    face_center_x = x + w // 2
                    
                    # Simple heuristic: if face is significantly off-center
                    deviation = abs(face_center_x - frame_center_x) / frame_width
                    
                    if deviation > 0.3:  # 30% deviation from center
                        return "head_turned"
                    else:
                        return "normal"
            
            return "normal"
            
        except Exception as e:
            print(f"Error in head pose detection: {e}")
            return "normal"
