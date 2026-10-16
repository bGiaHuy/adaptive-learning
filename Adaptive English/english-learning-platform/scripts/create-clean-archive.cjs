const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..'); // english-learning-platform
const workspaceRoot = path.resolve(rootDir, '..'); // Adaptive English
const targetZipDir = rootDir;
const zipFileName = 'adaptive-english-clean-delivery.zip';
const outZipPath = path.join(targetZipDir, zipFileName);

console.log('====================================================');
console.log('   TẠO GÓI MÃ NGUỒN BÀN GIAO SẠCH (CLEAN ARCHIVE)   ');
console.log('====================================================\n');

const zip = new AdmZip();

// Các mẫu thư mục và tệp nhạy cảm/không cần thiết bị loại bỏ
const excludedNames = new Set([
  'node_modules',
  '.next',
  '.git',
  '.DS_Store',
  'dev.db',
  'dev.db-journal',
  '.turbo',
  'dist',
  'backups',
  'coverage',
  '.checkpoint',
  'source-clean-archive.zip',
  'adaptive-english-clean-delivery.zip',
]);

function shouldExclude(relPath) {
  const parts = relPath.split(/[/\\]/);
  // Loại bỏ nếu chứa tên trong excludedNames
  if (parts.some(p => excludedNames.has(p))) return true;
  // Loại bỏ các tệp .env có chứa secret thực tế (chỉ giữ lại .env.example)
  const fileName = parts[parts.length - 1];
  if (fileName.startsWith('.env') && fileName !== '.env.example') return true;
  // Loại bỏ tệp database SQLite (.db, .db-shm, .db-wal)
  if (fileName.endsWith('.db') || fileName.endsWith('.db-journal') || fileName.endsWith('.db-shm') || fileName.endsWith('.db-wal')) return true;
  // Loại bỏ các bản ghi âm người dùng thực tế nếu có trong uploads/audio
  if (relPath.includes('uploads') && relPath.includes('audio') && fileName.endsWith('.webm')) return true;
  return false;
}

function addDirectory(baseDir, zipPrefix) {
  if (!fs.existsSync(baseDir)) return;
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);
    const relFromBase = path.relative(workspaceRoot, fullPath);

    if (shouldExclude(relFromBase)) {
      continue;
    }

    const entryZipPath = path.posix.join(zipPrefix, entry.name);

    if (entry.isDirectory()) {
      addDirectory(fullPath, entryZipPath);
    } else if (entry.isFile()) {
      const data = fs.readFileSync(fullPath);
      zip.addFile(entryZipPath, data);
    }
  }
}

// 1. Thêm mã nguồn ứng dụng english-learning-platform
console.log('[1/4] Đóng gói thư mục ứng dụng english-learning-platform...');
addDirectory(rootDir, 'english-learning-platform');

// 2. Thêm thư mục tài liệu docs/
console.log('[2/4] Đóng gói thư mục tài liệu docs/...');
addDirectory(path.join(workspaceRoot, 'docs'), 'docs');

// 3. Thêm thư mục scripts/ ở thư mục gốc
console.log('[3/4] Đóng gói thư mục scripts/ gốc...');
addDirectory(path.join(workspaceRoot, 'scripts'), 'scripts');

// 4. Thêm các tệp tài liệu gốc quan trọng (README.md, AGENTS.md, .gitignore)
console.log('[4/4] Đóng gói các tệp cấu hình gốc...');
const rootFiles = ['README.md', 'AGENTS.md', '.gitignore'];
for (const rf of rootFiles) {
  const fp = path.join(workspaceRoot, rf);
  if (fs.existsSync(fp)) {
    zip.addFile(rf, fs.readFileSync(fp));
  }
}

// Ghi file ZIP
zip.writeZip(outZipPath);

const stats = fs.statSync(outZipPath);
console.log('\n====================================================');
console.log(`[THÀNH CÔNG] ĐÃ TẠO GÓI BÀN GIAO SẠCH: ${zipFileName}`);
console.log(`Dung lượng: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
console.log(`Đường dẫn: ${outZipPath}`);
console.log('====================================================\n');
