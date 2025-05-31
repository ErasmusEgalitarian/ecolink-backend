require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');

const cors = require('cors');

const uploadDir = path.join(__dirname, 'uploads'); // -> criar pasta de uploads localmente
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const app = express();
app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const donationRoutes = require('./routes/donation');
app.use('/api/donation', donationRoutes);

const mediaRoutes = require('./routes/media');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/media', mediaRoutes);


// Connect to MongoDB
connectDB();

module.exports = app;

if (require.main === module) {
  // Start the server
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  process.on('SIGTERM', () => server.close());
  process.on('SIGINT', () => server.close());
}
