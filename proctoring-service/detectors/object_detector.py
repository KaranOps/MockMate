# detectors/object_detector.py - OpenCV DNN Version
import cv2
import numpy as np
from config import Config

class ObjectDetector:
    def __init__(self):
        try:
            print("Loading YOLO object detector...")
            self.net = cv2.dnn.readNet(Config.YOLO_WEIGHTS_PATH, Config.YOLO_CONFIG_PATH)
            
            with open(Config.COCO_NAMES_PATH, 'r') as f:
                self.class_labels = [line.strip() for line in f.readlines()]
            
            layer_names = self.net.getLayerNames()
            self.output_layers = [layer_names[i - 1] for i in self.net.getUnconnectedOutLayers()]
            print("Object detector loaded successfully")
            
        except Exception as e:
            print(f"Warning: Could not load YOLO detector: {e}")
            self.net = None
    
    def detect(self, frame):
        """Detect suspicious objects"""
        if self.net is None:
            return []
        
        try:
            height, width = frame.shape[:2]
            
            # Prepare image for YOLO
            blob = cv2.dnn.blobFromImage(
                frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False
            )
            self.net.setInput(blob)
            outs = self.net.forward(self.output_layers)
            
            detected_objects = []
            
            for out in outs:
                for detection in out:
                    scores = detection[5:]
                    class_id = np.argmax(scores)
                    confidence = scores[class_id]
                    
                    if confidence > Config.YOLO_CONFIDENCE_THRESHOLD:
                        label = self.class_labels[class_id]
                        if label in Config.SUSPICIOUS_OBJECTS:
                            detected_objects.append(label)
            
            return list(set(detected_objects))  # Remove duplicates
            
        except Exception as e:
            print(f"Error in object detection: {e}")
            return []
