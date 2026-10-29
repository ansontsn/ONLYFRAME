import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  as?: 'div' | 'section' | 'article';
  className?: string;
  id?: string;
  children: React.ReactNode;
}

// Rises 32px and fades in the first time it enters the viewport; never replays.
export const Reveal: React.FC<RevealProps> = ({ as = 'div', className = '', id, children }) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref} id={id} className={`reveal ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </Tag>
  );
};
