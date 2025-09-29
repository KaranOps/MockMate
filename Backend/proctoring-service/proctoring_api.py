from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
from proctoring_core import ProctoringEngine

app = Flask(__name__)
CORS(app)

proctoring_engine = ProctoringEngine()

@app.route('/analyze-frame', methods=['POST'])
def analyze_frame():
    try:
        data = request.json
        
        # Decode base64 image
        image_data = base64.b64decode(data['frame'])
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Analyze frame
        result = proctoring_engine.analyze_frame(frame)
        
        return jsonify({
            'success': True,
            'analysis': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/get-activity-log/<session_id>', methods=['GET'])
def get_activity_log(session_id):
    return jsonify({
        'session_id': session_id,
        'activity_log': proctoring_engine.activity_log
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
