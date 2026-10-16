/**
 * Script phục hồi dữ liệu hệ thống (Restore) từ gói sao lưu ZIP.
 * Cách dùng:
 *   node scripts/restore.cjs <path_to_backup_zip> [--target-dir <dir>]
 * Nếu không chỉ định target-dir, mặc định phục hồi trực tiếp vào ứng dụng hiện tại.
 */

const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

const backupZipArg = args[0];
let targetDir = rootDir;

const targetDirIdx = args.indexOf('--target-dir');
if (targetDirIdx !== -1 && args[targetDirIdx + 1]) {
  targetDir = path.resolve(args[targetDirIdx + 1]);
}

if (!backupZipArg) {
  console.error('\n[LỖI] Thiếu đường dẫn tệp sao lưu.');
  console.log('Cách dùng: node scripts/restore.cjs <duong_dan_backup.zip> [--target-dir <thu_muc_dich>]\n');
  process.exit(1);
}

const backupZipPath = path.resolve(backupZipArg);
if (!fs.existsSync(backupZipPath)) {
  console.error(`\n[LỖI] Không tìm thấy tệp sao lưu tại: ${backupZipPath}\n`);
  process.exit(1);
}

async function runRestore() {
  console.log('====================================================');
  console.log('   BẮT ĐẦU QUY TRÌNH PHỤC HỒI HỆ THỐNG (RESTORE)    ');
  console.log(`   Nguồn sao lưu: ${backupZipPath}`);
  console.log(`   Đích phục hồi: ${targetDir}`);
  console.log('====================================================\n');

  const zip = new AdmZip(backupZipPath);
  const zipEntries = zip.getEntries();

  // Kiểm tra tính toàn vẹn thông qua manifest.json
  const manifestEntry = zipEntries.find(e => e.entryName === 'manifest.json');
  if (manifestEntry) {
    try {
      const manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
      console.log(`[XÁC THỰC] Bản sao lưu tạo lúc: ${manifest.backupTimestamp} (Phiên bản: ${manifest.version})`);
    } catch (e) {
      console.warn('[CẢNH BÁO] Không thể đọc manifest.json, tiếp tục giải nén...');
    }
  }

  // 1. Phục hồi Cơ sở dữ liệu SQLite
  const dbEntry = zipEntries.find(e => e.entryName === 'database/dev.db' || e.entryName === 'dev.db');
  if (dbEntry) {
    const targetDbDir = path.join(targetDir, 'prisma');
    if (!fs.existsSync(targetDbDir)) {
      fs.mkdirSync(targetDbDir, { recursive: true });
    }
    const targetDbPath = path.join(targetDbDir, 'dev.db');
    
    // Nếu tệp DB đích đã có, tạo bản lưu trữ tạm trước khi ghi đè
    if (fs.existsSync(targetDbPath)) {
      const bakPath = `${targetDbPath}.bak_${Date.now()}`;
      fs.copyFileSync(targetDbPath, bakPath);
      console.log(`[AN TOÀN] Đã lưu bản sao trước phục hồi: ${bakPath}`);
    }

    fs.writeFileSync(targetDbPath, dbEntry.getData());
    console.log(`[1/2] Phục hồi cơ sở dữ liệu thành công -> ${targetDbPath}`);
  } else {
    console.warn('[CẢNH BÁO] Không tìm thấy tệp database trong gói sao lưu!');
  }

  // 2. Phục hồi Thư mục Uploads (public/uploads)
  const targetUploadsDir = path.join(targetDir, 'public', 'uploads');
  if (!fs.existsSync(targetUploadsDir)) {
    fs.mkdirSync(targetUploadsDir, { recursive: true });
  }

  let uploadFilesRestored = 0;
  for (const entry of zipEntries) {
    if (entry.entryName.startsWith('uploads/') && !entry.isDirectory) {
      const relPath = entry.entryName.replace(/^uploads\//, '');
      const outPath = path.join(targetUploadsDir, relPath);
      const outDir = path.dirname(outPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(outPath, entry.getData());
      uploadFilesRestored++;
    }
  }
  console.log(`[2/2] Phục hồi tệp uploads thành công: ${uploadFilesRestored} tệp vào -> ${targetUploadsDir}`);

  console.log('\n====================================================');
  console.log('[THÀNH CÔNG] ĐÃ HOÀN TẤT PHỤC HỒI DỮ LIỆU HỆ THỐNG');
  console.log('====================================================\n');
}

runRestore().catch((err) => {
  console.error('[LỖI PHỤC HỒI]', err);
  process.exit(1);
});
