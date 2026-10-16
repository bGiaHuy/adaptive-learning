// PDF.js needs these globals even when extracting text without rendering a page.
// Load the native adapter first; a static PDF import would run before this setup.
const canvas = require('@napi-rs/canvas');
for (const name of ['DOMMatrix', 'ImageData', 'Path2D']) {
  if (!(globalThis as any)[name]) (globalThis as any)[name] = canvas[name];
}
export const PDFParse: typeof import('pdf-parse').PDFParse = require('pdf-parse').PDFParse;
