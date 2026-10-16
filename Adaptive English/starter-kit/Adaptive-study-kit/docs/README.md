# Adaptive study — UI & motion kit v1

Open `index.html` after extracting the ZIP. No install or build needed. Open `components.html` for interactive UI and `motion.html` for mascot animations.

## Contents
- Editable HTML/CSS/JS components and JSON tokens.
- Original vector frog adaptation with leaf, rosy cheeks, cream belly, blue scarf.
- 8 CSS-animated SVGs and 8 looping GIF previews; static SVG/PNG fallback.
- Mascot contact sheet, SVG icons, motion specifications.

## Scope
This is a design/asset kit, not the complete application. Assessment, FSRS, document parsing, AI, enrollment, authentication and server synchronization are not implemented. Component demos use local state; Writing demo saves locally only. All levels, feedback and scores are illustrative.

## Font
Offline system font stack. Rounded heavy headings approximate the visual direction; production font choice remains open. No remote font dependencies.

## Integration
Reuse styles/components.css and relevant markup/JS. SVG sources have named groups: frog, leaf, eyes, hand, mouth. Colors are editable. CSS animated SVGs work in modern browsers; importing into a design editor may retain only the static vector. GIF is preview/export only, not preferred UI rendering. No Lottie or Rive files are included.

## Reduced motion
The preview toggle swaps animated SVGs for the static mascot. SVG/CSS assets also honor prefers-reduced-motion. GIFs do not; do not autoplay GIFs in a reduced-motion experience.

## Privacy
Demo text stays in your browser's localStorage. Clear site data to remove it. No telemetry or external services.

## Verification
SVG XML, file links, GIF frame counts and JavaScript syntax checked. Browser layout/interaction QA was not available; review the HTML preview in your browser before integrating.

## Verification
SVG XML, file links, GIF frame counts and JavaScript syntax checked. Browser layout/interaction QA was not available; review the HTML preview in your browser before integrating.
