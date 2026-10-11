import { OfficialEvent } from '../types';

export const OFFICIAL_EVENTS: OfficialEvent[] = [
  {
    id: 'fishing-frenzy',
    catalogId: 'event-fishing-frenzy',
    number: 3,
    title: 'Fishing Frenzy x Craft World',
    titleEs: 'Fishing Frenzy x Craft World',
    tagline: 'Masterpiece 3 • Coastal Expansion & Seafood Industrial Line',
    taglineEs: 'Masterpiece 3 • Expansión Costera y Línea Industrial Marina',
    partner: 'Fishing Frenzy (Ronin Network)',
    prizeSymbol: '$FISH',
    poolFactor: '70%',
    startDate: '2025-12-03T13:00:00Z',
    endDate: '2026-01-15T13:00:00Z',
    status: 'concluded',
    levelRequirement: 10,
    prizePoolSummary: '~$37,000 in $FISH (70% Dynamic Redistribution) + Water Dyno NFTs + Founders Passes + $COIN',
    prizePoolSummaryEs: '~$37,000 en $FISH (70% Redistribución Dinámica) + Water Dyno NFTs + Founders Passes + $COIN',
    description:
      'Major collaborative event uniting Fishing Frenzy and Craft World on Ronin Network. Players deposited $FISH to purchase Worms, built an offshore empire through 9 new coastal culinary factories, and constructed the communal Masterpiece structures.',
    descriptionEs:
      'Gran evento colaborativo que unió Fishing Frenzy y Craft World en Ronin Network. Los jugadores depositaron $FISH para adquirir Lombrices (Worms), construyeron un imperio costero a través de 9 fábricas culinarias marinas exclusivas y levantaron las megaestructuras comunitarias Masterpiece.',
    lore: {
      hook:
        'The tides have shifted. From beyond the ponds of Craft World, new boats have arrived, bringing with them the Fishers of Fishing Frenzy! Masters of the sea, cooking, and trade, these ocean travelers have come not to conquer, but to build.',
      hookEs:
        'La marea ha cambiado. Desde más allá de las aguas de Craft World han llegado nuevos barcos, trayendo consigo a los Pescadores de Fishing Frenzy. Maestros del mar, la cocina y el comercio, estos viajeros del océano no han venido a conquistar, sino a construir.',
      body:
        'Together with the Dynos, they’ll shape a brand-new coastal haven, a place where craft meets catch, and every dish, trade, and build strengthens their seaside empire. The Great Catch has begun. Join forces with the Fishers and Dynos to craft the three Masterpieces, fuel the Fishing Ports, and rise as a legend of the Seaside Empire.',
      bodyEs:
        'Junto con los Dynos, darán forma a un nuevo refugio costero donde el crafteo se une a la pesca, y cada plato, intercambio y construcción fortalece su imperio costero. La Gran Captura ha comenzado. Únete a los Pescadores y Dynos para erigir las tres Obras Maestras, potenciar los Puertos Pesqueros y convertirte en leyenda del Imperio Costero.',
    },
    mediaImages: {
      bannerImage: '/assets/events/FrenzyPromo.png',
      flowImage: '/assets/events/flow_fishing_frenzy.png',
      timelineImage: '/assets/events/TimelineVisualization.jpg',
      onboardingImage: '/assets/events/FrenzyOnboarding.png',
      overviewPrizeImage: '/assets/events/FFPrizePool.png',
      mp1PrizeImage: '/assets/events/FFPrizePoolMp1.png',
      mp2PrizeImage: '/assets/events/FFPrizePoolMp2.png',
      mp3PrizeImage: '/assets/events/FFPrizePoolMp3.png',
      workersImage: '/assets/events/FFWorkers.png',
      karmaModelImage: '/assets/events/KarmaScoreModel.avif',
      statueImage: '/assets/events/FishingStatueTier1.webp',
    },
    officialLinks: [
      {
        label: 'Official Web App',
        labelEs: 'Web Oficial de Craft World',
        url: 'https://craft-world.gg/',
        category: 'game',
      },
      {
        label: 'Google Play Android',
        labelEs: 'Descarga en Android (Google Play)',
        url: 'https://play.google.com/store/apps/details?id=com.angrydynomiteslab.craftworld&hl=de',
        category: 'game',
      },
      {
        label: 'Apple iOS App Store',
        labelEs: 'Descarga en iOS (App Store)',
        url: 'https://apps.apple.com/us/app/craft-world-builder/id6469102709',
        category: 'game',
      },
      {
        label: 'Discord Community (#lounge)',
        labelEs: 'Comunidad Oficial de Discord (#lounge)',
        url: 'https://discord.gg/AngryDynomites',
        category: 'social',
      },
      {
        label: 'VOYA ID Portal (Claim Rewards)',
        labelEs: 'Portal VOYA ID (Reclamar Premios)',
        url: 'https://craft-world.gg/voya-id/index.html',
        category: 'portal',
      },
      {
        label: 'MP1 Rank Rewards Breakdown (Notion)',
        labelEs: 'Desglose de Premios MP1 (Notion)',
        url: 'https://angry-dynomites-lab.notion.site/MP1-RANK-REWARDS-2a847280238681859e01dd795e781adc',
        category: 'notion',
      },
      {
        label: 'MP2 Rank Rewards Breakdown (Notion)',
        labelEs: 'Desglose de Premios MP2 (Notion)',
        url: 'https://angry-dynomites-lab.notion.site/MP2-RANK-REWARDS-2a847280238681028a19c8afb42925df',
        category: 'notion',
      },
      {
        label: 'MP3 Rank Rewards Breakdown (Notion)',
        labelEs: 'Desglose de Premios MP3 (Notion)',
        url: 'https://angry-dynomites-lab.notion.site/MP3-RANK-REWARDS-2a8472802386819890fbdc40cda9f9fc',
        category: 'notion',
      },
    ],
    batteryOverhaul: [
      {
        metric: 'Base Battery Capacity',
        metricEs: 'Capacidad Base de Batería',
        regular: '150 pts',
        event: '1,200 pts',
        change: '+700% Boost',
      },
      {
        metric: 'Natural Recharge Rate',
        metricEs: 'Recarga Natural Automática',
        regular: '+25 / 15 min',
        event: '+75 / 15 min',
        change: '+200% Velocity',
      },
      {
        metric: 'Daily Ad Watch Limit',
        metricEs: 'Límite Diario de Anuncios',
        regular: '10 ads / día',
        event: '15 ads / día',
        change: '+50% Allowance',
      },
      {
        metric: 'Recharge Energy Per Ad',
        metricEs: 'Batería Otorgada por Anuncio',
        regular: '+100 pts',
        event: '+800 pts',
        change: '+700% Energy',
      },
      {
        metric: 'Total Daily Ad Recharge',
        metricEs: 'Total Diario Obtenible por Ads',
        regular: '1,000 pts',
        event: '12,000 pts',
        change: '12x Massive Scale',
      },
      {
        metric: 'Total Estimated Daily Energy',
        metricEs: 'Energía Total Diaria Disponible',
        regular: '~2,000 pts',
        event: '~15,000 pts',
        change: '7.5x Overall Capacity',
      },
    ],
    karmaWorkers: [
      {
        category: 'Common',
        categoryEs: 'Común',
        karma: 30000,
        karmaFormatted: '30,000',
        workerNumber: 1,
        bonus: 'Unlocks Event Worker #1',
        bonusEs: 'Desbloquea Trabajador de Evento #1',
      },
      {
        category: 'Common',
        categoryEs: 'Común',
        karma: 100000,
        karmaFormatted: '100,000',
        workerNumber: 2,
        bonus: 'Unlocks Event Worker #2',
        bonusEs: 'Desbloquea Trabajador de Evento #2',
      },
      {
        category: 'Common',
        categoryEs: 'Común',
        karma: 200000,
        karmaFormatted: '200,000',
        workerNumber: 3,
        bonus: 'Unlocks Event Worker #3',
        bonusEs: 'Desbloquea Trabajador de Evento #3',
      },
      {
        category: 'Common',
        categoryEs: 'Común',
        karma: 300000,
        karmaFormatted: '300,000',
        workerNumber: 4,
        bonus: 'Unlocks Event Worker #4',
        bonusEs: 'Desbloquea Trabajador de Evento #4',
      },
      {
        category: 'Rare',
        categoryEs: 'Raro',
        karma: 400000,
        karmaFormatted: '400,000',
        workerNumber: 5,
        bonus: 'Unlocks Event Worker #5 (Rare)',
        bonusEs: 'Desbloquea Trabajador de Evento #5 (Raro)',
      },
      {
        category: 'Rare',
        categoryEs: 'Raro',
        karma: 500000,
        karmaFormatted: '500,000',
        workerNumber: 6,
        bonus: 'Unlocks Event Worker #6 (Rare)',
        bonusEs: 'Desbloquea Trabajador de Evento #6 (Raro)',
      },
      {
        category: 'Rare',
        categoryEs: 'Raro',
        karma: 600000,
        karmaFormatted: '600,000',
        workerNumber: 7,
        bonus: 'Unlocks Event Worker #7 (Rare)',
        bonusEs: 'Desbloquea Trabajador de Evento #7 (Raro)',
      },
      {
        category: 'Rare',
        categoryEs: 'Raro',
        karma: 700000,
        karmaFormatted: '700,000',
        workerNumber: 8,
        bonus: 'Unlocks Event Worker #8 (Rare)',
        bonusEs: 'Desbloquea Trabajador de Evento #8 (Raro)',
      },
      {
        category: 'Legendary',
        categoryEs: 'Legendario',
        karma: 800000,
        karmaFormatted: '800,000',
        workerNumber: 9,
        bonus: 'Unlocks Event Worker #9 (Legendary)',
        bonusEs: 'Desbloquea Trabajador de Evento #9 (Legendario)',
      },
      {
        category: 'Legendary',
        categoryEs: 'Legendario',
        karma: 1000000,
        karmaFormatted: '1,000,000',
        workerNumber: 10,
        bonus: 'Unlocks Event Worker #10 (Legendary)',
        bonusEs: 'Desbloquea Trabajador de Evento #10 (Legendario)',
      },
      {
        category: 'Legendary',
        categoryEs: 'Legendario',
        karma: 1500000,
        karmaFormatted: '1,500,000',
        workerNumber: 11,
        bonus: 'Unlocks Event Worker #11 (Legendary)',
        bonusEs: 'Desbloquea Trabajador de Evento #11 (Legendario)',
      },
      {
        category: 'Legendary',
        categoryEs: 'Legendario',
        karma: 2000000,
        karmaFormatted: '2,000,000',
        workerNumber: 12,
        bonus: 'Unlocks Event Worker #12 (Legendary Apex)',
        bonusEs: 'Desbloquea Trabajador de Evento #12 (Legendario Apex)',
      },
    ],
    masterpieces: [
      {
        mpNumber: 1,
        name: 'Grand Aquarium',
        nameEs: 'Gran Acuario',
        thRequirement: 10,
        image: '/assets/events/FFPrizePoolMp1.png',
        notionUrl: 'https://angry-dynomites-lab.notion.site/MP1-RANK-REWARDS-2a847280238681859e01dd795e781adc',
        prizes: [
          { rank: 'Rank 1', rankEs: 'Puesto 1', reward: '1x Water Dyno Genesis NFT', rewardEs: '1x NFT Génesis Water Dyno' },
          { rank: 'Rank 2', rankEs: 'Puesto 2', reward: '1x Fishing Frenzy Founders Pass NFT', rewardEs: '1x NFT Founders Pass' },
          { rank: 'Top 100', rankEs: 'Top 100', reward: '1M $COIN + 365.5k $FISH pool share', rewardEs: '1M $COIN + 365.5k $FISH distribuido' },
          { rank: 'Top 150', rankEs: 'Top 150', reward: '1,550x Founders Pass Raffle Tickets', rewardEs: '1,550 Boletos para Sorteo Founders Pass' },
        ],
      },
      {
        mpNumber: 2,
        name: 'Frog Plushie',
        nameEs: 'Peluche de Rana',
        thRequirement: 10,
        image: '/assets/events/FFPrizePoolMp2.png',
        notionUrl: 'https://angry-dynomites-lab.notion.site/MP2-RANK-REWARDS-2a847280238681028a19c8afb42925df',
        prizes: [
          { rank: 'Rank 1', rankEs: 'Puesto 1', reward: '1x Water Dyno Genesis NFT', rewardEs: '1x NFT Génesis Water Dyno' },
          { rank: 'Rank 2', rankEs: 'Puesto 2', reward: '1x Fishing Frenzy Founders Pass NFT', rewardEs: '1x NFT Founders Pass' },
          { rank: 'Top 100', rankEs: 'Top 100', reward: '1M $COIN + 365.5k $FISH pool share', rewardEs: '1M $COIN + 365.5k $FISH distribuido' },
          { rank: 'Top 150', rankEs: 'Top 150', reward: '2,010x Founders Pass Raffle Tickets', rewardEs: '2,010 Boletos para Sorteo Founders Pass' },
        ],
      },
      {
        mpNumber: 3,
        name: 'Coastal Megastructure',
        nameEs: 'Megaestructura Costera',
        thRequirement: 11,
        image: '/assets/events/FFPrizePoolMp3.png',
        notionUrl: 'https://angry-dynomites-lab.notion.site/MP3-RANK-REWARDS-2a8472802386819890fbdc40cda9f9fc',
        prizes: [
          { rank: 'Rank 1', rankEs: 'Puesto 1', reward: '1x Water Dyno Genesis NFT', rewardEs: '1x NFT Génesis Water Dyno' },
          { rank: 'Rank 2', rankEs: 'Puesto 2', reward: '1x Fishing Frenzy Founders Pass NFT', rewardEs: '1x NFT Founders Pass' },
          { rank: 'Top 50', rankEs: 'Top 50', reward: '99% of 70% dynamic $FISH prize pool', rewardEs: '99% del pozo dinámico del 70% en $FISH' },
          { rank: 'Top 150', rankEs: 'Top 150', reward: '2,700x Founders Pass Raffle Tickets', rewardEs: '2,700 Boletos para Sorteo Founders Pass' },
          { rank: 'Ranks 51 - 250', rankEs: 'Puestos 51 - 250', reward: '2,250x $FISH Prize Draw Tickets (2x 0.5% dynamic pools)', rewardEs: '2,250 Boletos de Sorteo $FISH (2 sorteos de 0.5% c/u)' },
        ],
      },
    ],
    mechanics: [
      {
        title: '$FISH to Worms Gateway (1 $FISH = 270 WORMS)',
        titleEs: 'Conversión $FISH a Lombrices (1 $FISH = 270 WORMS)',
        description:
          'Fixed one-way off-chain conversion. Players exchange $FISH for WORMS within Craft World. WORMS are the vital fuel required to run the coastal traps and extract Dynofish.',
        descriptionEs:
          'Conversión fija unidireccional off-chain. Los jugadores canjean $FISH por WORMS dentro de Craft World. Las WORMS son el combustible indispensable para trampas costeras y extracción de Dynofish.',
      },
      {
        title: '70% Dynamic Pool Redistribution, 20% Treasury & 10% Burn',
        titleEs: '70% Pozo Dinámico, 20% Tesorería y 10% Quema Definitiva',
        description:
          '70% of all $FISH spent on Worms feeds directly into the Masterpiece 3 winners prize pool. 20% goes to the treasury for tax purposes, and 10% is burned permanently on-chain.',
        descriptionEs:
          'El 70% de todo el $FISH gastado en lombrices va directo al pozo de premios de Masterpiece 3. El 20% se destina a tesorería para impuestos y el 10% se quema de forma permanente on-chain.',
      },
      {
        title: 'Karma Workers Synergy (Up to 16 Active Workers)',
        titleEs: 'Sinergia de Trabajadores por Karma (Hasta 16 Activos)',
        description:
          'Active Fishing Frenzy players unlocked up to 12 event workers based on their Karma score (from 30k up to 2M points), stacking with 4 base Dyno workers for a maximum of 16 deployed workers.',
        descriptionEs:
          'Los jugadores de Fishing Frenzy desbloqueaban hasta 12 trabajadores de evento según su puntaje de Karma (desde 30k hasta 2M), acumulables con 4 Dynos base para un total de 16 trabajadores.',
      },
      {
        title: 'Booster Hut & Fishing Port Upgrades',
        titleEs: 'Booster Hut y Mejoras de Puertos Pesqueros',
        description:
          'Players upgraded dedicated event Fishing Ports and utilized Booster Huts to compress processing times across the 9 seafood cooking factories and trade lines.',
        descriptionEs:
          'Los jugadores mejoraban Puertos Pesqueros exclusivos y usaban el Booster Hut para acelerar los tiempos de procesamiento en las 9 fábricas de cocina marina y líneas comerciales.',
      },
    ],
    recipes: [
      {
        symbol: 'DYNOFISH',
        name: 'Dynofish Extraction',
        nameEs: 'Extracción de Dynofish',
        duration: '15s',
        outputAmount: 20,
        outputToken: 'DYNOFISH',
        inputs: [{ token: 'WORMS', amount: 20 }],
      },
      {
        symbol: 'FISHBONE',
        name: 'Fishbone Processing',
        nameEs: 'Procesamiento de Espina (Fishbone)',
        duration: '10s',
        outputAmount: 10,
        outputToken: 'FISHBONE',
        inputs: [{ token: 'DYNOFISH', amount: 10 }],
      },
      {
        symbol: 'BONESOUP',
        name: 'Bone Soup Kitchen',
        nameEs: 'Cocina de Sopa de Huesos',
        duration: '15s',
        outputAmount: 1,
        outputToken: 'BONESOUP',
        inputs: [{ token: 'FISHBONE', amount: 12 }],
      },
      {
        symbol: 'FUGU',
        name: 'Fugu Preparation',
        nameEs: 'Preparación de Fugu',
        duration: '40s',
        outputAmount: 1,
        outputToken: 'FUGU',
        inputs: [{ token: 'FISHBONE', amount: 50 }],
      },
      {
        symbol: 'RAWRVIOLI',
        name: 'Rawrvioli Workshop',
        nameEs: 'Taller de Rawrvioli',
        duration: '3 min',
        outputAmount: 1,
        outputToken: 'RAWRVIOLI',
        inputs: [{ token: 'BONESOUP', amount: 12 }],
      },
      {
        symbol: 'SUSHI',
        name: 'Sushi Bar',
        nameEs: 'Barra de Sushi',
        duration: '7.5 min',
        outputAmount: 1,
        outputToken: 'SUSHI',
        inputs: [{ token: 'FUGU', amount: 6 }],
      },
      {
        symbol: 'DYNODESSERT',
        name: 'Dyno Dessert Bakery',
        nameEs: 'Pastelería Dyno Dessert',
        duration: '30 min',
        outputAmount: 1,
        outputToken: 'DYNODESSERT',
        inputs: [
          { token: 'FUGU', amount: 26 },
          { token: 'RAWRVIOLI', amount: 16 },
        ],
      },
      {
        symbol: 'SASHIMI',
        name: 'Master Sashimi Station',
        nameEs: 'Estación de Sashimi Maestro',
        duration: '40 min',
        outputAmount: 1,
        outputToken: 'SASHIMI',
        inputs: [
          { token: 'BONESOUP', amount: 115 },
          { token: 'SUSHI', amount: 8 },
        ],
      },
      {
        symbol: 'LOBSTER',
        name: 'Royal Lobster Banquet',
        nameEs: 'Banquete Real de Langosta',
        duration: '90 min',
        outputAmount: 1,
        outputToken: 'LOBSTER',
        inputs: [
          { token: 'DYNODESSERT', amount: 4 },
          { token: 'SASHIMI', amount: 3 },
        ],
      },
    ],
    rewardsTiers: [
      {
        tier: '3x Water Dyno NFTs (Rank 1 on MP1, MP2, MP3)',
        tierEs: '3x NFTs Water Dyno (Puesto 1 en MP1, MP2, MP3)',
        description:
          'Awarded directly to the Rank 1 champions of Masterpiece 1, 2, and 3. Premium genesis utility NFTs on Ronin Network.',
        descriptionEs:
          'Otorgados de forma directa al campeón del puesto 1 de Masterpiece 1, 2 y 3. NFTs génesis de alta utilidad en Ronin Network.',
      },
      {
        tier: '7x Fishing Frenzy Founders Pass NFTs',
        tierEs: '7x NFTs Founders Pass de Fishing Frenzy',
        description:
          '3 guaranteed for Rank 2 on MP1, MP2, and MP3. 4 awarded through Founders Pass Prize Draws for Top 150 ticket holders.',
        descriptionEs:
          '3 garantizados para el puesto 2 en MP1, MP2 y MP3. 4 otorgados mediante sorteos entre los clasificados del Top 150.',
      },
      {
        tier: '70% Dynamic $FISH Prize Pool (MP3 Top 50 + Draws)',
        tierEs: '70% Pozo Dinámico $FISH (Top 50 MP3 + Sorteos)',
        description:
          '70% of all $FISH spent on Worms. 99% distributed among Top 50 of MP3, and 1% divided into two 0.5% Prize Draws for ranks 51-250.',
        descriptionEs:
          'El 70% de todo el $FISH gastado en Worms. El 99% repartido al Top 50 de MP3 y 1% dividido en dos sorteos de 0.5% para puestos 51-250.',
      },
      {
        tier: '731k $FISH Fixed Rewards (MP1 & MP2 Top 100)',
        tierEs: '731k $FISH en Premios Fijos (Top 100 de MP1 y MP2)',
        description:
          'Distributed among players ranking in the Top 100 of Masterpiece 1 (Grand Aquarium) and Masterpiece 2 (Frog Plushie).',
        descriptionEs:
          'Distribuidos equitativamente entre los clasificados en el Top 100 de Masterpiece 1 (Gran Acuario) y Masterpiece 2 (Peluche de Rana).',
      },
      {
        tier: '2,000,000 Dyno Coins ($COIN)',
        tierEs: '2,000,000 Dyno Coins ($COIN)',
        description:
          '1M $COIN allocated to Top 100 players of MP1, and another 1M $COIN allocated to Top 100 players of MP2.',
        descriptionEs:
          '1M de $COIN asignado al Top 100 de MP1 y otro 1M de $COIN asignado al Top 100 de MP2.',
      },
      {
        tier: '19 Avatars & 12 Building Decorations',
        tierEs: '19 Avatares y 12 Decoraciones de Edificios',
        description:
          'Exclusive cosmetic avatars and seaside decorations awarded to players who reached specific milestone contribution tiers.',
        descriptionEs:
          'Avatares cosméticos y decoraciones costeras exclusivas otorgadas a todos los jugadores que alcanzaron hitos de nivel.',
      },
    ],
    guideSteps: [
      {
        step: 1,
        title: 'Reach Town Hall Level 10 (or 11 for MP3)',
        titleEs: 'Alcanza Nivel de Ayuntamiento 10 (u 11 para MP3)',
        description:
          'Reach Town Hall Level 10 to participate in Masterpieces 1 and 2. Level up to TH 11 to unlock participation in Masterpiece 3.',
        descriptionEs:
          'Alcanza el nivel 10 de Ayuntamiento para participar en Masterpiece 1 y 2. Sube a TH 11 para desbloquear tu entrada en Masterpiece 3.',
        tip: 'Craft and upgrade buildings ahead of time to gather XP and reach level 10+ smoothly.',
        tipEs: 'Craftea y mejora edificios con anticipación para ganar XP y llegar al nivel 10+ sin apuros.',
      },
      {
        step: 2,
        title: 'Sync Ronin Wallet & Fishing Frenzy Karma',
        titleEs: 'Sincroniza tu Ronin Wallet y Karma de Fishing Frenzy',
        description:
          'Link your Ronin wallet to sync your Fishing Frenzy Karma score. Earn up to 12 event workers (from 30k up to 2M Karma).',
        descriptionEs:
          'Conecta tu billetera Ronin para sincronizar tu puntaje de Karma. Desbloquea hasta 12 trabajadores de evento (de 30k a 2M de Karma).',
        tip: 'Together with your 4 base Dyno workers, you can deploy up to 16 workers at once.',
        tipEs: 'Junto con tus 4 Dynos base, podrás desplegar un total de hasta 16 trabajadores en simultáneo.',
      },
      {
        step: 3,
        title: 'Exchange $FISH for WORMS (1 $FISH = 270 WORMS)',
        titleEs: 'Canjea $FISH por WORMS (1 $FISH = 270 WORMS)',
        description:
          'Exchange $FISH tokens for WORMS inside Craft World. 70% of spent $FISH feeds the prize pool, 20% to treasury, and 10% is burned.',
        descriptionEs:
          'Canjea tokens $FISH por WORMS dentro del juego. El 70% del $FISH gastado nutre el pozo de premios, 20% va a tesorería y 10% se quema.',
        tip: 'WORMS are off-chain event resources. Only exchange what you plan to use before the event ends.',
        tipEs: 'Las WORMS son recursos off-chain del evento. Canjea solo lo que vayas a usar durante el evento.',
      },
      {
        step: 4,
        title: 'Upgrade Fishing Ports & Run Seafood Kitchens',
        titleEs: 'Mejora Puertos Pesqueros y Opera Cocinas Marinas',
        description:
          'Level up event-exclusive Fishing Ports and refine Dynofish up the 9 culinary tiers (from Bone Soup to Lobster and Sashimi).',
        descriptionEs:
          'Sube de nivel los Puertos Pesqueros del evento y procesa Dynofish en las 9 cadenas culinarias (desde Bone Soup hasta Langosta y Sashimi).',
        tip: 'Utilize the Booster Hut to drastically accelerate cooking and processing durations.',
        tipEs: 'Aprovecha el Booster Hut para acelerar drásticamente los tiempos de cocción y procesado.',
      },
      {
        step: 5,
        title: 'Contribute to Masterpieces & Win On-Chain Rewards',
        titleEs: 'Contribuye a las Masterpieces y Gana Premios On-Chain',
        description:
          'Donate crafted items to Masterpieces 1-3. Climb the leaderboards to secure NFTs, $FISH, $COIN, and raffle tickets.',
        descriptionEs:
          'Dona ítems elaborados a Masterpieces 1-3. Escala en el ranking para asegurar NFTs, $FISH, $COIN y boletos de sorteo.',
        tip: 'Claim all on-chain Ronin rewards and vouchers directly via the VOYA ID portal.',
        tipEs: 'Reclama todos los premios on-chain y cupones de Ronin directamente en el portal VOYA ID.',
      },
    ],
    faqs: [
      {
        question: 'When did the event launch and what was its schedule?',
        questionEs: '¿Cuándo comenzó el evento y cuál fue su cronograma?',
        answer:
          'The event officially launched on Wednesday, December 3rd at 2:00 PM UTC within Craft World across three Masterpiece phases separated by short strategic breaks.',
        answerEs:
          'El evento comenzó oficialmente el miércoles 3 de diciembre a las 14:00 UTC dentro de Craft World a través de 3 fases de Masterpiece separadas por breves descansos estratégicos.',
      },
      {
        question: 'What Town Hall levels were required to participate?',
        questionEs: '¿Qué nivel de Ayuntamiento se necesitaba para participar?',
        answer:
          'Masterpiece 1 (Grand Aquarium) and Masterpiece 2 (Frog Plushie) required Town Hall Level 10. Masterpiece 3 required Town Hall Level 11.',
        answerEs:
          'Masterpiece 1 (Gran Acuario) y Masterpiece 2 (Peluche de Rana) requerían Nivel 10 de Ayuntamiento. Masterpiece 3 requería Nivel 11.',
      },
      {
        question: 'What is the exchange rate between $FISH and WORMS?',
        questionEs: '¿Cuál es la tasa de cambio entre $FISH y WORMS?',
        answer:
          'The exchange rate is fixed at 1 $FISH = 270 WORMS. This is a one-way off-chain conversion within Craft World.',
        answerEs:
          'La tasa es fija: 1 $FISH = 270 WORMS. Es una conversión unidireccional off-chain dentro de Craft World.',
      },
      {
        question: 'How was the 70% $FISH pool distributed and what happened to the rest?',
        questionEs: '¿Cómo se distribuyó el 70% del pozo en $FISH y qué pasó con el resto?',
        answer:
          '70% went directly to the Masterpiece 3 prize pool (99% to Top 50 players, 1% split between two 0.5% prize draws). 20% went to the treasury for tax purposes, and 10% was permanently burned on-chain.',
        answerEs:
          'El 70% fue directamente al pozo de premios de Masterpiece 3 (99% al Top 50 y 1% dividido en dos sorteos de 0.5%). El 20% fue a tesorería para impuestos y el 10% se quemó definitivamente on-chain.',
      },
      {
        question: 'How did the two $FISH Prize Draws work?',
        questionEs: '¿Cómo funcionaron los dos sorteos de $FISH?',
        answer:
          'Two prize draws of 0.5% each were held among ranks 51-250 of MP3. Ranks 1-50 were excluded. The winner of Draw 1 was excluded from Draw 2 to maximize fairness. All entries were automatically tracked without manual action.',
        answerEs:
          'Se realizaron dos sorteos de 0.5% cada uno entre los puestos 51 a 250 de MP3. Los puestos 1-50 fueron excluidos. El ganador del sorteo 1 no participó en el 2 para dar más oportunidades a todos. La participación fue automática.',
      },
      {
        question: 'How did the 4 Founders Pass NFT Prize Draws work?',
        questionEs: '¿Cómo funcionaron los 4 sorteos de NFTs Founders Pass?',
        answer:
          'Players ranking 1-150 across each of the three Masterpieces (MP1, MP2, MP3) received raffle tickets. Four separate draws awarded 1 Founders Pass NFT each. Winners were excluded from subsequent draws.',
        answerEs:
          'Los jugadores de los puestos 1 a 150 de cada una de las 3 Masterpieces recibieron boletos de sorteo. Se realizaron 4 sorteos de 1 Founders Pass cada uno, excluyendo a los ganadores previos en los sorteos siguientes.',
      },
      {
        question: 'Where and how do players claim on-chain rewards?',
        questionEs: '¿Dónde y cómo reclaman los jugadores sus recompensas on-chain?',
        answer:
          'Rewards and NFTs on Ronin Network were dropped directly into winners’ VOYA IDs. Players log in to the VOYA ID page (https://craft-world.gg/voya-id/index.html) using their game credentials to manage and claim vouchers.',
        answerEs:
          'Las recompensas y NFTs en Ronin Network se depositaron en el VOYA ID de los ganadores. Los jugadores inician sesión en la página de VOYA ID (https://craft-world.gg/voya-id/index.html) con sus credenciales del juego para gestionar y reclamar.',
      },
      {
        question: 'What happened to leftover WORMS after the event?',
        questionEs: '¿Qué ocurrió con las WORMS sobrantes al finalizar el evento?',
        answer:
          'WORMS are strictly off-chain event resources and do not convert back into $FISH. Players were encouraged to spend them before the event concluded.',
        answerEs:
          'Las WORMS son recursos de evento exclusivamente off-chain y no se convierten de regreso a $FISH. Se recomendó usarlas en su totalidad antes del cierre.',
      },
    ],
  },
  {
    id: 'axie-infinity',
    catalogId: 'event-axie-infinity',
    number: 2,
    title: 'Axie Infinity x Craft World',
    titleEs: 'Axie Infinity x Craft World',
    tagline: 'Masterpiece 2 • Interdimensional Portal Crisis & Alloy Industrialization',
    taglineEs: 'Masterpiece 2 • Portal Interdimensional e Industrialización Pesada',
    partner: 'Sky Mavis / Axie Infinity (Ronin)',
    prizeSymbol: '$AXS',
    poolFactor: '80%',
    startDate: '2025-10-15T13:00:00Z',
    endDate: '2025-11-15T13:00:00Z',
    status: 'concluded',
    levelRequirement: 8,
    prizePoolSummary: '80% Pool Factor in $AXS + $RON Leaderboard + Axie Collab Avatars + Dyno Eggs',
    prizePoolSummaryEs: 'Factor del 80% en $AXS + Leaderboard en $RON + Avatares Axie + Huevos de Dyno',
    description:
      'Historic crossover event on Ronin Network where an interdimensional rift opened between Lunacia and the Dynoverse. Players pooled advanced industrial alloys to build Masterpiece 2, stabilize the cosmic portal, and compete for massive AXS pools.',
    descriptionEs:
      'Crossover histórico en Ronin Network donde una grieta interdimensional se abrió entre Lunacia y el Dynoverso. Los jugadores unieron fuerzas produciendo aleaciones industriales avanzadas para construir Masterpiece 2, estabilizar el portal y competir por pozos masivos de AXS.',
    mechanics: [
      {
        title: 'Dimensional Portal Rift',
        titleEs: 'Grieta del Portal Dimensional',
        description:
          'Lore event setting where materials were funneled into building specialized pylons to safely bridge the Lunacia and Craft World ecosystems.',
        descriptionEs:
          'Evento narrativo donde los materiales se destinaron a levantar pilares energéticos para tender un puente seguro entre los ecosistemas de Lunacia y Craft World.',
      },
      {
        title: '80% $AXS Pool Redistribution',
        titleEs: '80% de Factor de Retorno en $AXS',
        description:
          'Record-setting 80% pool factor returning vast prize reserves of Axie Infinity Shards ($AXS) and $RON to top resource contributors.',
        descriptionEs:
          'Récord de factor de retorno del 80% destinando grandes reservas de Axie Infinity Shards ($AXS) y $RON a los mayores donantes de recursos.',
      },
      {
        title: 'Advanced Heavy Alloys Priority',
        titleEs: 'Prioridad de Aleaciones Industriales',
        description:
          'Heavy industrial production loops (Steel, Screws, Cement, Energy, and Bolts) received elevated milestone scoring towards the leaderboard.',
        descriptionEs:
          'Líneas de producción pesada (Acero, Tornillos, Cemento, Energía y Pernos) recibieron puntajes de hitos multiplicados en el leaderboard.',
      },
    ],
    recipes: [
      {
        symbol: 'STEEL',
        name: 'Structural Steel Foundries',
        nameEs: 'Fundición de Acero Estructural',
        duration: '1.2 min',
        outputAmount: 1,
        outputToken: 'STEEL',
        inputs: [
          { token: 'IRON', amount: 12 },
          { token: 'COAL', amount: 8 },
        ],
      },
      {
        symbol: 'SCREWS',
        name: 'Precision Screw Lathe',
        nameEs: 'Tornería de Tornillos de Precisión',
        duration: '2.5 min',
        outputAmount: 4,
        outputToken: 'SCREWS',
        inputs: [{ token: 'STEEL', amount: 2 }],
      },
      {
        symbol: 'CEMENT',
        name: 'High-Density Cement Kiln',
        nameEs: 'Horno de Cemento de Alta Resistencia',
        duration: '5 min',
        outputAmount: 2,
        outputToken: 'CEMENT',
        inputs: [
          { token: 'LIMESTONE', amount: 15 },
          { token: 'CLAY', amount: 8 },
        ],
      },
      {
        symbol: 'BOLTS',
        name: 'Hardened Anchor Bolts',
        nameEs: 'Pernos de Anclaje Reforzados',
        duration: '4 min',
        outputAmount: 6,
        outputToken: 'BOLTS',
        inputs: [{ token: 'STEEL', amount: 3 }],
      },
    ],
    rewardsTiers: [
      {
        tier: 'Top 1 - 20 (Lunacia Saviors)',
        tierEs: 'Top 1 - 20 (Salvadores de Lunacia)',
        description: 'Elite $AXS & $RON prize allocation + Genesis Mystic Dyno Egg + Axie Collab Avatar',
        descriptionEs: 'Asignación élite en $AXS y $RON + Huevo de Dyno Místico Génesis + Avatar Axie de Edición Limitada',
      },
      {
        tier: 'Top 21 - 150 (Portal Builders)',
        tierEs: 'Top 21 - 150 (Constructores del Portal)',
        description: 'Weighted $AXS Prize Share + $RON reward bundle + Masterpiece 2 Builder Badge',
        descriptionEs: 'Cuota ponderada en $AXS + Paquete de recompensa en $RON + Insignia Constructores de Masterpiece 2',
      },
      {
        tier: 'Top 151 - 1000 (Expedition Vanguard)',
        tierEs: 'Top 151 - 1000 (Vanguardia de Expedición)',
        description: 'DynoCoins treasury vault + Portal commemorative banner decoration',
        descriptionEs: 'Bóveda del tesoro en DynoCoins + Decoración conmemorativa del portal para la ciudad',
      },
    ],
    guideSteps: [
      {
        step: 1,
        title: 'Reach Town Hall Level 8',
        titleEs: 'Alcanza Nivel de Ayuntamiento 8',
        description: 'Qualify for interdimensional portal shipments by elevating civic infrastructure to Level 8.',
        descriptionEs: 'Califica para los envíos del portal interdimensional elevando la infraestructura cívica al Nivel 8.',
      },
      {
        step: 2,
        title: 'Manufacture Heavy Structural Alloys',
        titleEs: 'Fabrica Aleaciones Estructurales Pesadas',
        description: 'Prioritize production of Steel, Bolts, Precision Screws, and High-Density Cement.',
        descriptionEs: 'Prioriza la producción de Acero, Pernos, Tornillos de Precisión y Cemento de Alta Resistencia.',
      },
      {
        step: 3,
        title: 'Contribute to Masterpiece 2 Pylons',
        titleEs: 'Contribuye a los Pilares de Masterpiece 2',
        description: 'Deposit finished industrial components into the community stabilization rift to earn leaderboard points.',
        descriptionEs: 'Deposita componentes industriales terminados en la grieta de estabilización para acumular puntos.',
      },
      {
        step: 4,
        title: 'Claim 80% $AXS Pool Allocations',
        titleEs: 'Reclama Asignaciones del Pozo de 80% $AXS',
        description: 'Top contributors received weighted allocations from the 80% $AXS vault plus exclusive Axie avatars.',
        descriptionEs: 'Los mejores contribuyentes recibieron cuotas ponderadas de la bóveda del 80% en $AXS más avatares exclusivos.',
      },
    ],
    faqs: [
      {
        question: 'Why was the pool factor 80% for Axie Crossover?',
        questionEs: '¿Por qué el factor de retorno fue del 80% en el crossover de Axie?',
        answer: 'Sky Mavis and Angry Dynomites Lab subsidized an unprecedented 80% redistribution rate in $AXS and $RON.',
        answerEs: 'Sky Mavis y Angry Dynomites Lab subsidiaron una tasa récord de redistribución del 80% en tokens $AXS y $RON.',
      },
      {
        question: 'Were Axie NFTs required to participate?',
        questionEs: '¿Se requerían NFTs de Axie para participar?',
        answer: 'No, participation was open to all Craft World players reaching Town Hall 8, though Axie holders received cosmetic recognition.',
        answerEs: 'No, la participación estuvo abierta a todos los jugadores con Ayuntamiento 8, aunque los holders de Axie recibieron insignias cosméticas.',
      },
    ],
  },
  {
    id: 'ronke-moku',
    catalogId: 'event-ronke-moku',
    number: 1,
    title: 'Craft World Meets Ronke ft. Moku & Kanstar',
    titleEs: 'Craft World Meets Ronke ft. Moku & Kanstar',
    tagline: 'Masterpiece 1 • Agricultural Revolution & Fertilizer Ecosystem',
    taglineEs: 'Masterpiece 1 • Revolución Agrícola y Ecosistema de Fertilizantes',
    partner: 'Ronke, Moku & Kanstar (Ronin Network)',
    prizeSymbol: '$RICE',
    poolFactor: '69%',
    startDate: '2025-09-03T15:00:00Z',
    endDate: '2025-09-28T15:00:00Z',
    status: 'concluded',
    levelRequirement: 5,
    prizePoolSummary: '69% Dynamic Pool in $RICE + $RON + Dyno NFT Hatching Eggs + Moku Frames',
    prizePoolSummaryEs: '69% Pozo Dinámico en $RICE + $RON + Huevos NFT de Dyno + Marcos Moku',
    description:
      'The inaugural collaborative Masterpiece event on Ronin Network. Players joined forces with Ronke (the blue ape), Moku (tanuki spirit), and Kanstar validators to introduce agricultural fertilizer cycles, boosting land plots and harvesting the legendary $RICE crop.',
    descriptionEs:
      'El evento inaugural de Masterpiece en Ronin Network. Los jugadores se aliaron con Ronke (el simio azul del Ronkeverse), Moku (espíritu tanuki) y los validadores de Kanstar para introducir ciclos agrícolas de fertilizantes, potenciar parcelas de tierra y cosechar la mítica semilla de $RICE.',
    mechanics: [
      {
        title: '$RICE to Fertilizer Farming Cycle',
        titleEs: 'Ciclo de Fertilizantes con $RICE',
        description:
          'Players deposited $RICE to manufacture high-potency Fertilizer, multiplying soil yields and drastically speeding up crop maturation on plots.',
        descriptionEs:
          'Los jugadores depositaban $RICE para fabricar fertilizantes de alta potencia, multiplicando el rendimiento del suelo y acelerando cosechas.',
      },
      {
        title: '69% Dynamic $RICE Pool Factor',
        titleEs: 'Factor de Pozo Dinámico del 69%',
        description:
          '69% of all $RICE used in soil enrichment and event workshops was directed back into the competition treasury pool for active players.',
        descriptionEs:
          'El 69% de todo el $RICE utilizado en enriquecimiento del suelo y talleres del evento volvía a la bolsa de premios para los jugadores activos.',
      },
      {
        title: 'NFT Ecosystem Boosts',
        titleEs: 'Bonificaciones por NFTs Ronin',
        description:
          'Holders of Ronke, Moku and Kanstar NFTs enjoyed passive plot production speed multipliers throughout the duration of the event.',
        descriptionEs:
          'Los propietarios de NFTs de Ronke, Moku y Kanstar obtuvieron multiplicadores pasivos de velocidad en sus parcelas durante todo el evento.',
      },
    ],
    recipes: [
      {
        symbol: 'FERTILIZER',
        name: 'Organic Fertilizer Composter',
        nameEs: 'Compostera de Fertilizante Orgánico',
        duration: '30s',
        outputAmount: 5,
        outputToken: 'FERTILIZER',
        inputs: [
          { token: 'MUD', amount: 10 },
          { token: 'WATER', amount: 5 },
        ],
      },
      {
        symbol: 'GRAIN',
        name: 'Enriched Grain Field',
        nameEs: 'Campo de Granos Enriquecido',
        duration: '1 min',
        outputAmount: 15,
        outputToken: 'GRAIN',
        inputs: [{ token: 'FERTILIZER', amount: 2 }],
      },
      {
        symbol: 'VEGETABLES',
        name: 'Agricultural Hydroponic Patch',
        nameEs: 'Cultivo Hidropónico de Vegetales',
        duration: '2 min',
        outputAmount: 8,
        outputToken: 'VEGETABLES',
        inputs: [
          { token: 'GRAIN', amount: 6 },
          { token: 'WATER', amount: 10 },
        ],
      },
    ],
    rewardsTiers: [
      {
        tier: 'Top 1 - 15 (Grand Agronomists)',
        tierEs: 'Top 1 - 15 (Grandes Agrónomos)',
        description: 'Rare Genesis Dyno Egg NFT + Top share of $RICE dynamic pool + Moku Gold Avatar Frame',
        descriptionEs: 'Huevo NFT Génesis Raro + Cuota principal del pozo en $RICE + Marco de Avatar Moku Dorado',
      },
      {
        tier: 'Top 16 - 100 (Field Overseers)',
        tierEs: 'Top 16 - 100 (Supervisores de Campo)',
        description: 'Weighted $RICE Pool Reward + $RON prize + Masterpiece 1 Contributor Trophy',
        descriptionEs: 'Recompensa ponderada en $RICE + Premio en $RON + Trofeo de Contribuyente de Masterpiece 1',
      },
      {
        tier: 'Top 101 - 500 (Harvest Militia)',
        tierEs: 'Top 101 - 500 (Milicia de Cosecha)',
        description: 'DynoCoins treasury packet + In-game commemorative rice sack decoration',
        descriptionEs: 'Paquete de tesoro en DynoCoins + Decoración conmemorativa de saco de arroz para la ciudad',
      },
    ],
    guideSteps: [
      {
        step: 1,
        title: 'Unlock Mud & Water Farming Plots',
        titleEs: 'Desbloquea Parcelas de Barro y Agua',
        description: 'Achieve Town Hall level 5 to expand cultivation territory and build Composter facilities.',
        descriptionEs: 'Alcanza el nivel 5 de Ayuntamiento para expandir territorio de cultivo y construir Composteras.',
      },
      {
        step: 2,
        title: 'Synthesize $RICE Fertilizer',
        titleEs: 'Sintetiza Fertilizante con $RICE',
        description: 'Convert deposited $RICE into organic Fertilizer to accelerate crop growth cycles.',
        descriptionEs: 'Convierte $RICE depositado en Fertilizante orgánico para acelerar los ciclos de cultivo.',
      },
      {
        step: 3,
        title: 'Harvest Enriched Grain & Vegetables',
        titleEs: 'Cosecha Granos Enriquecidos y Vegetales',
        description: 'Supply food rations to the Masterpiece 1 site to rank up in the community leaderboard.',
        descriptionEs: 'Suministra raciones de comida al sitio de Masterpiece 1 para escalar en el ranking.',
      },
    ],
    faqs: [
      {
        question: 'Who are Ronke, Moku and Kanstar?',
        questionEs: '¿Quiénes son Ronke, Moku y Kanstar?',
        answer: 'They are pioneering community and validator collections on Ronin Network that partnered for the inaugural Masterpiece event.',
        answerEs: 'Son colecciones comunitarias y de validadores pioneras de Ronin Network que se aliaron para el primer evento Masterpiece.',
      },
      {
        question: 'How did Ronke NFT holders benefit?',
        questionEs: '¿Cómo se beneficiaron los poseedores de NFTs de Ronke?',
        answer: 'Holders verified in Discord received passive plot production speed multipliers throughout the event window.',
        answerEs: 'Los holders verificados en Discord recibieron multiplicadores pasivos de velocidad de producción en parcelas durante el evento.',
      },
    ],
  },
];

export function getEventByCatalogId(catalogId: string): OfficialEvent | undefined {
  return OFFICIAL_EVENTS.find((e) => e.catalogId === catalogId);
}

export function getEventById(id: string): OfficialEvent | undefined {
  return OFFICIAL_EVENTS.find((e) => e.id === id);
}
