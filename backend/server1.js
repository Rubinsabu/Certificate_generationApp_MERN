const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const PDFDocument = require('pdfkit');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

if (!fs.existsSync('certificates')) fs.mkdirSync('certificates');

app.post('/upload', upload.single('file'), (req, res) => {
  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  const generatedFiles = [];

  data.forEach((entry, index) => {

    const userName = entry['User name'] || entry['userName'];
    const courseName = entry['Course name'] || entry['courseName'];
    const startDate = entry['Start date'] || entry['startDate'];
    const endDate = entry['End date'] || entry['endDate'];

    const parseDate = (serialDate) => {
    const date = new Date(Math.round((serialDate - 25569) * 86400 * 1000));
    
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date).replace(/\//g, '-'); // dd-mm-yyyy
    };

const parsedStartDate = parseDate(startDate);
const parsedEndDate = parseDate(endDate);

    const doc = new PDFDocument();
    const certPath = `certificates/certificate_${index}_${userName.replace(/ /g, '_')}.pdf`;
    doc.pipe(fs.createWriteStream(certPath));

    doc.fontSize(24).text('Certificate of Completion', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`This certifies that ${userName}`, { align: 'center' });
    doc.moveDown();
    doc.text(`has successfully completed the course "${courseName}"`, { align: 'center' });
    doc.moveDown();
    doc.text(`from ${parsedStartDate} to ${parsedEndDate}`, { align: 'center' });
    doc.end();

    generatedFiles.push({
      name: userName,
      url: `http://localhost:5000/${certPath.replace(/\\/g, '/')}`
    });
  });

  fs.unlinkSync(req.file.path); // delete uploaded file
  res.json(generatedFiles);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


