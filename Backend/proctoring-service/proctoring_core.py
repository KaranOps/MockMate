import cv2
import numpy as np
import dlib
import time
from datetime import datetime
import json

class ProctoringEngine:
    def __init__(self):
        self.shape_predictor = dlib.shape_predictor('models/shape_predictor_68_face_landmarks.dat')
        self.face_detector = dlib.get_frontal_face_detector()
        self.activity_log = []
        
    def detect_face(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_detector(gray, 0)
        face_count = len(faces)
        
        if face_count > 1:
            return "multiple_faces", faces
        elif face_count == 0:
            return "no_face", faces
        else:
            return "normal", faces
    
    def detect_eye_gaze(self, faces, frame):
        # Adapted from eye_tracker.py
        if len(faces) == 0:
            return "no_face"
            
        # Eye gaze detection logic here
        left_eye = [36,37,38,39,40,41]
        right_eye = [42,43,44,45,46,47]
        
        for face in faces:
            landmarks = self.shape_predictor(frame, face)
            # Process eye regions and determine gaze direction
            # Return: "center", "left", "right", "looking_away"
        
        return "center"  # Simplified
    
    def detect_head_pose(self, faces, frame):
        # Adapted from head_pose_estimation.py
        if len(faces) == 0:
            return "no_face"
            
        # Head pose estimation logic
        return "normal"  # "head_up", "head_down", "head_left", "head_right"
    
    def detect_objects(self, frame):
        # Simplified object detection
        # Return list of detected objects that might indicate cheating
        return []
    
    def analyze_frame(self, frame):
        timestamp = datetime.now().isoformat()
        
        # Run all proctoring checks
        face_status, faces = self.detect_face(frame)
        gaze_status = self.detect_eye_gaze(faces, frame)
        head_pose = self.detect_head_pose(faces, frame)
        objects = self.detect_objects(frame)
        
        # Create activity record
        activity = {
            'timestamp': timestamp,
            'face_status': face_status,
            'gaze_direction': gaze_status,
            'head_pose': head_pose,
            'detected_objects': objects,
            'suspicious_activity': self.is_suspicious(face_status, gaze_status, head_pose, objects)
        }
        
        self.activity_log.append(activity)
        return activity
    
    def is_suspicious(self, face_status, gaze_status, head_pose, objects):
        suspicious_indicators = []
        
        if face_status in ['multiple_faces', 'no_face']:
            suspicious_indicators.append('face_anomaly')
            
        if gaze_status == 'looking_away':
            suspicious_indicators.append('looking_away')
            
        if head_pose in ['head_left', 'head_right']:
            suspicious_indicators.append('head_movement')
            
        if len(objects) > 0:
            suspicious_indicators.append('objects_detected')
            
        return suspicious_indicators
