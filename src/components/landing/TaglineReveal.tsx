import React, { useEffect, useRef } from 'react';

interface TaglineRevealProps {
  lines: string[];
}

const PUNCTUATION = /[，。、！？：；」』）]/;

// Chinese has no spaces, so each glyph is a "word"; trailing punctuation rides with the glyph before it.
const splitGlyphs = (line: string): string[] =>
  Array.from(line).reduce<string[]>((acc, ch) => {
    if (PUNCTUATION.test(ch) && acc.length) acc[acc.length - 1] += ch;
    else acc.push(ch);
    return acc;
  }, []);

export const TaglineReveal: React.FC<TaglineRevealProps> = ({ lines }) => {
  const containerRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const words = Array.from(container.querySelectorAll<HTMLElement>('.tagline-word'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      words.forEach((w) => w.classList.add('is-lit'));
      return;
    }

    // Glyphs on one line share a height, so progress through the viewport (not per glyph
    // intersection) decides how many are lit, keeping strict reading order. Lit glyphs stay lit.
    let litCount = 0;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85; // top of the block reaches 85% of the viewport
      const end = vh * 0.35;   // bottom of the block reaches 35% of the viewport
      const progress = (start - rect.top) / (start - end + rect.height);
      const target = Math.max(0, Math.min(words.length, Math.ceil(progress * words.length)));
      for (; litCount < target; litCount++) words[litCount].classList.add('is-lit');
      if (litCount >= words.length) window.removeEventListener('scroll', onScroll);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [lines]);

  return (
    <p ref={containerRef} className="max-w-[680px] text-4xl font-semibold leading-tight tracking-tight sm:text-5xl sm:leading-tight">
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block">
          {splitGlyphs(line).map((glyph, idx) => (
            <span key={idx} className="tagline-word inline-block">{glyph}</span>
          ))}
        </span>
      ))}
    </p>
  );
};
