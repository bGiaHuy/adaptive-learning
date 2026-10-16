/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', '@napi-rs/canvas'],
    outputFileTracingIncludes: {
      '/api/teacher/import-docx': ['./node_modules/pdf-parse/dist/**/*', './node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', './node_modules/@napi-rs/canvas/**/*', './node_modules/@napi-rs/canvas-*/**/*'],
      '/api/dictionary': ['./data/dictionary.db.gz'],
      '/api/vocab': ['./data/dictionary.db.gz'],
    },
  },
};
