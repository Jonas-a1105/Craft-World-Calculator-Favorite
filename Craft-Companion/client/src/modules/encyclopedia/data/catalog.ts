import { CatalogItem } from '../types';

export const RESOURCE_ITEMS: CatalogItem[] = [
  // Primarios / Minería
  { id: 'EARTH', name: 'Earth Mine', nameEs: 'Mina de Tierra', category: 'resources', badge: 'MINE', badgeEs: 'MINA', iconSymbol: 'Earth' },
  { id: 'WATER', name: 'Water', nameEs: 'Agua', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Water' },
  { id: 'FIRE', name: 'Fire', nameEs: 'Fuego', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Fire' },
  { id: 'SEAWATER', name: 'Seawater', nameEs: 'Agua de Mar', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Seawater' },
  { id: 'HEAT', name: 'Heat', nameEs: 'Calor', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Heat' },
  { id: 'STEAM', name: 'Steam', nameEs: 'Vapor', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Steam' },
  { id: 'LAVA', name: 'Lava', nameEs: 'Lava', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Lava' },
  { id: 'OIL', name: 'Oil', nameEs: 'Petróleo', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Oil' },
  { id: 'GAS', name: 'Gas', nameEs: 'Gas', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Gas' },

  // Tier 1 / Minerales y Materiales Básicos
  { id: 'MUD', name: 'Mud', nameEs: 'Barro', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Mud' },
  { id: 'CLAY', name: 'Clay', nameEs: 'Arcilla', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Clay' },
  { id: 'SAND', name: 'Sand', nameEs: 'Arena', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Sand' },
  { id: 'STONE', name: 'Stone', nameEs: 'Piedra', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Stone' },
  { id: 'COPPER', name: 'Copper', nameEs: 'Cobre', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Copper' },
  { id: 'STEEL', name: 'Steel', nameEs: 'Acero', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Steel' },
  { id: 'SCREWS', name: 'Screws', nameEs: 'Tornillos', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Screws' },
  { id: 'BOLTS', name: 'Bolts', nameEs: 'Pernos', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Bolts' },
  { id: 'WIRE', name: 'Wire', nameEs: 'Cable', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Wire' },

  // Química & Energía
  { id: 'ALGAE', name: 'Algae', nameEs: 'Algas', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Algae' },
  { id: 'OXYGEN', name: 'Oxygen', nameEs: 'Oxígeno', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Oxygen' },
  { id: 'HYDROGEN', name: 'Hydrogen', nameEs: 'Hidrógeno', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Hydrogen' },
  { id: 'FUEL', name: 'Fuel', nameEs: 'Combustible', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Fuel' },
  { id: 'SULFUR', name: 'Sulfur', nameEs: 'Azufre', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Sulfur' },
  { id: 'ACID', name: 'Acid', nameEs: 'Ácido', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Acid' },
  { id: 'PLASTICS', name: 'Plastics', nameEs: 'Plásticos', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Plastics' },
  { id: 'ENERGY', name: 'Energy', nameEs: 'Energía', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Energy' },
  { id: 'SALT', name: 'Salt', nameEs: 'Sal', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Salt' },

  // Construcción & Manufactura Avanzada
  { id: 'GLASS', name: 'Glass', nameEs: 'Vidrio', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Glass' },
  { id: 'CERAMICS', name: 'Ceramics', nameEs: 'Cerámica', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Ceramics' },
  { id: 'CEMENT', name: 'Cement', nameEs: 'Cemento', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Cement' },
  { id: 'FIBERGLASS', name: 'Fiberglass', nameEs: 'Fibra de Vidrio', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Fiberglass' },
  { id: 'DYNAMITE', name: 'Dynamite', nameEs: 'Dinamita', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Dynamite' },
  { id: 'BEAM', name: 'Beam', nameEs: 'Viga', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Beam' },
  { id: 'BRICK', name: 'Brick', nameEs: 'Ladrillo', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Brick' },
  { id: 'TILE', name: 'Tile', nameEs: 'Baldosa', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Tile' },
  { id: 'NAIL', name: 'Nail', nameEs: 'Clavo', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Nail' },
  { id: 'PAINT', name: 'Paint', nameEs: 'Pintura', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Paint' },

  // Envolturas y Nidos
  { id: 'PAPERWRAP', name: 'Paper Wrap', nameEs: 'Envoltura de Papel', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Paperwrap' },
  { id: 'SANDWRAP', name: 'Sand Wrap', nameEs: 'Envoltura de Arena', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Sandwrap' },
  { id: 'STEAMWRAP', name: 'Steam Wrap', nameEs: 'Envoltura de Vapor', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Steamwrap' },
  { id: 'NEST', name: 'Nest', nameEs: 'Nido', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Nest' },
  { id: 'WETNEST', name: 'Wet Nest', nameEs: 'Nido Húmedo', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Wetnest' },
  { id: 'WARMNEST', name: 'Warm Nest', nameEs: 'Nido Cálido', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Warmnest' },
  { id: 'DYNONEST', name: 'Dyno Nest', nameEs: 'Nido Dyno', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Dynonest' },

  // Llaves, Libros y Documentos
  { id: 'KEY', name: 'Key', nameEs: 'Llave', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Key' },
  { id: 'CERAMICKEY', name: 'Ceramic Key', nameEs: 'Llave Cerámica', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Ceramickey' },
  { id: 'GLASSKEY', name: 'Glass Key', nameEs: 'Llave de Vidrio', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Glasskey' },
  { id: 'DYNOKEY', name: 'Dyno Key', nameEs: 'Llave Dyno', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Dynokey' },
  { id: 'BOOK', name: 'Book', nameEs: 'Libro', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Book' },
  { id: 'ARTICLE', name: 'Article', nameEs: 'Artículo', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Article' },
  { id: 'DIPLOMA', name: 'Diploma', nameEs: 'Diploma', category: 'resources', badge: 'FACTORY', badgeEs: 'FÁBRICA', iconSymbol: 'Diploma' },
];

export const BUILDING_ITEMS: CatalogItem[] = [
  { id: 'AIRSTREAM', name: 'Airstream', nameEs: 'Airstream', category: 'buildings', badge: 'BUILDING', badgeEs: 'EDIFICIO', iconSymbol: 'Airstream', isBuilding: true },
  { id: 'SUNFORGE', name: 'Sunforge', nameEs: 'Forja Solar', category: 'buildings', badge: 'BUILDING', badgeEs: 'EDIFICIO', iconSymbol: 'Sunforge', isBuilding: true },
  { id: 'STEAMFORGE', name: 'Steamforge', nameEs: 'Forja de Vapor', category: 'buildings', badge: 'BUILDING', badgeEs: 'EDIFICIO', iconSymbol: 'Steamforge', isBuilding: true },
  { id: 'REACTOR', name: 'Reactor', nameEs: 'Reactor', category: 'buildings', badge: 'POWER', badgeEs: 'ENERGÍA', iconSymbol: 'Reactor', isBuilding: true },
  { id: 'POWER_CELL', name: 'Power Cell', nameEs: 'Celda de Energía', category: 'buildings', badge: 'POWER', badgeEs: 'ENERGÍA', iconSymbol: 'PowerCell', isBuilding: true },
  { id: 'BATTERY', name: 'Battery', nameEs: 'Batería', category: 'buildings', badge: 'STORAGE', badgeEs: 'ALMACÉN', iconSymbol: 'Battery', isBuilding: true },
  { id: 'TOWN_HALL', name: 'Town Hall', nameEs: 'Ayuntamiento', category: 'buildings', badge: 'CIVIC', badgeEs: 'CÍVICO', iconSymbol: 'TownHall', isBuilding: true },
  { id: 'VAULT', name: 'Vault', nameEs: 'Bóveda', category: 'buildings', badge: 'STORAGE', badgeEs: 'ALMACÉN', iconSymbol: 'Vault', isBuilding: true },
  { id: 'WORKSHOP', name: 'Workshop', nameEs: 'Taller', category: 'buildings', badge: 'TECH', badgeEs: 'TECNOLOGÍA', iconSymbol: 'Workshop', isBuilding: true },
  { id: 'SECRET_LAB', name: 'Secret Lab', nameEs: 'Laboratorio Secreto', category: 'buildings', badge: 'RESEARCH', badgeEs: 'INVESTIGACIÓN', iconSymbol: 'SecretLab', isBuilding: true },
  { id: 'HOUSE', name: 'House', nameEs: 'Casa', category: 'buildings', badge: 'RESIDENTIAL', badgeEs: 'RESIDENCIAL', iconSymbol: 'House', isBuilding: true },
  { id: 'HATCHERY', name: 'Hatchery', nameEs: 'Criadero', category: 'buildings', badge: 'SPECIAL', badgeEs: 'ESPECIAL', iconSymbol: 'Hatchery', isBuilding: true },
  { id: 'SCHOOL', name: 'School', nameEs: 'Escuela', category: 'buildings', badge: 'CIVIC', badgeEs: 'CÍVICO', iconSymbol: 'School', isBuilding: true },
  { id: 'UNIVERSITY', name: 'University', nameEs: 'Universidad', category: 'buildings', badge: 'CIVIC', badgeEs: 'CÍVICO', iconSymbol: 'University', isBuilding: true },
];

export const EVENT_ITEMS: CatalogItem[] = [
  { id: 'event-fishing-frenzy', name: 'Fishing Frenzy', nameEs: 'Fishing Frenzy', category: 'events', badge: 'EVENT #3', badgeEs: 'EVENTO #3', iconSymbol: 'Dynofish' },
  { id: 'event-axie-infinity', name: 'Axie Crossover', nameEs: 'Axie Crossover', category: 'events', badge: 'EVENT #2', badgeEs: 'EVENTO #2', iconSymbol: 'Bolts' },
  { id: 'event-ronke-moku', name: 'Ronke x Moku', nameEs: 'Ronke x Moku', category: 'events', badge: 'EVENT #1', badgeEs: 'EVENTO #1', iconSymbol: 'Mud' },
];
