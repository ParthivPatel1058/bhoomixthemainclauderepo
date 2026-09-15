/**
 * Photo credits for catalogue imagery that legally requires attribution.
 *
 * Generated from `src/assets/agri/attributions.json`, which records the
 * licence of every catalogue photograph sourced from Wikimedia Commons.
 * Only CC BY and CC BY-SA files appear here — CC0 and public-domain images
 * carry no obligation, and listing them all would bury the ones that matter.
 *
 * A TypeScript module rather than a JSON import: Vite does not serve JSON
 * under `src/assets/` as a module.
 */

export interface PhotoCredit {
  /** Catalogue asset the photo is used for. */
  asset: string;
  /** Original file name on Wikimedia Commons. */
  file: string;
  licence: string;
  author: string;
  source: string;
}

export const PHOTO_CREDITS: PhotoCredit[] = [
  {
    asset: "azospirillum",
    file: "File:Nitrogen-fixing nodules in the roots of legumes..JPG",
    licence: "CC BY-SA 3.0",
    author: "Terraprima",
    source: "https://commons.wikimedia.org/wiki/File:Nitrogen-fixing_nodules_in_the_roots_of_legumes..JPG",
  },
  {
    asset: "press-mud",
    file: "File:Compost heap Heyrons High Easter Essex 01.jpg",
    licence: "CC BY-SA 4.0",
    author: "Acabashi",
    source: "https://commons.wikimedia.org/wiki/File:Compost_heap_Heyrons_High_Easter_Essex_01.jpg",
  },
  {
    asset: "psb",
    file: "File:Microscope view of a branched Bacillus bacterial colony 08.jpg",
    licence: "CC BY 4.0",
    author: "Korinna",
    source: "https://commons.wikimedia.org/wiki/File:Microscope_view_of_a_branched_Bacillus_bacterial_colony_08.jpg",
  },
  {
    asset: "seed-groundnut",
    file: "File:Bullock ploughing sowing groundnut blackeyed peas Raichur Karnataka India.jp.jpg",
    licence: "CC BY-SA 4.0",
    author: "Nanditha Gogate, WELL Labs",
    source: "https://commons.wikimedia.org/wiki/File:Bullock_ploughing_sowing_groundnut_blackeyed_peas_Raichur_Karnataka_India.jp.jpg",
  },
  {
    asset: "seed-ragi",
    file: "File:Finger Millet Seed.jpg",
    licence: "CC BY 4.0",
    author: "Gaurav Dhwaj Khadka",
    source: "https://commons.wikimedia.org/wiki/File:Finger_Millet_Seed.jpg",
  },
  {
    asset: "seed-sesame",
    file: "File:Sesamum indicum-- The Sesame Flower (26779961292).jpg",
    licence: "CC BY 2.0",
    author: "Dick Culbert from Gibsons, B.C., Canada",
    source: "https://commons.wikimedia.org/wiki/File:Sesamum_indicum--_The_Sesame_Flower_(26779961292).jpg",
  },
  {
    asset: "seed-soybean",
    file: "File:Soybean Seed in Soil (9624714110).jpg",
    licence: "CC BY 2.0",
    author: "United Soybean Board",
    source: "https://commons.wikimedia.org/wiki/File:Soybean_Seed_in_Soil_(9624714110).jpg",
  },
  {
    asset: "tsp",
    file: "File:Tripelsuperfosfaat (triple phosphate).jpg",
    licence: "CC BY-SA 3.0",
    author: "Rasbak",
    source: "https://commons.wikimedia.org/wiki/File:Tripelsuperfosfaat_(triple_phosphate).jpg",
  },
];
