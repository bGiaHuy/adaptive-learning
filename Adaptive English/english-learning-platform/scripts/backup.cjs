/**
 * Script sao lưu toàn bộ dữ liệu hệ thống (Database SQLite + File Uploads: docx & audio)
 * Cách dùng:
 *   node scripts/backup.cjs [output_dir]
 * Mặc định lưu trữ tệp sao lưu nén tại thư mục backups/
 */

const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const defaultBackupDir = path.join(rootDir, 'backups');

const targetBackupDir = process.argv[2] ? path.resolve(process.argv[2]) : defaultBackupDir;

if (!fs.existsSync(targetBackupDir)) {
  fs.mkdirSync(targetBackupDir, { recursive: true });
}

function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const h = pad(now.getHours());
  const min = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  return `${y}${m}${d}_${h}${min}${s}`;
}

async function runBackup() {
  const timestamp = getTimestamp();
  const backupZipName = `backup_adaptive_english_${timestamp}.zip`;
  const backupZipPath = path.join(targetBackupDir, backupZipName);

  console.log('====================================================');
  console.log('   BẮT ĐẦU QUY TRÌNH SAO LƯU HỆ THỐNG (BACKUP)      ');
  console.log('====================================================\n');

  const zip = new AdmZip();

  // 1. Sao lưu Cơ sở dữ liệu SQLite
  const dbPath = path.join(rootDir, 'prisma', 'dev.db');
  if (fs.existsSync(dbPath)) {
    console.log(`[1/3] Đang sao lưu cơ sở dữ liệu: ${dbPath}`);
    zip.addLocalFile(dbPath, 'database');
  } else {
    console.warn(`[CẢNH BÁO] Không tìm thấy tệp cơ sở dữ liệu tại ${dbPath}`);
  }

  // 2. Sao lưu Thư mục File Tải Lên (Uploads: docx và audio)
  const uploadsDir = path.join(rootDir, 'public', 'uploads');
  if (fs.existsSync(uploadsDir)) {
    console.log(`[2/3] Đang sao lưu thư mục tệp người dùng: ${uploadsDir}`);
    zip.addLocalFolder(uploadsDir, 'uploads');
  } else {
    console.log('[2/3] Thư mục uploads chưa có tệp tải lên.');
  }

  // 3. Tạo Tệp Manifest Ghi Nhận Siêu Dữ Liệu
  const manifest = {
    backupTimestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'Adaptive English',
    database: 'SQLite (prisma/dev.db)',
    uploadPath: 'public/uploads',
    nodeVersion: process.version,
  };
  zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'));

  console.log(`[3/3] Đang nén tệp sao lưu vào: ${backupZipPath}`);
  zip.writeZip(backupZipPath);

  const stats = fs.statSync(backupZipPath);
  console.log('\n====================================================');
  console.log(`[THÀNH CÔNG] Đã tạo gói sao lưu: ${backupZipName}`);
  console.log(`Dung lượng: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`Vị trí: ${backupZipPath}`);
  console.log('====================================================\n');

  return backupZipPath;
}

runBackup().catch((err) => {
  console.error('[LỖI SAO LƯU]', err);
  process.exit(1);
});
