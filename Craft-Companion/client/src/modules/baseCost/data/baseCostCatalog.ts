import { FACTORIES_BASE_COST_DATA } from './factoriesBaseCostData';
import { MASTERY_INPUT_FACTORS } from '../../../services/gameConfig/generated/staticFallbacks';
import type {
  BaseCostCategory,
  CategoryKey,
  FactoryLevelConfig,
  ResourceMetaItem,
} from '../types';

export const FACTORIES_DATA: Record<string, FactoryLevelConfig[]> =
  FACTORIES_BASE_COST_DATA;

// Derivado de la tabla oficial de maestría (proficiencyConfiguration.
// inputDiscountFactor). La maestría multiplica los insumos por el factor;
// estos multipliers son su inversa (1/factor) para las operaciones legacy que
// dividen. Fuente única: services/gameConfig/generated/staticFallbacks.ts.
export const MASTERY_MULTIPLIERS: readonly number[] = MASTERY_INPUT_FACTORS.map(
  (factor) => 1 / factor,
);

export const TOKEN_CONTRACTS: Record<string, string> = {
  EARTH: '0xc356cd52364541379ad4d31a889b7031e758220a',
  WATER: '0xf14ad4a21a9e71ba967b8b99e278d03a1933b44a',
  FIRE: '0xe973dc221bb031010ec673105ed8b04c9e713b9d',
  MUD: '0xb287ea5a5cd4f2b74571e30fdec96241aa5163d9',
  CLAY: '0x8b1a1b7b43a53904b0a05406c13399079e553501',
  SAND: '0x6d8839a585f7877a5e218a217c07334980f04a4a',
  COPPER: '0xa09dda31b854720b6d2f28dee9c87b05d0b80d14',
  SEAWATER: '0xd1d6bb059c97295f7437ad423111047cbcddf4c6',
  ALGAE: '0xe63f8cefea9a17a259bb3b375929bd10d5e1cdfa',
  CERAMICS: '0xfa3a564b27deb29781f80032df662a4406eebef6',
  OXYGEN: '0x4343846ebe54dcd40ba572275640230d533296e5',
  STONE: '0xda4145a4975b1219e85a233673187309c4840044',
  HEAT: '0x6ccd01c951e57d82be8dccb90c01a58bfb4d83cd',
  LAVA: '0x54ae64826ca9d440ede8c33e6cf4cfa1a3aa5801',
  GAS: '0x4782e36bbe6e9abca5357d3e43a090fa772de71b',
  CEMENT: '0x491a412400840651c243acfc1ed9947ffe8a4e8f',
  GLASS: '0x7aa1cc00ca62982ab10d12fd4f6b6687f33011ad',
  STEAM: '0x7bf03c63adfded079adbd9f807ccce0fd28b8fd8',
  STEEL: '0x70c063f17dacb35e4b3df06c8f36020416a44a3c',
  FUEL: '0x0f8f4dcf1b6eb9f5c0e8fbb9cd6879aa3983c8bc',
  ACID: '0xefc128c4cb990a5ecc88ff71e9efcc0eaef434d2',
  SULFUR: '0x346e30b7ca273fb001eec84fabf2b693617df710',
  ENERGY: '0xb0a3c31aae83526fd6ee75aac552822d676f46b2',
  SCREWS: '0x0016c4c602cc1a96a9d35fe133a7e374d3cdc26d',
  OIL: '0x6f363e6760876a4c66730fbbefccdd3014b6220c',
  PLASTICS: '0x0ab775634107063a7c16c6c8e0fd6bda1f219ae6',
  FIBERGLASS: '0x0ffb7bd0bc009a01f9f9e95a0f563bad2189f151',
  HYDROGEN: '0xbb155716cd99d7ef8fd3fb45c91d39958c95b088',
  DYNAMITE: '0x85172e7ff5040366fa5a3caf7b1bd969bb06b570',
  BOLTS: '0x708804f7f9e3960e282fc1835ff55439319c1925',
  KEY: '0x9b3b09e4e3339eb429292c0054f0ab97aed5bcc1',
  CERAMICKEY: '0x884a266b3c1e70cc32ed2af6483070e81b20830c',
  GLASSKEY: '0x7ac99f731a96ada40371fa2a4ec1527d0b6a48fb',
  DYNOKEY: '0xb67521d41a2c499ceb1288e70563ca34618da866',
  DUST: '0x324b4bc0b0670c713e865b179ef4b9757c89cd85',
  WIRE: '0xD0FDB28cbBAC1808c3bda4c8DEB93eB1A8357d0F',
  NEST: '0xc2135a1B453e7F744b1725961cD97B5a597696AA',
  WETNEST: '0x98d00d1d04743b210CB2D292Cc1a8083310d6996',
  WARMNEST: '0xEc5d2007b60a849D092379075e767a1e38Bf54C8',
  DYNONEST: '0x99e8af05763EF60b6DE106Ea82dB0c899944E5E4',
  PAPERWRAP: '0x62b567745246f46c782d709fcc7cfe762b4015c0',
  SANDWRAP: '0x03C1943873DF365c01aA900CCDcEFa61Ed4101F9',
  STEAMWRAP: '0xB1Bd592C787Dcd64DE096a886Bdd1e97213418cD',
  SALT: '0x98B539ff43aa3DD2A9284f6D9bC5A0a586BA4dA0',
  BOOK: '0xff6724bc90d89cac818955b5c311069ede8ca3be',
  ARTICLE: '0x2e75c0bf22eba42ed6ee83ba208078bc5c0daf8d',
  DIPLOMA: '0x0450DbF6f748709d7C01f4Dc556643e1220c9227',
  LUMBER: '0x615dbabd91f0eb79b59c720f5ec2b3fe0ae61055',
  BEAM: '0x12f2ffae365bb0ec481bb6bb4cda9ef60ec32921',
  BRICK: '0x8f32b16fc2574a7c35251772ddd287709a1fa919',
  TILE: '0xea6750832ea32eb79caaac746c12abf3e812388e',
  NAIL: '0x88f31ca9087aaa60a217637e6ddeced29370094f',
  PAINT: '0xc4be5660ea4ad6ceb30eeef56d327b4ff22f5822',
  COIN: '0x8d896c96ffcafbf12d86dd4510236de7bcfa7dcf',
};

