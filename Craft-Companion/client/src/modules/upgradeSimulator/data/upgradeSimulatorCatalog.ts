import type { CategoryTab, FacilityMeta } from '../types';

export interface CategoryMeta {
  id: CategoryTab;
  labelEn: string;
  labelEs: string;
  colorClass: string;
  bgBadgeClass: string;
}

export const CATEGORY_TABS: CategoryMeta[] = [
  {
    id: 'all',
    labelEn: 'All',
    labelEs: 'Todas',
    colorClass: 'text-amber-400',
    bgBadgeClass: 'bg-amber-500/15 text-amber-300',
  },
  {
    id: 'earth',
    labelEn: 'Earth',
    labelEs: 'Tierra',
    colorClass: 'text-amber-500',
    bgBadgeClass: 'bg-amber-500/15 text-amber-400',
  },
  {
    id: 'water',
    labelEn: 'Water',
    labelEs: 'Agua',
    colorClass: 'text-cyan-400',
    bgBadgeClass: 'bg-cyan-500/15 text-cyan-300',
  },
  {
    id: 'fire',
    labelEn: 'Fire',
    labelEs: 'Fuego',
    colorClass: 'text-rose-500',
    bgBadgeClass: 'bg-rose-500/15 text-rose-400',
  },
  {
    id: 'special',
    labelEn: 'Special',
    labelEs: 'Especial',
    colorClass: 'text-purple-400',
    bgBadgeClass: 'bg-purple-500/15 text-purple-300',
  },
  {
    id: 'keys',
    labelEn: 'Keys',
    labelEs: 'Llaves',
    colorClass: 'text-yellow-400',
    bgBadgeClass: 'bg-yellow-500/15 text-yellow-300',
  },
  {
    id: 'nests',
    labelEn: 'Nests',
    labelEs: 'Nidos',
    colorClass: 'text-emerald-400',
    bgBadgeClass: 'bg-emerald-500/15 text-emerald-300',
  },
  {
    id: 'wraps',
    labelEn: 'Wraps',
    labelEs: 'Envolturas',
    colorClass: 'text-amber-300',
    bgBadgeClass: 'bg-amber-400/15 text-amber-300',
  },
  {
    id: 'academy',
    labelEn: 'Academy',
    labelEs: 'Academia',
    colorClass: 'text-indigo-400',
    bgBadgeClass: 'bg-indigo-500/15 text-indigo-300',
  },
  {
    id: 'construction',
    labelEn: 'Construction',
    labelEs: 'Construcción',
    colorClass: 'text-orange-400',
    bgBadgeClass: 'bg-orange-500/15 text-orange-300',
  },
];

