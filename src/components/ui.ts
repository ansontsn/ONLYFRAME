// Shared class strings for the design flow, so buttons and surfaces stay identical across views.

export const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

const buttonBase =
  'group inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 font-semibold transition duration-300 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40';

export const btnPrimary = `${buttonBase} bg-ink text-base text-white hover:bg-black ${focusRing}`;
export const btnSecondary = `${buttonBase} border border-black/10 bg-white text-base text-ink hover:border-black/20 hover:bg-paper ${focusRing}`;
export const btnPrimarySm = `${buttonBase} bg-ink text-sm text-white hover:bg-black ${focusRing}`;
export const btnSecondarySm = `${buttonBase} border border-black/10 bg-white text-sm text-ink hover:border-black/20 hover:bg-paper ${focusRing}`;
export const btnGhostSm = `${buttonBase} text-sm text-black/55 hover:bg-black/5 hover:text-ink ${focusRing}`;

export const arrowNudge = 'h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5';

export const card = 'rounded-3xl border border-black/5 bg-white';
export const eyebrow = 'text-xs font-semibold uppercase tracking-widest text-brand';

// Selectable option tile (frame color, background, font, size): resting, hover, selected.
export const optionTile = (selected: boolean) =>
  `rounded-xl border text-left transition duration-300 ease-out active:scale-[0.98] ${focusRing} ${
    selected ? 'border-ink bg-white ring-1 ring-ink' : 'border-black/10 bg-white hover:border-black/25'
  }`;
