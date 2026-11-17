import React, { useMemo } from 'react';
import { marked } from 'marked';

// Configure marked defaults
marked.setOptions({
  gfm: true,
  breaks: true
});

export default function MarkdownView({ content, className = '' }) {
  const htmlContent = useMemo(() => {
    if (!content || typeof content !== 'string') return '';
    try {
      return marked.parse(content);
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div
      className={`markdown-body select-text text-xs sm:text-sm leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