export const RESOURCE_METADATA: Record<string, ResourceMetaItem> = {
  EARTH: { name: 'Earth', element: 'earth', tier: 0, icon: '/assets/resources/Earth.png' },
  WATER: { name: 'Water', element: 'water', tier: 0, icon: '/assets/resources/Water.png' },
  FIRE: { name: 'Fire', element: 'fire', tier: 0, icon: '/assets/resources/Fire.png' },
  DUST: { name: 'Dust', element: 'special', tier: 0, icon: '/assets/resources/Dust.png' },
  LUMBER: { name: 'Lumber', element: 'special', tier: 0, icon: '/assets/resources/Lumber.png' },
  MUD: { name: 'Mud', element: 'earth', tier: 1, icon: '/assets/resources/Mud.png' },
  CLAY: { name: 'Clay', element: 'earth', tier: 2, icon: '/assets/resources/Clay.png' },
  SAND: { name: 'Sand', element: 'earth', tier: 3, icon: '/assets/resources/Sand.png' },
  COPPER: { name: 'Copper', element: 'earth', tier: 4, icon: '/assets/resources/Copper.png' },
  STEEL: { name: 'Steel', element: 'earth', tier: 5, icon: '/assets/resources/Steel.png' },
  SCREWS: { name: 'Screws', element: 'earth', tier: 6, icon: '/assets/resources/Screws.png' },
  SEAWATER: { name: 'Seawater', element: 'water', tier: 2, icon: '/assets/resources/Seawater.png' },
  ALGAE: { name: 'Algae', element: 'water', tier: 3, icon: '/assets/resources/Algae.png' },
  OXYGEN: { name: 'Oxygen', element: 'water', tier: 4, icon: '/assets/resources/Oxygen.png' },
  GAS: { name: 'Gas', element: 'water', tier: 5, icon: '/assets/resources/Gas.png' },
  FUEL: { name: 'Fuel', element: 'water', tier: 6, icon: '/assets/resources/Fuel.png' },
  OIL: { name: 'Oil', element: 'water', tier: 7, icon: '/assets/resources/Oil.png' },
  HEAT: { name: 'Heat', element: 'fire', tier: 1, icon: '/assets/resources/Heat.png' },
  LAVA: { name: 'Lava', element: 'fire', tier: 2, icon: '/assets/resources/Lava.png' },
  GLASS: { name: 'Glass', element: 'fire', tier: 3, icon: '/assets/resources/Glass.png' },
  SULFUR: { name: 'Sulfur', element: 'fire', tier: 5, icon: '/assets/resources/Sulfur.png' },
  FIBERGLASS: { name: 'Fiberglass', element: 'fire', tier: 6, icon: '/assets/resources/Fiberglass.png' },
  CERAMICS: { name: 'Ceramics', element: 'special', tier: 4, icon: '/assets/resources/Ceramics.png' },
  STONE: { name: 'Stone', element: 'special', tier: 4, icon: '/assets/resources/Stone.png' },
  STEAM: { name: 'Steam', element: 'special', tier: 5, icon: '/assets/resources/Steam.png' },
  CEMENT: { name: 'Cement', element: 'special', tier: 6, icon: '/assets/resources/Cement.png' },
  ACID: { name: 'Acid', element: 'special', tier: 7, icon: '/assets/resources/Acid.png' },
  PLASTICS: { name: 'Plastics', element: 'special', tier: 8, icon: '/assets/resources/Plastics.png' },
  ENERGY: { name: 'Energy', element: 'special', tier: 9, icon: '/assets/resources/Energy.png' },
  HYDROGEN: { name: 'Hydrogen', element: 'special', tier: 10, icon: '/assets/resources/Hydrogen.png' },
  DYNAMITE: { name: 'Dynamite', element: 'special', tier: 11, icon: '/assets/resources/Dynamite.png' },
  BOLTS: { name: 'Bolts', element: 'special', tier: 12, icon: '/assets/resources/Bolts.png' },
  KEY: { name: 'Key', element: 'special', tier: 13, icon: '/assets/resources/Key.png' },
  CERAMICKEY: { name: 'Ceramic Key', element: 'special', tier: 14, icon: '/assets/resources/Ceramickey.png' },
  GLASSKEY: { name: 'Glass Key', element: 'special', tier: 15, icon: '/assets/resources/Glasskey.png' },
  DYNOKEY: { name: 'Dyno Key', element: 'special', tier: 16, icon: '/assets/resources/Dynokey.png' },
  WIRE: { name: 'Wire', element: 'special', tier: 5, icon: '/assets/resources/Wire.png' },
  NEST: { name: 'Nest', element: 'special', tier: 6, icon: '/assets/resources/Nest.png' },
  WETNEST: { name: 'Wet Nest', element: 'special', tier: 7, icon: '/assets/resources/Wetnest.png' },
  WARMNEST: { name: 'Warm Nest', element: 'special', tier: 7, icon: '/assets/resources/Warmnest.png' },
  DYNONEST: { name: 'Dyno Nest', element: 'special', tier: 8, icon: '/assets/resources/Dynonest.png' },
  PAPERWRAP: { name: 'Paper Wrap', element: 'special', tier: 1, icon: '/assets/resources/Paperwrap.png' },
  SANDWRAP: { name: 'Sand Wrap', element: 'special', tier: 4, icon: '/assets/resources/Sandwrap.png' },
  STEAMWRAP: { name: 'Steam Wrap', element: 'special', tier: 6, icon: '/assets/resources/Steamwrap.png' },
  SALT: { name: 'Salt', element: 'special', tier: 3, icon: '/assets/resources/Salt.png' },
  BOOK: { name: 'Book', element: 'special', tier: 5, icon: '/assets/resources/Book.png' },
  ARTICLE: { name: 'Article', element: 'special', tier: 6, icon: '/assets/resources/Article.png' },
  DIPLOMA: { name: 'Diploma', element: 'special', tier: 7, icon: '/assets/resources/Diploma.png' },
  BEAM: { name: 'Beam', element: 'special', tier: 1, icon: '/assets/resources/Beam.png' },
  BRICK: { name: 'Brick', element: 'special', tier: 3, icon: '/assets/resources/Brick.png' },
  TILE: { name: 'Tile', element: 'special', tier: 4, icon: '/assets/resources/Tile.png' },
  NAIL: { name: 'Nail', element: 'special', tier: 6, icon: '/assets/resources/Nail.png' },
  PAINT: { name: 'Paint', element: 'special', tier: 7, icon: '/assets/resources/Paint.png' },
  COIN: { name: 'COIN', element: 'special', tier: 99, icon: '/assets/resources/Coin.png' },
};

