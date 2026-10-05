import { TextConfig } from '../types';

export type TextResizeHandle = 'w' | 'e' | 'nw' | 'ne' | 'sw' | 'se';
export type TextBoxGeometry = Pick<TextConfig, 'xMm' | 'yMm' | 'widthMm' | 'heightMm' | 'rotation'>;
export const MIN_TEXT_BOX_MM = 4;

// Pointer deltas are in frame space. Resize along the rotated box's local
// axes and keep the opposite corner/edge stationary. Font size is untouched.
export const resizeTextBox = (
  start: TextBoxGeometry,
  handle: TextResizeHandle,
  deltaXmm: number,
  deltaYmm: number,
  maxWidthMm: number,
  maxHeightMm: number,
): Pick<TextConfig, 'xMm' | 'yMm' | 'widthMm' | 'heightMm'> => {
  const radians = start.rotation * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const localX = deltaXmm * cos + deltaYmm * sin;
  const localY = -deltaXmm * sin + deltaYmm * cos;
  const sideX = handle.includes('w') ? -1 : 1;
  const sideY = handle.includes('n') ? -1 : handle.includes('s') ? 1 : 0;
  const widthMm = Math.max(MIN_TEXT_BOX_MM, Math.min(maxWidthMm, start.widthMm + sideX * localX));
  const heightMm = sideY === 0 ? start.heightMm : Math.max(MIN_TEXT_BOX_MM, Math.min(maxHeightMm, start.heightMm + sideY * localY));
  const shiftX = sideX * (widthMm - start.widthMm) / 2;
  const shiftY = sideY * (heightMm - start.heightMm) / 2;
  return {
    widthMm,
    heightMm,
    xMm: start.xMm + shiftX * cos - shiftY * sin,
    yMm: start.yMm + shiftX * sin + shiftY * cos,
  };
};
