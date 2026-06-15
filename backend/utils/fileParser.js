const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const parsePDF = async (buffer) => {
  const { PDFParse } = require('pdf-parse');
  const parser = new PDFParse({ data: buffer, verbosity: 0 });
  const info = await parser.getText({ lineEnforce: false });
  let text = info.text || '';
  const pageCount = info.total;

  if (text.trim().length < 20) {
    try {
      const screenshot = await parser.getScreenshot({
        imageDataUrl: true,
        imageBuffer: false,
        desiredWidth: 1200
      });
      const Tesseract = require('tesseract.js');
      let ocrText = '';
      const maxPages = Math.min(screenshot.pages.length, 5);
      for (let i = 0; i < maxPages; i++) {
        const page = screenshot.pages[i];
        if (page.dataUrl) {
          const result = await Tesseract.recognize(page.dataUrl, 'eng');
          ocrText += result.data.text + '\n';
        }
      }
      if (ocrText.trim().length > text.trim().length) {
        text = ocrText;
      }
    } catch (ocrErr) {
      console.error('OCR fallback failed:', ocrErr.message);
    }
  }

  await parser.destroy();
  return { text, pageCount };
};

const parseDOCX = async (buffer) => {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value, pageCount: Math.ceil(result.value.split(/\s+/).length / 300) };
};

const downloadFile = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
};

const getExt = (filePath) => {
  const cleaned = filePath.split('?')[0];
  const parts = cleaned.split('.');
  return parts.pop().toLowerCase();
};

const parseFileFromUrl = async (fileUrl) => {
  let buffer;
  let ext;

  if (fileUrl.startsWith('/uploads/')) {
    const localPath = path.join(__dirname, '..', fileUrl);
    buffer = fs.readFileSync(localPath);
    ext = getExt(fileUrl);
  } else if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    buffer = await downloadFile(fileUrl);
    ext = getExt(fileUrl);
  } else {
    throw new Error('Unsupported file path. Must start with /uploads/ or http(s)://');
  }

  if (ext === 'pdf') return parsePDF(buffer);
  if (ext === 'docx') return parseDOCX(buffer);
  throw new Error(`Unsupported file type: .${ext}. Only PDF and DOCX are supported.`);
};

module.exports = { parseFileFromUrl, parsePDF, parseDOCX };