export const BASE_COST_CATEGORIES: BaseCostCategory[] = [
  {
    id: 'earth',
    labelEn: 'Earth',
    labelEs: 'Tierra',
    color: '#A16207',
    textColor: 'text-amber-500',
    bgBadge: 'bg-amber-950/30',
    borderColor: 'border-amber-700/30',
    resources: ['MUD', 'CLAY', 'SAND', 'COPPER', 'STEEL', 'SCREWS'],
  },
  {
    id: 'water',
    labelEn: 'Water',
    labelEs: 'Agua',
    color: '#1D4ED8',
    textColor: 'text-blue-400',
    bgBadge: 'bg-blue-950/30',
    borderColor: 'border-blue-700/30',
    resources: ['SEAWATER', 'ALGAE', 'OXYGEN', 'GAS', 'FUEL', 'OIL'],
  },
  {
    id: 'fire',
    labelEn: 'Fire',
    labelEs: 'Fuego',
    color: '#B91C1C',
    textColor: 'text-rose-400',
    bgBadge: 'bg-rose-950/30',
    borderColor: 'border-rose-700/30',
    resources: ['HEAT', 'LAVA', 'GLASS', 'SULFUR', 'FIBERGLASS'],
  },
  {
    id: 'special',
    labelEn: 'Special',
    labelEs: 'Especial',
    color: '#7C3AED',
    textColor: 'text-purple-400',
    bgBadge: 'bg-purple-950/30',
    borderColor: 'border-purple-700/30',
    resources: [
      'CERAMICS',
      'STONE',
      'STEAM',
      'CEMENT',
      'ACID',
      'PLASTICS',
      'ENERGY',
      'HYDROGEN',
      'DYNAMITE',
    ],
  },
  {
    id: 'keys',
    labelEn: 'Keys',
    labelEs: 'Llaves',
    color: '#0891B2',
    textColor: 'text-cyan-400',
    bgBadge: 'bg-cyan-950/30',
    borderColor: 'border-cyan-700/30',
    resources: ['BOLTS', 'KEY', 'CERAMICKEY', 'GLASSKEY', 'DYNOKEY'],
  },
  {
    id: 'nests',
    labelEn: 'Nests',
    labelEs: 'Nidos',
    color: '#16A34A',
    textColor: 'text-emerald-400',
    bgBadge: 'bg-emerald-950/30',
    borderColor: 'border-emerald-700/30',
    resources: ['WIRE', 'NEST', 'WETNEST', 'WARMNEST', 'DYNONEST'],
  },
  {
    id: 'wraps',
    labelEn: 'Wraps',
    labelEs: 'Envolturas',
    color: '#84CC16',
    textColor: 'text-lime-400',
    bgBadge: 'bg-lime-950/30',
    borderColor: 'border-lime-700/30',
    resources: ['PAPERWRAP', 'SANDWRAP', 'STEAMWRAP'],
  },
  {
    id: 'academy',
    labelEn: 'Academy',
    labelEs: 'Academia',
    color: '#818CF8',
    textColor: 'text-indigo-400',
    bgBadge: 'bg-indigo-950/30',
    borderColor: 'border-indigo-700/30',
    resources: ['SALT', 'BOOK', 'ARTICLE', 'DIPLOMA'],
  },
  {
    id: 'construction',
    labelEn: 'Construction',
    labelEs: 'Construcción',
    color: '#EA580C',
    textColor: 'text-orange-400',
    bgBadge: 'bg-orange-950/30',
    borderColor: 'border-orange-700/30',
    resources: ['BEAM', 'BRICK', 'TILE', 'NAIL', 'PAINT'],
  },
];

export const ALL_BASE_COST_TOKENS: string[] = BASE_COST_CATEGORIES.flatMap(
  (c) => c.resources,
);

export function getDefinedPoolUrl(token: string): string | null {
  const address = TOKEN_CONTRACTS[token.toUpperCase()];
  if (!address || token.toUpperCase() === 'COIN') return null;
  return `https://www.defined.fi/ronin/${address}`;
}

export function getMaxFactoryLevel(token: string): number {
  const list = FACTORIES_DATA[token.toUpperCase()];
  if (!list || !list.length) return 1;
  return list[list.length - 1].level;
}

export function clampFactoryLevel(token: string, level: number): number {
  const list = FACTORIES_DATA[token.toUpperCase()];
  if (!list || !list.length) return 1;
  const minLvl = list[0].level;
  const maxLvl = list[list.length - 1].level;
  return Math.min(maxLvl, Math.max(minLvl, level));
}
