// Maps PHASES_V4 day.id values (e.g. 'p1-d1') to the three-persona
// Markdown bootcamp notes authored in day1.ts..day7.ts.
//
// Extend this object as Week 2+ notes are authored — RoadmapV4View
// only renders the "Bootcamp Notes" panel for day IDs present here,
// so adding a new week is a one-line addition, no component changes.

import { day1 } from './day1';
import { day2 } from './day2';
import { day3 } from './day3';
import { day4 } from './day4';
import { day5 } from './day5';
import { day6 } from './day6';
import { day7 } from './day7';

export const BOOTCAMP_NOTES_V5: Record<string, string> = {
  'p1-d1': day1,
  'p1-d2': day2,
  'p1-d3': day3,
  'p1-d4': day4,
  'p1-d5': day5,
  'p1-d6': day6,
  'p1-d7': day7,
};
