/**
 * Script khởi tạo tài khoản quản trị viên (Admin) ban đầu an toàn cho môi trường Production.
 * Cách dùng:
 *   node scripts/init-admin.cjs <email> <password> "<họ và tên>"
 * Ví dụ:
 *   node scripts/init-admin.cjs admin@school.edu.vn "SecurePass123!" "Quản Trị Viên Hệ Thống"
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initAdmin() {
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];
  const name = args[2] || 'Quản Trị Viên';

  if (!email || !password) {
    console.error('\n[LỖI] Thiếu tham số bắt buộc.');
    console.log('Cách dùng: node scripts/init-admin.cjs <email> <password> "[họ và tên]"');
    console.log('Ví dụ: node scripts/init-admin.cjs admin@domain.edu.vn "MatKhauManh123!" "Admin Hệ Thống"\n');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('\n[LỖI] Mật khẩu quản trị viên phải có độ dài tối thiểu 8 ký tự vì lý do an toàn.\n');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    if (existing) {
      console.log(`\n-> Tài khoản ${normalizedEmail} đã tồn tại. Tiến hành nâng quyền lên 'admin' và cập nhật mật khẩu mới...`);
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: 'admin',
          passwordHash,
          name,
        },
      });
      // Thu hồi tất cả phiên đăng nhập cũ của tài khoản này
      await prisma.session.deleteMany({ where: { userId: existing.id } });
      console.log(`[THÀNH CÔNG] Đã cập nhật tài khoản Admin: ID=${updated.id}, Email=${updated.email}, Tên="${updated.name}".`);
      console.log(`[BẢO MẬT] Mọi phiên đăng nhập cũ của tài khoản này đã được thu hồi an toàn.\n`);
    } else {
      console.log(`\n-> Khởi tạo tài khoản Quản trị viên mới: ${normalizedEmail}...`);
      const created = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name,
          role: 'admin',
        },
      });
      console.log(`[THÀNH CÔNG] Đã tạo tài khoản Admin ban đầu: ID=${created.id}, Email=${created.email}, Tên="${created.name}".\n`);
    }
  } catch (error) {
    console.error('[LỖI] Không thể tạo tài khoản admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initAdmin();
