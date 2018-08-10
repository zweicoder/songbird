import Preset from './customizers/Preset.js';

// THESE SHOULD BE THE SAME AS THE BACKEND
export const KEY_SELECT_TYPE_GENRE = 'genres';
export const KEY_SELECT_TYPE_PRESET = 'preset';

export const CUSTOMIZER_SELECT_OPTIONS = [
  {
    value: KEY_SELECT_TYPE_PRESET,
    label: 'Preset',
  },
  {
    value: KEY_SELECT_TYPE_GENRE,
    label: 'Genre',
  },
];


export const CUSTOMIZER_COMPONENT_MAP ={
  [KEY_SELECT_TYPE_PRESET]: Preset,
};
