const express = require('express');
const multer = require('multer');
const path = require('path');

const certificateController = require('../controllers/certificateController');

const router = express.Router();

// Setup multer for Excel upload
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// POST /api/certificates/upload
router.post('/upload', upload.single('file'), certificateController.uploadCertificates);

module.exports = router;
