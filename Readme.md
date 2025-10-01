# AI-Based Live Proctoring System

## Overview

This project is a **modular AI proctoring system** designed for online interviews and assessments. It combines Python computer vision/machine learning (CV/ML) microservices, a Node.js backend for orchestration and persistence, and a React frontend for live monitoring and reporting. The core goal is to enhance fairness and security in remote interviews by automatically detecting cheating or suspicious activity in real time.

---

## Architecture

The system follows a microservices architecture with three main components:

- **Backend:** Node.js + Express, MongoDB (Mongoose schema), REST/Socket.io API
- **CV/ML Microservice:** Python Flask server running face, gaze, head pose, object, and blink detection
- **Frontend:** React app with live webcam frame capture, proctoring overlay, and real-time alerts

### System Diagram

```
[React Frontend]
    |
    |--(HTTP/Socket.io/WebSocket)-->
    |
[Node.js Backend (Express)]
    |
    |--(REST HTTP)-->
    |
[Python Proctoring Microservice (Flask)]
```

---

## Core Features

### Detection Capabilities
- **Face Detection:** Detects if only one face is present, flags multiple or no face scenarios
- **Eye Gaze Tracking:** Monitors candidate's eye direction (center, away, left, right)
- **Head Pose Estimation:** Detects head orientation (normal, up, down, turned)
- **Object Detection:** Flags prohibited items (phones, books, extra people)
- **Blink Detection:** Tracks blink rate anomalies

### System Features
- **Activity Logging:** Stores all suspicious events and raw analysis in MongoDB and local files
- **Real-Time Alerts:** Pushes violations instantly to the frontend via Socket.io
- **Session Dashboard:** Summarizes activity and provides post-session reports
- **Live Monitoring:** Continuous frame analysis with instant feedback

---

## Prerequisites

Before setting up the project, ensure you have:

- **Python 3.x** (for Flask microservice)
- **Node.js 18+** (for backend server)
- **MongoDB** (for data persistence)
- **React 18+** (for frontend)
- **Required AI Models:**
  - `shape_predictor_68_face_landmarks.dat` (dlib face landmarks)
  - YOLO weights and configuration files

---

## Setup & Installation

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd project-root
```

### 2. Python Microservice Setup

Navigate to the proctoring service directory:

```bash
cd proctoring-service
```

Install required Python packages:

```bash
pip install flask opencv-python dlib numpy
```

Download required model files:
- Download `shape_predictor_68_face_landmarks.dat` from dlib
- Download YOLO weights and configuration files
- Place them in the appropriate model directory

Start the Python microservice:

```bash
python proctoring_api.py
```

The service will run on `http://localhost:5000` by default.

### 3. Node.js Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Configure environment variables in `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/proctoring
PYTHON_SERVICE_URL=http://localhost:5000
```

Start the backend server:

```bash
node server.js
```

The backend will run on `http://localhost:3000` by default.

### 4. React Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Update API configuration if needed in your config files.

Start the React development server:

```bash
npm start
```

The frontend will open at `http://localhost:3000` (or next available port).

---

## File Structure

```
project-root/
│
├── backend/
│   ├── src/
│   │   ├── config/             # Database and server configuration
│   │   ├── controllers/        # API logic (proctoringController.js)
│   │   ├── models/             # MongoDB schemas (InterviewSession.js)
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Business logic (signalingService.js)
│   │   └── socketServer.js     # Socket.IO setup for real-time events
│   ├── activity.txt            # Local activity log file
│   ├── server.js               # Main entry point
│   └── package.json
│
├── proctoring-service/         # Python microservice
│   ├── proctoring_api.py       # Flask API server
│   ├── detectors/              # Modular detection components
│   │   ├── face_detector.py
│   │   ├── eye_gaze_detector.py
│   │   ├── head_pose_detector.py
│   │   ├── object_detector.py
│   │   └── blink_detector.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/         # React components (LiveProctoring.js)
    │   ├── hooks/              # Custom hooks (useProctoring.js)
    │   ├── services/           # API service layer
    │   ├── App.js              # Main app component
    │   └── index.js            # Entry point
    └── package.json
```

