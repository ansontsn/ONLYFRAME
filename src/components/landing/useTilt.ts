import { useEffect, useRef } from 'react';

// Tilts an element toward the pointer (fine pointers only, off for reduced motion).
// Writes the transform straight to the node inside rAF, so moving the mouse never re-renders React.
export const useTilt = <T extends HTMLElement>(maxDeg = 8) => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let next = '';
    const apply = () => { frame = 0; node.style.transform = next; };
    const onMove = (e: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      next = `perspective(900px) rotateX(${(-y * maxDeg).toFixed(2)}deg) rotateY(${(x * maxDeg).toFixed(2)}deg)`;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => { next = ''; if (!frame) frame = requestAnimationFrame(apply); };

    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', onLeave);
    return () => {
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [maxDeg]);

  return ref;
};
