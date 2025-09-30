# proctoring_engine.py - Complete OpenCV Version
from datetime import datetime
from detectors.face_detector import FaceDetector
from detectors.eye_gaze_detector import EyeGazeDetector
from detectors.head_pose_detector import HeadPoseDetector
from detectors.object_detector import ObjectDetector
from detectors.blink_detector import BlinkDetector

class ProctoringEngine:
    def __init__(self):
        print("Initializing complete proctoring engine...")
        try:
            # Initialize all detectors
            self.face_detector = FaceDetector()
            self.eye_gaze_detector = EyeGazeDetector()
            self.head_pose_detector = HeadPoseDetector()
            self.object_detector = ObjectDetector()
            self.blink_detector = BlinkDetector()
            
            print("All detectors initialized successfully")
        except Exception as e:
            print(f"Failed to initialize detectors: {e}")
            raise e
        
        self.activity_log = []
    
    def analyze_frame(self, frame):
        """Complete proctoring analysis"""
        timestamp = datetime.now().isoformat()
        
        try:
            # Face detection
            face_status, faces = self.face_detector.detect(frame)
            
            # Other detections
            gaze_status = self.eye_gaze_detector.detect(faces, frame)
            head_pose = self.head_pose_detector.detect(faces, frame)
            detected_objects = self.object_detector.detect(frame)
            blink_status, blink_count = self.blink_detector.detect(faces, frame)
            
            # Determine suspicious activities
            suspicious_activity = []
            
            if face_status in ['multiple_faces', 'no_face']:
                suspicious_activity.append('face_anomaly')
            
            if gaze_status == 'looking_away':
                suspicious_activity.append('looking_away')
            
            if head_pose == 'head_turned':
                suspicious_activity.append('head_movement')
            
            if len(detected_objects) > 0:
                suspicious_activity.append('objects_detected')
            
            analysis = {
                'timestamp': timestamp,
                'face_status': face_status,
                'faces_count': len(faces),
                'gaze_direction': gaze_status,
                'head_pose': head_pose,
                'detected_objects': detected_objects,
                'blink_status': blink_status,
                'blink_count': blink_count,
                'suspicious_activity': suspicious_activity
            }
            
            self.activity_log.append(analysis)
            return analysis
            
        except Exception as e:
            print(f"Error in analyze_frame: {e}")
            return {
                'timestamp': timestamp,
                'error': str(e),
                'face_status': 'error',
                'faces_count': 0,
                'gaze_direction': 'error',
                'head_pose': 'error',
                'detected_objects': [],
                'blink_status': 'error',
                'blink_count': 0,
                'suspicious_activity': ['analysis_error']
            }
    
    def get_activity_log(self):
        return self.activity_log
    
    def reset_session(self):
        self.activity_log = []
        if hasattr(self.blink_detector, 'blink_count'):
            self.blink_detector.blink_count = 0
