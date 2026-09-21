import React, { useMemo } from 'react';
import katex from 'katex';

export default function MathRenderer({ text, inline = true }) {
  const renderedContent = useMemo(() => {
    if (!text) return '';
    
    // Check if the text contains LaTeX expressions, e.g. \sqrt{...} or \frac{...} or contains $...$
    // If text has $...$, parse parts
    if (text.includes('$')) {
      const parts = text.split('$');
      return parts.map((part, idx) => {
        if (idx % 2 === 1) {
          // math part
          try {
            return (
              <span
                key={idx}
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(part, {
                    throwOnError: false,
                    displayMode: false
                  })
                }}
              />
            );
          } catch (e) {
            return <span key={idx}>{part}</span>;
          }
        }
        return <span key={idx}>{part}</span>;
      });
    }

    // If string itself starts with or contains backslash math commands like \sqrt or \frac or \begin
    if (text.includes('\\')) {
      try {
        const html = katex.renderToString(text, {
          throwOnError: false,
          displayMode: !inline
        });
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
      } catch (e) {
        return <span>{text}</span>;
      }
    }

    return <span>{text}</span>;
  }, [text, inline]);

  return <span className="math-render-wrapper">{renderedContent}</span>;
}
