// mypreset.ts
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const EmeraldGreenPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#f0fdf4', // ultra-light green - soft hover backgrounds
      100: '#dcfce7', // subtle highlight backgrounds
      200: '#bbf7d0', // light borders and dividers
      300: '#86efac', // disabled states, soft secondary elements
      400: '#4ade80', // hover states on buttons
      500: '#22c55e', // <-- MAIN brand color - clean, modern emerald green
      600: '#16a34a', // active/pressed states
      700: '#15803d', // strong accents / dark mode primary
      800: '#166534', // text on light backgrounds
      900: '#14532d', // headings, emphasis
      950: '#052e16', // deep contrast for borders/shadows
    },
  },
});

export default EmeraldGreenPreset;
