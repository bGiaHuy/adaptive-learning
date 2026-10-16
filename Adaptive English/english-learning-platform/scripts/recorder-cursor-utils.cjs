/**
 * Utility chèn lớp con trỏ ảo mượt mà và hiệu ứng sóng click (ripple)
 * Tuân thủ quy định:
 * - pointer-events: none (không cản trở bất kỳ tương tác thực nào)
 * - Tọa độ thực từ mousemove và mousedown của Chrome DevTools Protocol
 * - Tự động thiết lập lại khi chuyển trang
 */

const CURSOR_INJECTION_SCRIPT = `
(function() {
  if (window.__adaptiveCursorInjected) return;
  window.__adaptiveCursorInjected = true;

  // Ẩn con trỏ chuột mặc định để tránh hiển thị 2 con trỏ
  const style = document.createElement('style');
  style.id = '__adaptive_cursor_style';
  style.innerHTML = \`
    * { cursor: none !important; }
    #__adaptive_cursor_container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none !important;
      z-index: 2147483647;
      overflow: hidden;
    }
    #__adaptive_cursor_pointer {
      position: absolute;
      width: 24px;
      height: 24px;
      transform: translate(-2px, -2px);
      pointer-events: none !important;
      transition: transform 0.05s ease-out;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }
    .adaptive_click_ripple {
      position: absolute;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(79, 70, 229, 0.4) 0%, rgba(99, 102, 241, 0.1) 70%, transparent 100%);
      border: 2px solid rgba(79, 70, 229, 0.8);
      transform: translate(-50%, -50%) scale(0.2);
      pointer-events: none !important;
      animation: adaptive_ripple_anim 0.5s ease-out forwards;
    }
    @keyframes adaptive_ripple_anim {
      0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
    }
  \`;
  function initCursor() {
    if (!document.head || !document.body) {
      document.addEventListener('DOMContentLoaded', initCursor, { once: true });
      return;
    }

    if (!document.getElementById('__adaptive_cursor_style')) {
      document.head.appendChild(style);
    }

    let container = document.getElementById('__adaptive_cursor_container');
    if (!container) {
      container = document.createElement('div');
      container.id = '__adaptive_cursor_container';
      container.innerHTML = \`
        <div id="__adaptive_cursor_pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 2L20 12L12 14L9 22L4 2Z" fill="#1E293B" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>
      \`;
      document.body.appendChild(container);
    }

    const pointer = document.getElementById('__adaptive_cursor_pointer');
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    pointer.style.left = currentX + 'px';
    pointer.style.top = currentY + 'px';

    window.addEventListener('mousemove', (e) => {
      currentX = e.clientX;
      currentY = e.clientY;
      pointer.style.left = currentX + 'px';
      pointer.style.top = currentY + 'px';
    }, { passive: true });

    window.addEventListener('mousedown', (e) => {
      const ripple = document.createElement('div');
      ripple.className = 'adaptive_click_ripple';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      container.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }, { passive: true });

    // Canvas hoạt ảnh vi mô 30+ FPS liên tục đảm bảo Chrome Screencast không bị dừng lại khi trang tĩnh
    let animCanvas = document.getElementById('__adaptive_screencast_canvas');
    if (!animCanvas) {
      animCanvas = document.createElement('canvas');
      animCanvas.id = '__adaptive_screencast_canvas';
      animCanvas.width = 4;
      animCanvas.height = 4;
      animCanvas.style.position = 'fixed';
      animCanvas.style.bottom = '0';
      animCanvas.style.right = '0';
      animCanvas.style.opacity = '0.01';
      animCanvas.style.pointerEvents = 'none';
      animCanvas.style.zIndex = '2147483646';
      document.body.appendChild(animCanvas);
      const ctx = animCanvas.getContext('2d');
      let colorToggle = 0;
      function animLoop() {
        colorToggle = (colorToggle + 1) % 2;
        ctx.fillStyle = colorToggle === 0 ? '#ffffff' : '#000000';
        ctx.fillRect(0, 0, 4, 4);
        requestAnimationFrame(animLoop);
      }
      requestAnimationFrame(animLoop);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursor, { once: true });
  } else {
    initCursor();
  }
})();
`;

async function enableCursorOverlay(page) {
  await page.evaluateOnNewDocument(CURSOR_INJECTION_SCRIPT);
  await page.evaluate(CURSOR_INJECTION_SCRIPT).catch(() => {});
}

/**
 * Di chuyển chuột mượt mà tới tọa độ đích với vận tốc tự nhiên và gia tốc (easing)
 */
async function smoothMoveMouse(page, targetX, targetY, durationMs = 600) {
  const steps = Math.max(15, Math.floor(durationMs / 20));
  // Lấy tọa độ hiện tại
  const currentPos = await page.evaluate(() => {
    const p = document.getElementById('__adaptive_cursor_pointer');
    if (!p) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    return { x: parseFloat(p.style.left) || 0, y: parseFloat(p.style.top) || 0 };
  });

  const startX = currentPos.x;
  const startY = currentPos.y;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    // Cubic ease-in-out
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const curX = startX + (targetX - startX) * ease;
    const curY = startY + (targetY - startY) * ease;

    await page.mouse.move(curX, curY);
    await new Promise(r => setTimeout(r, durationMs / steps));
  }
}

/**
 * Di chuyển chuột đến một phần tử hiển thị thực tế, dừng nhẹ để mắt kịp nhận diện, rồi click chuột thật
 */
async function moveAndClick(page, elementOrSelector, preClickPauseMs = 400, postClickPauseMs = 600) {
  let element = null;
  if (typeof elementOrSelector === 'string') {
    element = await page.waitForSelector(elementOrSelector, { visible: true, timeout: 10000 });
  } else {
    element = elementOrSelector;
  }

  // Cuộn vào khung nhìn mượt mà
  await element.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  await new Promise(r => setTimeout(r, 300));

  const box = await element.boundingBox();
  if (!box) {
    throw new Error('Element boundingBox not found or element is not visible');
  }

  const targetX = box.x + box.width / 2;
  const targetY = box.y + box.height / 2;

  // Di chuyển mượt mà tới tâm của nút
  await smoothMoveMouse(page, targetX, targetY, 600);

  // Dừng nhẹ để người xem nhận biết vị trí nút
  await new Promise(r => setTimeout(r, preClickPauseMs));

  // Thực hiện click chuột thật của Chrome DevTools (bắn đầy đủ mousedown, mouseup, click)
  await page.mouse.down();
  await new Promise(r => setTimeout(r, 80));
  await page.mouse.up();

  // Dừng sau khi click để kết quả kịp xuất hiện và người xem kịp quan sát
  await new Promise(r => setTimeout(r, postClickPauseMs));
}

module.exports = {
  enableCursorOverlay,
  smoothMoveMouse,
  moveAndClick,
};
