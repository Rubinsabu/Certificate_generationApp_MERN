const bwipjs = require('bwip-js');
/**
 * Generates a Code128 barcode PNG buffer for the provided text.
 * @param {string} text - The barcode text.
 * @param {Object} [opts] - Optional options (scale, height, includetext).
 * @returns {Promise<Buffer>}
 */
async function generateBarcodePngBuffer(text, opts = {}) {
  const options = {
    bcid: 'code128',       // Barcode type
    text: String(text),    // Text to encode
    scale: opts.scale || 2,    // 1..10 (pixel scale)
    height: opts.height || 40, // Bar height in pixels
    includetext: opts.includetext !== undefined ? opts.includetext : false,
    textxalign: 'center',
    paddingwidth: 5,
    paddingheight: 5,
  };

  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(options, (err, png) => {
      if (err) return reject(err);
      resolve(png);
    });
  });
}

module.exports = {
  generateBarcodePngBuffer,
};
