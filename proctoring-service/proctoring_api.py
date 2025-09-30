from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
import traceback
from proctoring_engine import ProctoringEngine
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize proctoring engine
proctoring_engine = ProctoringEngine()

# Store session-specific engines (for multi-user support)
session_engines = {}


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'proctoring-service',
        'version': '1.0.0'
    })


@app.route('/analyze-frame', methods=['POST'])
def analyze_frame():
    """
    Analyze a single video frame for proctoring - Complete Version
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        frame_b64 = data.get('frame')
        session_id = data.get('session_id', 'default')
        
        if not frame_b64:
            return jsonify({'success': False, 'error': 'No frame data provided'}), 400
        
        try:
            # Clean and decode base64 string
            if 'base64,' in frame_b64:
                frame_b64 = frame_b64.split('base64,')[1]
            
            img_bytes = base64.b64decode(frame_b64)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return jsonify({'success': False, 'error': 'Failed to decode image'}), 400
            
            print(f"Image decoded: shape={frame.shape}, dtype={frame.dtype}")
            
            # Get or create engine
            if session_id not in session_engines:
                session_engines[session_id] = ProctoringEngine()
            
            engine = session_engines[session_id]
            
            # Run complete proctoring analysis
            analysis = engine.analyze_frame(frame)
            
            return jsonify({
                'success': True,
                'session_id': session_id,
                'analysis': analysis
            })
            
        except Exception as analyze_error:
            print(f"Analysis error: {str(analyze_error)}")
            return jsonify({
                'success': False, 
                'error': f'Analysis error: {str(analyze_error)}'
            }), 400
        
    except Exception as e:
        print(f"Server error: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@app.route('/session/<session_id>/activity-log', methods=['GET'])
def get_activity_log(session_id):
    """Get complete activity log for a session"""
    if session_id not in session_engines:
        return jsonify({
            'success': False,
            'error': 'Session not found'
        }), 404
    
    engine = session_engines[session_id]
    activity_log = engine.get_activity_log()
    
    return jsonify({
        'success': True,
        'session_id': session_id,
        'total_activities': len(activity_log),
        'activity_log': activity_log
    })


@app.route('/session/<session_id>/summary', methods=['GET'])
def get_session_summary(session_id):
    """Get summary statistics for a session"""
    if session_id not in session_engines:
        return jsonify({
            'success': False,
            'error': 'Session not found'
        }), 404
    
    engine = session_engines[session_id]
    activity_log = engine.get_activity_log()
    
    # Calculate summary statistics
    summary = {
        'total_frames_analyzed': len(activity_log),
        'total_blinks': engine.blink_count,
        'face_anomalies': 0,
        'gaze_violations': 0,
        'head_movement_violations': 0,
        'object_detections': 0,
        'total_violations': 0
    }
    
    for activity in activity_log:
        if 'face_anomaly' in activity.get('suspicious_activity', []):
            summary['face_anomalies'] += 1
        if 'looking_away' in activity.get('suspicious_activity', []):
            summary['gaze_violations'] += 1
        if 'head_movement' in activity.get('suspicious_activity', []):
            summary['head_movement_violations'] += 1
        if 'objects_detected' in activity.get('suspicious_activity', []):
            summary['object_detections'] += 1
        
        summary['total_violations'] += len(activity.get('suspicious_activity', []))
    
    return jsonify({
        'success': True,
        'session_id': session_id,
        'summary': summary
    })


@app.route('/session/<session_id>/reset', methods=['POST'])
def reset_session(session_id):
    """Reset a proctoring session"""
    if session_id in session_engines:
        session_engines[session_id].reset_session()
        return jsonify({
            'success': True,
            'message': f'Session {session_id} reset successfully'
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Session not found'
        }), 404


@app.route('/session/<session_id>/delete', methods=['DELETE'])
def delete_session(session_id):
    """Delete a proctoring session"""
    if session_id in session_engines:
        del session_engines[session_id]
        return jsonify({
            'success': True,
            'message': f'Session {session_id} deleted successfully'
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Session not found'
        }), 404


@app.route('/sessions', methods=['GET'])
def list_sessions():
    """List all active sessions"""
    return jsonify({
        'success': True,
        'active_sessions': list(session_engines.keys()),
        'total_sessions': len(session_engines)
    })

def test_face_detector_init():
    """Test if face detector initializes correctly"""
    print("=" * 60)
    print("TESTING FACE DETECTOR INITIALIZATION")
    print("=" * 60)
    
    try:
        import dlib
        print("✅ dlib imported successfully")
        
        # Test basic face detector
        detector = dlib.get_frontal_face_detector()
        print("✅ Basic face detector created successfully")
        
        # Test shape predictor path
        import os
        predictor_path = 'models/shape_predictor_68_face_landmarks.dat'
        print(f"🔍 Looking for shape predictor at: {predictor_path}")
        print(f"🔍 Full path: {os.path.abspath(predictor_path)}")
        print(f"🔍 File exists: {os.path.exists(predictor_path)}")
        
        if os.path.exists(predictor_path):
            print(f"🔍 File size: {os.path.getsize(predictor_path)} bytes")
            
            # Try to load shape predictor
            try:
                shape_predictor = dlib.shape_predictor(predictor_path)
                print("✅ Shape predictor loaded successfully")
            except Exception as sp_error:
                print(f"❌ Shape predictor loading failed: {sp_error}")
        else:
            print("❌ Shape predictor file not found!")
            
        # Test with a simple image
        import numpy as np
        import cv2
        test_img = np.zeros((100, 100, 3), dtype=np.uint8)
        gray = cv2.cvtColor(test_img, cv2.COLOR_BGR2GRAY)
        faces = detector(gray)
        print(f"✅ Face detection test completed: found {len(faces)} faces in test image")
        
    except Exception as e:
        print(f"❌ Face detector initialization failed: {e}")
        import traceback
        print(traceback.format_exc())
    
    print("=" * 60)

# Run the test
test_face_detector_init()

if __name__ == '__main__':
    print("=" * 60)
    print("Starting Proctoring Service...")
    print("=" * 60)
    print(f"Service running on: http://localhost:5001")
    print("Available endpoints:")
    print("  - GET  /health")
    print("  - POST /analyze-frame")
    print("  - GET  /session/<id>/activity-log")
    print("  - GET  /session/<id>/summary")
    print("  - POST /session/<id>/reset")
    print("  - DELETE /session/<id>/delete")
    print("  - GET  /sessions")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5001, debug=True)
