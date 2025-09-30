# config.py
import os

class Config:
    # Model paths
    SHAPE_PREDICTOR_PATH = 'models/shape_predictor_68_face_landmarks.dat'
    YOLO_WEIGHTS_PATH = 'models/object_detection/yolov3-tiny.weights'
    YOLO_CONFIG_PATH = 'models/object_detection/yolov3-tiny.cfg'
    COCO_NAMES_PATH = 'models/object_detection/coco.names'
    
    # Detection thresholds
    BLINK_EAR_THRESHOLD = 0.25
    GAZE_RATIO_THRESHOLD = 1.2
    HEAD_POSE_ANGLE_THRESHOLD = 15
    YOLO_CONFIDENCE_THRESHOLD = 0.5
    AUDIO_THRESHOLD = 2000
    
    # Suspicious objects list
    SUSPICIOUS_OBJECTS = ['cell phone', 'book', 'laptop', 'person', 'remote']