---

## Usage

### Starting a Proctoring Session

1. **Start all services:**
   - Python microservice (Flask)
   - Node.js backend (Express)
   - React frontend

2. **Access the application:**
   - Open your browser and navigate to the React app
   - Create or join an interview session

3. **Begin monitoring:**
   - Allow webcam access when prompted
   - The system automatically captures video frames
   - Frames are sent to the Python microservice for analysis
   - Results are stored in MongoDB and displayed in real-time

4. **View results:**
   - Live alerts appear for suspicious activity
   - Access session dashboard for detailed reports
   - Review activity logs in `activity.txt` or MongoDB

### API Endpoints

**Backend (Node.js)**
- `POST /api/proctoring/session/:id/analyze-frame` - Submit frame for analysis
- `GET /api/proctoring/session/:id` - Get session details
- `GET /api/proctoring/session/:id/activity` - Get session activity log

**Python Microservice**
- `POST /analyze` - Analyze a single frame (accepts base64 image)

---

## Testing

### Unit Tests

**Backend (Jest + Supertest):**
```bash
cd backend
npm test
```

Test files location: `src/controllers/__tests__/`

**Frontend (React Testing Library):**
```bash
cd frontend
npm test
```

Test files location: `src/components/__tests__/`

### Integration Testing

Test the complete flow:
1. Start all services
2. Use Postman or curl to test API endpoints
3. Send test frames to `/api/proctoring/session/:id/analyze-frame`

Example curl command:
```bash
curl -X POST http://localhost:3000/api/proctoring/session/123/analyze-frame \
  -H "Content-Type: application/json" \
  -d '{"frame": "base64_encoded_image_data"}'
```

### End-to-End Testing

- Use Cypress for automated E2E tests
- Manual testing through the React UI

---

## Future Scope

### Enhanced Detection
- **Audio Anomaly Detection:** Identify suspicious background conversations
- **Voice Recognition:** Detect multiple speakers or unauthorized voice patterns
- **Liveness Detection:** Verify the candidate is a real person, not a photo/video
- **Face Identity Verification:** Match candidate face with pre-registered identity

### Advanced Features
- **Screen Recording & Monitoring:** Detect screen sharing violations
- **Plagiarism Detection:** Monitor for content leaks or document scanning
- **Adaptive Rules Engine:** Customizable violation thresholds and configurations
- **Historical Analytics:** Trend analysis and pattern detection across sessions

### Platform Enhancements
- **Scalable Cloud Deployment:** Dockerization and Kubernetes orchestration
- **Cross-Platform Support:** Mobile apps and browser extensions
- **Role-Based Dashboards:** Separate views for admins, interviewers, and candidates
- **Third-Party Integrations:** Connect with LMS platforms (Moodle, Canvas), HR systems

### Compliance & Accessibility
- **Privacy Compliance:** GDPR, CCPA, and data protection regulations
- **Bias Mitigation:** Fair and unbiased AI model training
- **Accessibility Features:** Support for diverse user needs
- **Audit Logs:** Comprehensive authentication and activity tracking

### Technical Improvements
- **Pluggable AI Models:** Easy upgrades to newer detection models
- **Performance Optimization:** Faster frame processing and reduced latency
- **Multi-language Support:** Internationalization for global use
- **Enhanced Error Handling:** Robust fallback mechanisms

---


## Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Contact the development team
- Check the documentation wiki

---

## Acknowledgments

- dlib for facial landmark detection
- YOLO for object detection
- OpenCV for computer vision capabilities
- The open-source community

---

**Built with ❤️ for fair and secure online assessments**

<!-- ![alt text]({94989828-BF03-433F-96B5-16E371D1431E}.png) -->