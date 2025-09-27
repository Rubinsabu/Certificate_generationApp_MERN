const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { formatExcelDate } = require('../utils/formatDate');
const { generateZiyaQr } = require('../utils/generateQr');
const { generateBarcodePngBuffer } = require('../utils/generateBarcode');

exports.generateCertificates = async (data) => {
  const generatedFiles = [];

  // ensure output directory exists
  const outDir = path.join(__dirname, '..', 'certificates');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // optional script font (place a .ttf in assets/fonts/GreatVibes-Regular.ttf)
  const scriptFontPath = path.join(__dirname, '..', 'assets', 'fonts', 'GreatVibes-Regular.ttf');
  const hasScriptFont = fs.existsSync(scriptFontPath);

  for (const [index, entry] of data.entries()) {
    const userName = entry['User name'] || entry['userName'];
    const courseName = entry['Course name'] || entry['courseName'];
    const startDate = entry['Start date'] || entry['startDate'];
    const endDate = entry['End date'] || entry['endDate'];

    const parsedStartDate = formatExcelDate(startDate);
    const parsedEndDate = formatExcelDate(endDate);

    // Create new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 72, right: 72 },
    });

    const fileName = `certificate_${index}_${String(userName).replace(/ /g, '_')}.pdf`;
    const certPath = path.join(outDir, fileName);
    const stream = fs.createWriteStream(certPath);
    doc.pipe(stream);

    // convenience
    const W = doc.page.width;
    const H = doc.page.height;

    // Colors
    const red = '#C62828';
    const redDark = '#9b1f1f';
    const black = '#111111';
    const grey = '#777777';
    const amber = '#F0B429';
    const amberDark = '#E0A020';

    // === Background white - default ===
    doc.rect(0, 0, W, H).fill('#ffffff');

    // === Left and right red side ribbons (simple polygon shapes to mimic image) ===
    // Left
    doc.save();
    doc.moveTo(0, 0);
    doc.lineTo(90, 0);
    doc.lineTo(150, H);
    doc.lineTo(0, H);
    doc.closePath();
    doc.fill(red);

    // darker overlay stripe on left
    doc.moveTo(20, 0);
    doc.lineTo(80, 0);
    doc.lineTo(140, H);
    doc.lineTo(80, H);
    doc.closePath();
    doc.fill(redDark);
    doc.restore();

    // Right (mirrored)
    doc.save();
    doc.moveTo(W, 0);
    doc.lineTo(W - 90, 0);
    doc.lineTo(W - 150, H);
    doc.lineTo(W, H);
    doc.closePath();
    doc.fill(red);

    // darker overlay stripe on right
    doc.moveTo(W - 20, 0);
    doc.lineTo(W - 80, 0);
    doc.lineTo(W - 140, H);
    doc.lineTo(W - 80, H);
    doc.closePath();
    doc.fill(redDark);
    doc.restore();

    // === Yellow/Amber blocks near bottom left and right (trapezoids) ===
    // left block
    doc.save();
    const leftX = 70;
    const leftWTop = 40;
    const leftWBottom = 70;
    doc.moveTo(leftX, H - 120);
    doc.lineTo(leftX + leftWTop, H - 420);
    doc.lineTo(leftX + leftWBottom, H - 420);
    doc.lineTo(leftX + leftWBottom - 10, H - 120);
    doc.closePath();
    doc.fill(amber);

    // darker overlay thin triangle
    doc.moveTo(leftX + 10, H - 120);
    doc.lineTo(leftX + leftWTop, H - 420);
    doc.lineTo(leftX + leftWTop + 6, H - 120);
    doc.closePath();
    doc.fill(amberDark);
    doc.restore();

    // right block (mirror)
    doc.save();
    const rightX = W - 70 - 70;
    doc.moveTo(rightX + 70, H - 120);
    doc.lineTo(rightX + 70 - leftWTop, H - 420);
    doc.lineTo(rightX + 6, H - 420);
    doc.lineTo(rightX, H - 120);
    doc.closePath();
    doc.fill(amber);

    doc.moveTo(rightX + 70 - 10, H - 120);
    doc.lineTo(rightX + 70 - leftWTop, H - 420);
    doc.lineTo(rightX + 70 - leftWTop - 6, H - 120);
    doc.closePath();
    doc.fill(amberDark);
    doc.restore();

    /* ---------------- Add barcode top-right ---------------- */
    // generate a simple random barcode value for now (change later)
    const barcodeValue = `ZYA-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    
    console.log("Bar code :",barcodeValue);
    // generate barcode buffer (PNG)
    const barcodeBuffer = await generateBarcodePngBuffer(barcodeValue, { scale: 2, height: 50, includetext: false });

    // position at top-right (respecting right margin)
    const barcodeWidth = 140; // target width in PDF points
    const barcodeHeight = 40; // target height in PDF points
    const barcodeX = W - doc.page.margins.right - barcodeWidth - 30; // 20 px padding from margin
    const barcodeY = doc.page.margins.top - 10; // little above content area; adjust if needed

    // draw the barcode
    try {
      doc.image(barcodeBuffer, barcodeX, barcodeY, { width: barcodeWidth, height: barcodeHeight });
    } catch (err) {
      // fallback: ignore barcode drawing if any issue
      console.error('Failed to place barcode on PDF:', err);
    }


    // === CONTENT OFFSET - Move all content down by this amount ===
    const contentOffsetY = 80;

    // === Header text (CERTIFICATE / OF APPRECIATION) ===
    doc.fillColor(black);
    doc.fontSize(48).font('Helvetica-Bold').text('CERTIFICATE', 25, contentOffsetY+38, { align: 'center', characterSpacing: 4 });
    doc.fontSize(14).font('Helvetica').fillColor(grey).text('OF APPRECIATION', { align: 'center', characterSpacing: 4 });

    // spacer
    doc.moveDown(2);

    // === Proudly Presented To ===
    doc.fillColor(black).font('Helvetica-Bold').fontSize(14).text('PROUDLY PRESENTED TO', 15, doc.y + 6, {
      align: 'center',
      characterSpacing: 2,
    });

    // small gap
    doc.moveDown(0.8);

    // === Name in script-like font (red) ===
    const nameFont = hasScriptFont ? 'Script' : 'Helvetica-Oblique'; // fallback
    // larger font size for long names clamp
    const nameFontSize = Math.min(62, Math.max(30, 220 / Math.max(1, userName.length / 6)));
    doc.fillColor(red).font(nameFont).fontSize(nameFontSize);
    // center the name manually to allow a thin underline later
    const nameWidth = doc.widthOfString(userName);
    const nameX = (W - nameWidth) / 2;
    const nameY = doc.y + 10;
    doc.text(userName, nameX, nameY, { lineBreak: false });

    // underline below the name
    const underlineY = nameY + doc.currentLineHeight() + 6;
    doc.save();
    doc.moveTo(nameX + 10, underlineY).lineTo(nameX + nameWidth - 10, underlineY);
    doc.lineWidth(1).strokeColor('#b33b3b').stroke();
    doc.restore();

    // move cursor below underline
    doc.y = underlineY + 10;

    // === Description text (centered grey) ===
    const description = `For successfully completing the course "${courseName}" from ${parsedStartDate} to ${parsedEndDate}.`;
    doc.font('Helvetica').fontSize(16).fillColor(grey).text(description, 180, doc.y + 10, {
      align: 'center',
      width: W - 400,
      lineGap: 5,
    });

    // === Award badge in center (red circle + ribbons) ===
    const badgeCenterX = W / 2;
    const badgeCenterY = doc.y + 80;
    const badgeRadius = 38;

    // circle
    doc.save();
    doc.circle(badgeCenterX, badgeCenterY, badgeRadius).fill(red);

    // small inner circle to simulate border
    doc.circle(badgeCenterX, badgeCenterY, badgeRadius - 8).fill(redDark);

    // white text year + AWARD
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12).text(String(new Date().getFullYear()), badgeCenterX - 20, badgeCenterY - 12, {
      width: 40,
      align: 'center',
    });
    doc.fontSize(10).text('AWARD', badgeCenterX - 20, badgeCenterY - 0, { width: 40, align: 'center' });
    doc.restore();

    // ribbons below badge
    doc.save();
    const ribbonW = 18;
    const ribbonH = 48;
    // left ribbon
    doc.moveTo(badgeCenterX - 10, badgeCenterY + badgeRadius - 6);
    doc.lineTo(badgeCenterX - 10 - ribbonW, badgeCenterY + badgeRadius + ribbonH);
    doc.lineTo(badgeCenterX - 10 + 6, badgeCenterY + badgeRadius + ribbonH);
    doc.closePath();
    doc.fill(red);

    // right ribbon
    doc.moveTo(badgeCenterX + 10, badgeCenterY + badgeRadius - 6);
    doc.lineTo(badgeCenterX + 10 + ribbonW, badgeCenterY + badgeRadius + ribbonH);
    doc.lineTo(badgeCenterX + 10 - 6, badgeCenterY + badgeRadius + ribbonH);
    doc.closePath();
    doc.fill(redDark);

    doc.restore();

    // // move down to area for date/signature
    // doc.y = badgeCenterY + badgeRadius + ribbonH + 10;

    // // === Date and Signature lines ===
    // const lineY = doc.y + 20;
    // const leftLineX1 = 120;
    // const leftLineX2 = 300;
    // const rightLineX1 = W - 300;
    // const rightLineX2 = W - 120;

    // // left line
    // doc.save();
    // doc.moveTo(leftLineX1, lineY).lineTo(leftLineX2, lineY).lineWidth(1).strokeColor(black).stroke();
    // doc.font('Helvetica').fontSize(11).fillColor(black).text('DATE', leftLineX1, lineY + 6, { width: leftLineX2 - leftLineX1, align: 'center' });

    // // right line
    // doc.moveTo(rightLineX1, lineY).lineTo(rightLineX2, lineY).lineWidth(1).strokeColor(black).stroke();
    // doc.font('Helvetica').fontSize(11).fillColor(black).text('SIGNATURE', rightLineX1, lineY + 6, { width: rightLineX2 - rightLineX1, align: 'center' });

    // doc.restore();

    /* ---------------- Add QR Code bottom-left ---------------- */
    // Get QR buffer
    const qrBuffer = await generateZiyaQr();
    // bottom-left corner (adjust x,y as needed)
    const qrSize = 80;                      // final size in PDF points
    const xPos   = 40;                      // distance from left edge
    const yPos   = doc.page.height - qrSize - 40; // distance from bottom edge
    doc.image(qrBuffer, xPos, yPos, { width: qrSize, height: qrSize });

    // finalize PDF
    doc.end();

    generatedFiles.push({
      name: userName,
      url: `http://localhost:5000/certificates/${fileName}`,
      path: certPath,
      barcode: barcodeValue, // return barcode value so you can store it or verify later
    });
  };

  return generatedFiles;
};
