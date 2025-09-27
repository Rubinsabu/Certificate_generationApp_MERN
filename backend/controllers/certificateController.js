const fs = require('fs');
const path = require('path');

const { parseExcel } = require('../utils/parseExcel');
const { generateCertificates } = require('../services/certificateService');

exports.uploadCertificates = async (req, res) => {
  try {
    const filePath = req.file.path;

    const data = parseExcel(filePath);
    const generatedFiles = await generateCertificates(data);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json(generatedFiles);
  } catch (err) {
    console.error('Error processing upload:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
