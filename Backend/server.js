const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./src/config/db');


const interviewRoutes = require('./src/routes/interviewRoutes');


const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/interview', interviewRoutes);

// sanity check
app.get('/', (req, res) => {
  res.send('AI Interviewer Backend is running...');
  console.log('AI Interviewer Backend accessed');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
