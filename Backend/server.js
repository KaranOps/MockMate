const express = require('express');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const connectDB = require('./src/config/db');



const interviewRoutes = require('./src/routes/interviewRoutes');
const proctoringRoutes = require('./src/routes/proctoring');

const createSocketServer = require('./src/socketServer');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

connectDB();

app.use('/api/interview', interviewRoutes);

// Mount proctoring routes under /api/proctoring
app.use('/api/proctoring', proctoringRoutes);


// sanity check
app.get('/', (req, res) => {
  res.send('AI Interviewer Backend is running...');
  console.log('AI Interviewer Backend accessed');
});

// Initialize Socket.io signaling server separately
createSocketServer(server);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