export const FACILITY_CATALOG: FacilityMeta[] = [
  // EARTH
  { token: 'EARTH_MINE', nameEn: 'Earth Mine', nameEs: 'Mina de Tierra', category: 'earth', maxLevel: 50 },
  { token: 'MUD', nameEn: 'Mud', nameEs: 'Lodo', category: 'earth', maxLevel: 50 },
  { token: 'CLAY', nameEn: 'Clay', nameEs: 'Arcilla', category: 'earth', maxLevel: 40 },
  { token: 'SAND', nameEn: 'Sand', nameEs: 'Arena', category: 'earth', maxLevel: 35 },
  { token: 'COPPER', nameEn: 'Copper', nameEs: 'Cobre', category: 'earth', maxLevel: 30 },
  { token: 'STEEL', nameEn: 'Steel', nameEs: 'Acero', category: 'earth', maxLevel: 20 },
  { token: 'SCREWS', nameEn: 'Screws', nameEs: 'Tornillos', category: 'earth', maxLevel: 15 },

  // WATER
  { token: 'SEAWATER', nameEn: 'Seawater', nameEs: 'Agua de Mar', category: 'water', maxLevel: 30 },
  { token: 'ALGAE', nameEn: 'Algae', nameEs: 'Algas', category: 'water', maxLevel: 20 },
  { token: 'OXYGEN', nameEn: 'Oxygen', nameEs: 'Oxígeno', category: 'water', maxLevel: 20 },
  { token: 'GAS', nameEn: 'Gas', nameEs: 'Gas', category: 'water', maxLevel: 15 },
  { token: 'FUEL', nameEn: 'Fuel', nameEs: 'Combustible', category: 'water', maxLevel: 15 },
  { token: 'OIL', nameEn: 'Oil', nameEs: 'Petróleo', category: 'water', maxLevel: 10 },

  // FIRE
  { token: 'HEAT', nameEn: 'Heat', nameEs: 'Calor', category: 'fire', maxLevel: 30 },
  { token: 'LAVA', nameEn: 'Lava', nameEs: 'Lava', category: 'fire', maxLevel: 20 },
  { token: 'GLASS', nameEn: 'Glass', nameEs: 'Vidrio', category: 'fire', maxLevel: 20 },
  { token: 'SULFUR', nameEn: 'Sulfur', nameEs: 'Azufre', category: 'fire', maxLevel: 10 },
  { token: 'FIBERGLASS', nameEn: 'Fiberglass', nameEs: 'Fibra de Vidrio', category: 'fire', maxLevel: 10 },

  // SPECIAL
  { token: 'CERAMICS', nameEn: 'Ceramics', nameEs: 'Cerámica', category: 'special', maxLevel: 20 },
  { token: 'STONE', nameEn: 'Stone', nameEs: 'Piedra', category: 'special', maxLevel: 15 },
  { token: 'STEAM', nameEn: 'Steam', nameEs: 'Vapor', category: 'special', maxLevel: 15 },
  { token: 'CEMENT', nameEn: 'Cement', nameEs: 'Cemento', category: 'special', maxLevel: 15 },
  { token: 'ACID', nameEn: 'Acid', nameEs: 'Ácido', category: 'special', maxLevel: 10 },
  { token: 'PLASTICS', nameEn: 'Plastics', nameEs: 'Plásticos', category: 'special', maxLevel: 10 },
  { token: 'ENERGY', nameEn: 'Energy', nameEs: 'Energía', category: 'special', maxLevel: 10 },
  { token: 'HYDROGEN', nameEn: 'Hydrogen', nameEs: 'Hidrógeno', category: 'special', maxLevel: 5 },
  { token: 'DYNAMITE', nameEn: 'Dynamite', nameEs: 'Dinamita', category: 'special', maxLevel: 5 },

  // KEYS
  { token: 'BOLTS', nameEn: 'Bolts', nameEs: 'Pernos', category: 'keys', maxLevel: 10 },
  { token: 'KEY', nameEn: 'Key', nameEs: 'Llave', category: 'keys', maxLevel: 10 },
  { token: 'CERAMICKEY', nameEn: 'Ceramic Key', nameEs: 'Llave Cerámica', category: 'keys', maxLevel: 5 },
  { token: 'GLASSKEY', nameEn: 'Glass Key', nameEs: 'Llave de Vidrio', category: 'keys', maxLevel: 5 },
  { token: 'DYNOKEY', nameEn: 'Dyno Key', nameEs: 'Llave Dyno', category: 'keys', maxLevel: 5 },

  // NESTS
  { token: 'WIRE', nameEn: 'Wire', nameEs: 'Cable', category: 'nests', maxLevel: 30 },
  { token: 'NEST', nameEn: 'Nest', nameEs: 'Nido', category: 'nests', maxLevel: 25 },
  { token: 'WETNEST', nameEn: 'Wet Nest', nameEs: 'Nido Húmedo', category: 'nests', maxLevel: 15 },
  { token: 'WARMNEST', nameEn: 'Warm Nest', nameEs: 'Nido Cálido', category: 'nests', maxLevel: 15 },
  { token: 'DYNONEST', nameEn: 'Dyno Nest', nameEs: 'Nido Dyno', category: 'nests', maxLevel: 10 },

  // WRAPS
  { token: 'PAPERWRAP', nameEn: 'Paper Wrap', nameEs: 'Envoltura de Papel', category: 'wraps', maxLevel: 35 },
  { token: 'SANDWRAP', nameEn: 'Sand Wrap', nameEs: 'Envoltura de Arena', category: 'wraps', maxLevel: 30 },
  { token: 'STEAMWRAP', nameEn: 'Steam Wrap', nameEs: 'Envoltura de Vapor', category: 'wraps', maxLevel: 10 },

  // ACADEMY
  { token: 'SALT', nameEn: 'Salt', nameEs: 'Sal', category: 'academy', maxLevel: 20 },
  { token: 'BOOK', nameEn: 'Book', nameEs: 'Libro', category: 'academy', maxLevel: 30 },
  { token: 'ARTICLE', nameEn: 'Article', nameEs: 'Artículo', category: 'academy', maxLevel: 10 },
  { token: 'DIPLOMA', nameEn: 'Diploma', nameEs: 'Diploma', category: 'academy', maxLevel: 10 },

  // CONSTRUCTION
  { token: 'BEAM', nameEn: 'Beam', nameEs: 'Viga', category: 'construction', maxLevel: 35 },
  { token: 'BRICK', nameEn: 'Brick', nameEs: 'Ladrillo', category: 'construction', maxLevel: 30 },
  { token: 'TILE', nameEn: 'Tile', nameEs: 'Baldosa', category: 'construction', maxLevel: 25 },
  { token: 'NAIL', nameEn: 'Nail', nameEs: 'Clavo', category: 'construction', maxLevel: 20 },
  { token: 'PAINT', nameEn: 'Paint', nameEs: 'Pintura', category: 'construction', maxLevel: 15 },
];
