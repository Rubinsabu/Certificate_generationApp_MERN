// utils/generateQr.js
const QRCode = require('qrcode');

/**
 * Generates a PNG buffer of the Ziya Academy QR code.
 * @returns {Promise<Buffer>}
 */
exports.generateZiyaQr = async function () {
  const url = 'https://www.ziyaacademy.co.in/';
  return QRCode.toBuffer(url, {
    type: 'png',
    margin: 1,
    width: 150,       // pixel size of PNG; we will scale in PDF anyway
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
};
