const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const certificateRoutes = require('./routes/certificateRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Serve static certificates
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

// Routes
app.use('/api/certificates', certificateRoutes);

// Create certificates folder if missing
if (!fs.existsSync('certificates')) fs.mkdirSync('certificates');
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
