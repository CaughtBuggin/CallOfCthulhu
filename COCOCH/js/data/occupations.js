// Call of Cthulhu 7th edition occupations with recommended skills and
// credit rating ranges. Used by the quick generator.

export const OCCUPATIONS = [
  {
    name: 'Antiquarian',
    skills: ['appraise', 'art_craft', 'history', 'library_use', 'occult', 'language_other', 'spot_hidden', 'persuade'],
    credit: [30, 70],
  },
  {
    name: 'Author',
    skills: ['art_craft', 'history', 'library_use', 'psychology', 'language_own', 'language_other', 'occult', 'persuade'],
    credit: [9, 30],
  },
  {
    name: 'Criminal',
    skills: ['disguise', 'fast_talk', 'locksmith', 'sleight_of_hand', 'stealth', 'spot_hidden', 'intimidate', 'fighting_brawl'],
    credit: [5, 65],
  },
  {
    name: 'Detective',
    skills: ['spot_hidden', 'psychology', 'law', 'library_use', 'fast_talk', 'stealth', 'firearms_handgun', 'intimidate'],
    credit: [20, 45],
  },
  {
    name: 'Doctor of Medicine',
    skills: ['first_aid', 'medicine', 'psychology', 'science', 'spot_hidden', 'persuade', 'library_use', 'language_other'],
    credit: [30, 80],
  },
  {
    name: 'Journalist',
    skills: ['library_use', 'spot_hidden', 'psychology', 'fast_talk', 'persuade', 'history', 'language_own', 'art_craft'],
    credit: [9, 30],
  },
  {
    name: 'Librarian',
    skills: ['library_use', 'accounting', 'history', 'language_own', 'language_other', 'spot_hidden', 'appraise', 'psychology'],
    credit: [9, 35],
  },
  {
    name: 'Occultist',
    skills: ['occult', 'history', 'library_use', 'language_other', 'anthropology', 'psychology', 'cthulhu_mythos', 'persuade'],
    credit: [9, 65],
  },
  {
    name: 'Police Detective',
    skills: ['firearms_handgun', 'spot_hidden', 'psychology', 'law', 'intimidate', 'fast_talk', 'fighting_brawl', 'drive_auto'],
    credit: [20, 50],
  },
  {
    name: 'Private Investigator',
    skills: ['spot_hidden', 'psychology', 'law', 'firearms_handgun', 'stealth', 'sleight_of_hand', 'fast_talk', 'locksmith'],
    credit: [9, 30],
  },
  {
    name: 'Professor',
    skills: ['library_use', 'history', 'anthropology', 'archaeology', 'science', 'language_other', 'language_own', 'psychology'],
    credit: [20, 70],
  },
  {
    name: 'Soldier',
    skills: ['fighting_brawl', 'firearms_handgun', 'firearms_rifle', 'first_aid', 'throw', 'stealth', 'survival', 'climb'],
    credit: [9, 30],
  },
  {
    name: 'Archaeologist',
    skills: ['archaeology', 'anthropology', 'history', 'library_use', 'navigate', 'language_other', 'spot_hidden', 'appraise'],
    credit: [10, 40],
  },
  {
    name: 'Engineer',
    skills: ['mechanical_repair', 'electric_repair', 'science', 'operate_heavy_machinery', 'library_use', 'navigate', 'spot_hidden', 'persuade'],
    credit: [30, 60],
  },
  {
    name: 'Dilettante',
    skills: ['charm', 'credit_rating', 'fast_talk', 'language_other', 'ride', 'art_craft', 'persuade', 'psychology'],
    credit: [50, 99],
  },
  {
    name: 'Gangster',
    skills: ['fighting_brawl', 'firearms_handgun', 'intimidate', 'fast_talk', 'drive_auto', 'stealth', 'spot_hidden', 'locksmith'],
    credit: [5, 60],
  },
  {
    name: 'Nurse',
    skills: ['first_aid', 'medicine', 'psychology', 'science', 'persuade', 'listen', 'spot_hidden', 'library_use'],
    credit: [9, 20],
  },
  {
    name: 'Scientist',
    skills: ['science', 'library_use', 'medicine', 'natural_world', 'spot_hidden', 'persuade', 'psychology', 'language_other'],
    credit: [9, 50],
  },
  {
    name: 'Artist',
    skills: ['art_craft', 'persuade', 'psychology', 'spot_hidden', 'history', 'fast_talk', 'appraise', 'library_use'],
    credit: [9, 50],
  },
  {
    name: 'Musician',
    skills: ['art_craft', 'persuade', 'psychology', 'charm', 'listen', 'fast_talk', 'spot_hidden', 'history'],
    credit: [9, 30],
  },
  {
    name: 'Parapsychologist',
    skills: ['psychology', 'psychoanalysis', 'science', 'occult', 'library_use', 'persuade', 'listen', 'anthropology'],
    credit: [9, 40],
  },
  {
    name: 'Clergy',
    skills: ['persuade', 'psychology', 'listen', 'library_use', 'history', 'occult', 'language_other', 'charm'],
    credit: [9, 30],
  },
  {
    name: 'Farmer',
    skills: ['natural_world', 'survival', 'operate_heavy_machinery', 'mechanical_repair', 'track', 'throw', 'ride', 'climb'],
    credit: [9, 20],
  },
  {
    name: 'Sailor',
    skills: ['navigate', 'climb', 'swim', 'pilot', 'mechanical_repair', 'natural_world', 'spot_hidden', 'first_aid'],
    credit: [9, 30],
  },
  {
    name: 'Pilot',
    skills: ['pilot', 'navigate', 'mechanical_repair', 'electric_repair', 'spot_hidden', 'survival', 'science', 'listen'],
    credit: [20, 70],
  },
];
