import Preset from './customizers/Preset.js';
import Genre from './customizers/Genre.js';
import AgeRange from './customizers/AgeRange.js';
import YearRange from './customizers/YearRange.js';

// THESE SHOULD BE THE SAME AS THE BACKEND
export const KEY_SELECT_TYPE_GENRE = 'genres';
export const KEY_SELECT_TYPE_PRESET = 'preset';
export const KEY_SELECT_TYPE_AGE_RANGE = 'ageRanges';
export const KEY_SELECT_TYPE_YEAR_RANGE = 'yearRanges';

export const CUSTOMIZER_SELECT_OPTIONS = [
  {
    value: KEY_SELECT_TYPE_PRESET,
    label: 'Preset',
  },
  {
    value: KEY_SELECT_TYPE_GENRE,
    label: 'Genre',
  },
  {
    value: KEY_SELECT_TYPE_AGE_RANGE,
    label: 'Days Added to Library',
  },
  {
    value: KEY_SELECT_TYPE_YEAR_RANGE,
    label: 'Year Of Release',
  },
];

export const CUSTOMIZER_COMPONENT_MAP = {
  [KEY_SELECT_TYPE_PRESET]: Preset,
  [KEY_SELECT_TYPE_GENRE]: Genre,
  [KEY_SELECT_TYPE_AGE_RANGE]: AgeRange,
  [KEY_SELECT_TYPE_YEAR_RANGE]: YearRange,
};
