// Datos estáticos del juego: tablas de premios por rango de los Masterpieces (MP1–MP3).
// Razón de cambio única: economía/datos de eventos del juego.
// (Extraídos de EventLandingView.tsx para separar datos de presentación.)

export interface RankRow {
  rank: string;
  rankEs: string;
  coinReward?: string;
  fishReward?: string;
  tickets?: string;
  nft?: string;
  note?: string;
  noteEs?: string;
}

export const MP1_RANKS: RankRow[] = [
  { rank: 'Rank 1', rankEs: 'Puesto 1', coinReward: 'Top $COIN Share', fishReward: 'Top $FISH Share', nft: '1x Water Dyno Genesis NFT', tickets: '100 FP Tickets' },
  { rank: 'Rank 2', rankEs: 'Puesto 2', coinReward: 'Top $COIN Share', fishReward: 'Top $FISH Share', nft: '1x Founders Pass NFT', tickets: '80 FP Tickets' },
  { rank: 'Rank 3', rankEs: 'Puesto 3', coinReward: '50,000 $COIN', fishReward: '18,275 $FISH', tickets: '50 FP Raffle Tickets' },
  { rank: 'Rank 4', rankEs: 'Puesto 4', coinReward: '40,000 $COIN', fishReward: '14,620 $FISH', tickets: '40 FP Raffle Tickets' },
  { rank: 'Rank 5', rankEs: 'Puesto 5', coinReward: '35,000 $COIN', fishReward: '12,793 $FISH', tickets: '35 FP Raffle Tickets' },
  { rank: 'Rank 6 - 10', rankEs: 'Puestos 6 - 10', coinReward: '25,000 $COIN c/u', fishReward: '9,138 $FISH c/u', tickets: '25 FP Tickets c/u' },
  { rank: 'Rank 11 - 25', rankEs: 'Puestos 11 - 25', coinReward: '15,000 $COIN c/u', fishReward: '5,483 $FISH c/u', tickets: '15 FP Tickets c/u' },
  { rank: 'Rank 26 - 50', rankEs: 'Puestos 26 - 50', coinReward: '10,000 $COIN c/u', fishReward: '3,655 $FISH c/u', tickets: '10 FP Tickets c/u' },
  { rank: 'Rank 51 - 100', rankEs: 'Puestos 51 - 100', coinReward: '5,000 $COIN c/u', fishReward: '1,828 $FISH c/u', tickets: '5 FP Tickets c/u' },
  { rank: 'Rank 101 - 150', rankEs: 'Puestos 101 - 150', coinReward: '-', fishReward: '-', tickets: '5 FP Tickets c/u', note: 'Eligible for 4 Founders Pass Draws', noteEs: 'Elegible para los 4 sorteos de Founders Pass' },
];

export const MP2_RANKS: RankRow[] = [
  { rank: 'Rank 1', rankEs: 'Puesto 1', coinReward: 'Top $COIN Share', fishReward: 'Top $FISH Share', nft: '1x Water Dyno Genesis NFT', tickets: '100 FP Tickets' },
  { rank: 'Rank 2', rankEs: 'Puesto 2', coinReward: 'Top $COIN Share', fishReward: 'Top $FISH Share', nft: '1x Founders Pass NFT', tickets: '80 FP Tickets' },
  { rank: 'Rank 3', rankEs: 'Puesto 3', coinReward: '50,000 $COIN', fishReward: '18,275 $FISH', tickets: '60 FP Raffle Tickets' },
  { rank: 'Rank 4', rankEs: 'Puesto 4', coinReward: '40,000 $COIN', fishReward: '14,620 $FISH', tickets: '50 FP Raffle Tickets' },
  { rank: 'Rank 5', rankEs: 'Puesto 5', coinReward: '35,000 $COIN', fishReward: '12,793 $FISH', tickets: '40 FP Raffle Tickets' },
  { rank: 'Rank 6 - 10', rankEs: 'Puestos 6 - 10', coinReward: '25,000 $COIN c/u', fishReward: '9,138 $FISH c/u', tickets: '30 FP Tickets c/u' },
  { rank: 'Rank 11 - 25', rankEs: 'Puestos 11 - 25', coinReward: '15,000 $COIN c/u', fishReward: '5,483 $FISH c/u', tickets: '20 FP Tickets c/u' },
  { rank: 'Rank 26 - 50', rankEs: 'Puestos 26 - 50', coinReward: '10,000 $COIN c/u', fishReward: '3,655 $FISH c/u', tickets: '15 FP Tickets c/u' },
  { rank: 'Rank 51 - 100', rankEs: 'Puestos 51 - 100', coinReward: '5,000 $COIN c/u', fishReward: '1,828 $FISH c/u', tickets: '10 FP Tickets c/u' },
  { rank: 'Rank 101 - 150', rankEs: 'Puestos 101 - 150', coinReward: '-', fishReward: '-', tickets: '6 FP Tickets c/u', note: 'Eligible for 4 Founders Pass Draws', noteEs: 'Elegible para los 4 sorteos de Founders Pass' },
];

export const MP3_RANKS: RankRow[] = [
  { rank: 'Rank 1', rankEs: 'Puesto 1', fishReward: '15.0% of Dynamic $FISH Pool', nft: '1x Water Dyno Genesis NFT', tickets: '100 FP Tickets', note: 'Apex Champion', noteEs: 'Campeón Supremo' },
  { rank: 'Rank 2', rankEs: 'Puesto 2', fishReward: '10.0% of Dynamic $FISH Pool', nft: '1x Founders Pass NFT', tickets: '80 FP Tickets' },
  { rank: 'Rank 3', rankEs: 'Puesto 3', fishReward: '7.5% of Dynamic $FISH Pool', tickets: '60 FP Tickets' },
  { rank: 'Rank 4', rankEs: 'Puesto 4', fishReward: '5.0% of Dynamic $FISH Pool', tickets: '50 FP Tickets' },
  { rank: 'Rank 5', rankEs: 'Puesto 5', fishReward: '4.0% of Dynamic $FISH Pool', tickets: '40 FP Tickets' },
  { rank: 'Rank 6 - 10', rankEs: 'Puestos 6 - 10', fishReward: '3.0% of Dynamic $FISH Pool c/u', tickets: '30 FP Tickets c/u' },
  { rank: 'Rank 11 - 25', rankEs: 'Puestos 11 - 25', fishReward: '1.5% of Dynamic $FISH Pool c/u', tickets: '20 FP Tickets c/u' },
  { rank: 'Rank 26 - 50', rankEs: 'Puestos 26 - 50', fishReward: '0.96% of Dynamic $FISH Pool c/u', tickets: '15 FP Tickets c/u', note: 'Top 50 shares 99% of pool', noteEs: 'Top 50 se reparte el 99% del pozo' },
  { rank: 'Rank 51 - 100', rankEs: 'Puestos 51 - 100', tickets: '10 FP Tickets + 15 $FISH Draw Tickets', note: 'Eligible for 2x 0.5% $FISH Draws', noteEs: 'Elegible para 2 sorteos de 0.5% de $FISH' },
  { rank: 'Rank 101 - 150', rankEs: 'Puestos 101 - 150', tickets: '5 FP Tickets + 10 $FISH Draw Tickets', note: 'Eligible for both draws', noteEs: 'Elegible para ambos sorteos' },
  { rank: 'Rank 151 - 200', rankEs: 'Puestos 151 - 200', tickets: '10 $FISH Draw Tickets' },
  { rank: 'Rank 201 - 250', rankEs: 'Puestos 201 - 250', tickets: '5 $FISH Draw Tickets' },
];
