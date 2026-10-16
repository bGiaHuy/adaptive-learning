'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';

interface ComponentInfo {
  name: string;
  file?: string;
  line?: number;
  stack: string[];
  element: HTMLElement;
}

// Helper to normalize file paths to clean relative paths
function formatFilePath(rawPath?: string): string {
  if (!rawPath) return '';
  const normalized = rawPath.replace(/\\/g, '/');
  const srcIndex = normalized.indexOf('/src/');
  if (srcIndex !== -1) {
    return normalized.slice(srcIndex + 1); // e.g. "src/components/ui/Header.tsx"
  }
  const appIndex = normalized.indexOf('english-learning-platform/');
  if (appIndex !== -1) {
    return normalized.slice(appIndex + 'english-learning-platform/'.length);
  }
  return normalized;
}

// Extract component details from React 18 Fiber tree
function getFiberInfoFromElement(element: Element): { name: string; file?: string; line?: number; stack: string[] } | null {
  const keys = Object.keys(element);
  let fiberKey = keys.find((k) => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
  if (!fiberKey) return null;

  let curr = (element as any)[fiberKey];
  const stack: string[] = [];
  let primaryName = '';
  let primaryFile = '';
  let primaryLine: number | undefined;

  while (curr) {
    let name = '';
    if (typeof curr.type === 'function') {
      name = curr.type.displayName || curr.type.name || '';
    } else if (curr.type && typeof curr.type === 'object') {
      name = curr.type.displayName || curr.type.name || curr.type.render?.displayName || curr.type.render?.name || '';
    }

    // Filter noise (Next.js layout internals, dev fragments, providers that aren't visual components)
    const ignoreList = ['InnerLayout', 'OuterLayout', 'App', 'Fragment', 'Suspense', 'ClientPageRoot', 'HotReload', 'DevAgentAnnotator', 'DevOverlay'];
    if (name && !name.startsWith('_') && !ignoreList.includes(name)) {
      if (!stack.includes(name)) {
        stack.push(name);
      }
      if (!primaryName && name !== 'DevAgentAnnotator') {
        primaryName = name;
        if (curr._debugSource) {
          primaryFile = curr._debugSource.fileName || '';
          primaryLine = curr._debugSource.lineNumber;
        }
      }
    }
    curr = curr.return;
  }

  if (!primaryName) return null;

  return {
    name: primaryName,
    file: formatFilePath(primaryFile),
    line: primaryLine,
    stack: stack.reverse(),
  };
}

export function DevAgentAnnotator() {
  const [enabled, setEnabled] = useState(true);
  const [inspectMode, setInspectMode] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [hoveredInfo, setHoveredInfo] = useState<ComponentInfo | null>(null);
  const [pinnedInfo, setPinnedInfo] = useState<ComponentInfo | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [componentStats, setComponentStats] = useState<{ [name: string]: { count: number; file: string } }>({});

  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Scan and annotate all DOM elements with data attributes
  const annotateDOM = useCallback(() => {
    if (!enabled || typeof document === 'undefined') return;

    const elements = document.querySelectorAll('body *:not([data-agent-dev-tool] *)');
    const stats: { [name: string]: { count: number; file: string } } = {};

    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      // Skip the dev tool itself
      if (htmlEl.closest('[data-agent-dev-tool]')) return;

      const info = getFiberInfoFromElement(htmlEl);
      if (info && info.name) {
        htmlEl.setAttribute('data-component', info.name);
        if (info.file) {
          htmlEl.setAttribute('data-file', info.file);
        }
        if (info.line) {
          htmlEl.setAttribute('data-line', String(info.line));
        }
        if (info.stack && info.stack.length > 0) {
          htmlEl.setAttribute('data-component-stack', info.stack.join(' > '));
        }
        htmlEl.setAttribute('data-agent-locator', `component:${info.name}`);

        // Collect stats
        if (!stats[info.name]) {
          stats[info.name] = { count: 0, file: info.file || '' };
        }
        stats[info.name].count += 1;
      }
    });

    setComponentStats(stats);
  }, [enabled]);

  // Periodic and Mutation-based annotation
  useEffect(() => {
    if (!enabled) return;

    annotateDOM();

    let timeoutId: NodeJS.Timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        annotateDOM();
      }, 200);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [enabled, annotateDOM]);

  // Keyboard shortcut: Alt+A to toggle inspect mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setInspectMode((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setPinnedInfo(null);
        setInspectMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Inspect mode mouse listeners
  useEffect(() => {
    if (!inspectMode) {
      setHoveredInfo(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (!target || target.closest('[data-agent-dev-tool]')) {
        setHoveredInfo(null);
        return;
      }

      // Find closest element with component info
      let current: HTMLElement | null = target;
      let info: { name: string; file?: string; line?: number; stack: string[] } | null = null;

      while (current && current !== document.body) {
        info = getFiberInfoFromElement(current);
        if (info) break;
        current = current.parentElement;
      }

      if (info && current) {
        setHoveredInfo({
          ...info,
          element: current,
        });
      } else {
        setHoveredInfo(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (!target || target.closest('[data-agent-dev-tool]')) return;

      e.preventDefault();
      e.stopPropagation();

      if (hoveredInfo) {
        setPinnedInfo(hoveredInfo);
        setInspectMode(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { capture: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick, { capture: true });
    };
  }, [inspectMode, hoveredInfo]);

  // Copy helper with feedback
  const handleCopy = (text: string, label: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Get active target info (either pinned or hovered)
  const activeInfo = pinnedInfo || hoveredInfo;

  // Calculate target element bounding box for highlight overlay
  let highlightRect: DOMRect | null = null;
  if (activeInfo && activeInfo.element) {
    try {
      highlightRect = activeInfo.element.getBoundingClientRect();
    } catch {
      highlightRect = null;
    }
  }

  return (
    <div data-agent-dev-tool="true" className="font-sans">
      {/* 1. HIGHLIGHT OVERLAY (when inspecting or pinned) */}
      {highlightRect && (
        <div
          ref={overlayRef}
          style={{
            position: 'fixed',
            top: `${highlightRect.top}px`,
            left: `${highlightRect.left}px`,
            width: `${highlightRect.width}px`,
            height: `${highlightRect.height}px`,
            pointerEvents: 'none',
            zIndex: 999990,
            border: '2px solid #a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
            boxShadow: '0 0 16px rgba(168, 85, 247, 0.4), inset 0 0 8px rgba(168, 85, 247, 0.2)',
            borderRadius: '6px',
            transition: 'all 0.08s ease-out',
          }}
        >
          {/* Component Name Badge over target */}
          <div
            style={{
              position: 'absolute',
              top: '-24px',
              left: '0',
              backgroundColor: '#7e22ce',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <span>&lt;{activeInfo?.name} /&gt;</span>
            {activeInfo?.file && (
              <span style={{ opacity: 0.8, fontSize: '10px', fontWeight: 400 }}>
                {activeInfo.file}:{activeInfo.line || 1}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 2. VISUAL COMPONENT BADGES (when Show Badges is ON) */}
      {showBadges &&
        typeof document !== 'undefined' &&
        Array.from(document.querySelectorAll('[data-component]')).map((el, idx) => {
          const compName = el.getAttribute('data-component');
          const compFile = el.getAttribute('data-file');
          const rect = (el as HTMLElement).getBoundingClientRect();
          if (rect.width < 30 || rect.height < 20 || rect.top < -100 || rect.top > window.innerHeight + 100) {
            return null;
          }
          return (
            <div
              key={idx}
              data-agent-dev-tool="true"
              style={{
                position: 'fixed',
                top: `${Math.max(4, rect.top + 2)}px`,
                left: `${Math.max(4, rect.left + 2)}px`,
                backgroundColor: 'rgba(15, 23, 42, 0.88)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                fontSize: '10px',
                fontFamily: 'monospace',
                padding: '1px 5px',
                borderRadius: '3px',
                zIndex: 999980,
                pointerEvents: 'none',
                backdropFilter: 'blur(4px)',
                lineHeight: 1.2,
              }}
              title={compFile || compName || ''}
            >
              &lt;{compName}&gt;
            </div>
          );
        })}

      {/* 3. PINNED COMPONENT DETAIL MODAL / CARD */}
      {pinnedInfo && (
        <div
          data-agent-dev-tool="true"
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '24px',
            width: '420px',
            maxWidth: 'calc(100vw - 48px)',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #7c3aed',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            zIndex: 999995,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🔍</span>
              <strong style={{ fontSize: '15px', color: '#c084fc' }}>&lt;{pinnedInfo.name} /&gt;</strong>
            </div>
            <button
              onClick={() => setPinnedInfo(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '2px 6px',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', lineHeight: 1.5 }}>
            <div style={{ marginBottom: '4px' }}>
              <strong style={{ color: '#94a3b8' }}>Source file:</strong>{' '}
              <code style={{ color: '#38bdf8', wordBreak: 'break-all' }}>
                {pinnedInfo.file || 'Unresolved (Dynamic / Built-in)'}
                {pinnedInfo.line ? `:${pinnedInfo.line}` : ''}
              </code>
            </div>

            {pinnedInfo.stack.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#94a3b8' }}>Hierarchy:</strong>
                <div style={{ marginTop: '2px', color: '#e2e8f0', fontSize: '11px', opacity: 0.9 }}>
                  {pinnedInfo.stack.join(' → ')}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons for Agent & Dev */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <button
              onClick={() =>
                handleCopy(
                  `Hãy kiểm tra và sửa component <${pinnedInfo.name} /> trong file ${pinnedInfo.file || pinnedInfo.name}.`,
                  'agent-prompt'
                )
              }
              style={{
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>🤖</span>
              {copiedText === 'agent-prompt' ? 'Đã sao chép prompt cho Agent!' : 'Copy Prompt cho AI Agent'}
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleCopy(pinnedInfo.file || pinnedInfo.name, 'file-path')}
                style={{
                  flex: 1,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {copiedText === 'file-path' ? '✓ Đã copy path' : '📋 Copy file path'}
              </button>

              <button
                onClick={() => handleCopy(pinnedInfo.name, 'comp-name')}
                style={{
                  flex: 1,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {copiedText === 'comp-name' ? '✓ Đã copy tên' : '🏷️ Copy tên component'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPONENT INVENTORY PANEL */}
      {showInventory && (
        <div
          data-agent-dev-tool="true"
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '24px',
            width: '460px',
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: '440px',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #3b82f6',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            zIndex: 999995,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📦</span>
              <strong style={{ fontSize: '14px', color: '#60a5fa' }}>
                Component Inventory ({Object.keys(componentStats).length})
              </strong>
            </div>
            <button
              onClick={() => setShowInventory(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ✕
            </button>
          </div>

          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0' }}>
            Các component đang render trên trang hiện tại. Agent có thể dùng thông tin này để sửa trực tiếp.
          </p>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
            {Object.entries(componentStats).map(([name, data]) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  backgroundColor: '#1e293b',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9' }}>&lt;{name} /&gt;</div>
                  <div style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>
                    {data.file || 'Dynamic'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      backgroundColor: '#334155',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      color: '#cbd5e1',
                    }}
                  >
                    x{data.count}
                  </span>
                  <button
                    onClick={() => handleCopy(data.file || name, `inv-${name}`)}
                    style={{
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '10px',
                      padding: '3px 6px',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedText === `inv-${name}` ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FLOATING HUD TOOLBAR (Bottom Left) */}
      <div
        data-agent-dev-tool="true"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
        }}
      >
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            title="Mở Dev Agent Annotator"
            style={{
              backgroundColor: '#0f172a',
              color: '#a855f7',
              border: '1px solid #7c3aed',
              borderRadius: '9999px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <span>🤖</span>
            <span>Agent Dev</span>
          </button>
        ) : (
          <div
            style={{
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #7c3aed',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>🤖</span>
              <strong style={{ color: '#c084fc', fontSize: '12px' }}>Agent Annotator</strong>
              <span
                style={{
                  fontSize: '9px',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}
              >
                DEV
              </span>
            </div>

            <div style={{ height: '16px', width: '1px', backgroundColor: '#334155' }} />

            {/* Inspect Button */}
            <button
              onClick={() => {
                setInspectMode(!inspectMode);
                setPinnedInfo(null);
              }}
              title="Soi component bằng trỏ chuột (Alt + A)"
              style={{
                backgroundColor: inspectMode ? '#7c3aed' : '#1e293b',
                color: inspectMode ? '#ffffff' : '#cbd5e1',
                border: '1px solid',
                borderColor: inspectMode ? '#a855f7' : '#334155',
                borderRadius: '6px',
                padding: '5px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
                fontSize: '11px',
              }}
            >
              <span>🔍</span>
              <span>{inspectMode ? 'Đang soi...' : 'Soi (Alt+A)'}</span>
            </button>

            {/* DOM Attributes Toggle */}
            <button
              onClick={() => {
                setEnabled(!enabled);
                if (!enabled) annotateDOM();
              }}
              title="Tự động gắn data-component và data-file vào HTML DOM"
              style={{
                backgroundColor: enabled ? '#15803d' : '#1e293b',
                color: enabled ? '#ffffff' : '#94a3b8',
                border: '1px solid',
                borderColor: enabled ? '#22c55e' : '#334155',
                borderRadius: '6px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              DOM: {enabled ? 'ON' : 'OFF'}
            </button>

            {/* Badges Overlay Toggle */}
            <button
              onClick={() => setShowBadges(!showBadges)}
              title="Hiển thị nhãn component trực quan trên trang"
              style={{
                backgroundColor: showBadges ? '#0369a1' : '#1e293b',
                color: showBadges ? '#ffffff' : '#94a3b8',
                border: '1px solid',
                borderColor: showBadges ? '#38bdf8' : '#334155',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Badges
            </button>

            {/* Inventory Toggle */}
            <button
              onClick={() => setShowInventory(!showInventory)}
              title="Xem danh sách components đang render"
              style={{
                backgroundColor: showInventory ? '#2563eb' : '#1e293b',
                color: showInventory ? '#ffffff' : '#94a3b8',
                border: '1px solid',
                borderColor: showInventory ? '#60a5fa' : '#334155',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              List
            </button>

            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(true)}
              title="Thu nhỏ thanh công cụ"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px 4px',
                fontSize: '14px',
              }}
            >
              _
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
