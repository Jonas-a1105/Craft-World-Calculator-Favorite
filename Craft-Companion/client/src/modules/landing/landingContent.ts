import type { LandingTranslations } from './types';

export const LANDING_CONTENT: Record<'es' | 'en', LandingTranslations> = {
  en: {
    brandName: 'Craft Companion',
    nav: {
      features: 'Features',
      impact: 'Community',
      platform: 'Features',
      talentPool: 'Community',
      caseStudies: 'Analytics',
      pricing: 'Pricing',
      faq: 'FAQ',
      scheduleDemo: 'Launch Companion',
      startFree: 'Start Free',
    },
    hero: {
      badge: 'Analytical Suite & Calculator for CraftWorld',
      headline: 'Master production cycles,\nmaximize your profits',
      subtitle:
        'Accurately calculate net profits per hour, optimize multi-tier crafting value chains, monitor factory timers, and make profitable upgrade decisions with exact game formulas.',
      primaryCta: 'Open Tools Free',
      secondaryCta: 'Explore Features',
      trustedBy: 'Trusted by 2,500+ CraftWorld industrial players',
    },
    suite: {
      badge: 'Industrial Suite',
      titleLine1: 'The economic command center',
      titleLine2: 'for your CraftWorld empire',
      tabs: ['Profitability Calculator', 'Resource Planner', 'Value Chains', 'Factory Timers', 'Upgrade Advisor'],
      card1: {
        num: '1',
        title: 'Cycle & Profitability Calculator',
        desc: 'Simulate precise net profit per hour incorporating factory level (1-50), worker reduction factors, active boosters, and current market input prices.',
        item1Title: 'Optimal Margin',
        item1Time: 'Cycle: 12m',
        item2Title: 'Active Production',
        item2Time: '+45,200 Gold/h',
      },
      card2: {
        num: '2',
        title: 'Empire & Plot Sync',
        desc: 'Connect your CraftWorld account to monitor land plots, assign workers, track active factories, and view real-time inventory valuations.',
        stat1Label: 'Active Plots',
        stat1Value: '12',
        stat2Label: 'Running Factories',
        stat2Value: '48',
        tableName: 'synced_inventory',
        verifiedBadge: 'Live Sync',
      },
      card3: {
        num: '3',
        title: 'Market & Value Chains',
        desc: 'Visualize historical price trends, identify undervalued raw commodities, solve recipe trees bottom-up, and export your simulations.',
        filterRegion: 'All Commodities',
        filterTime: '24h History',
        exportButton: 'Export Simulation',
      },
    },
    pricing: {
      badge: 'Transparent',
      title: 'Plans Designed for Every Producer',
      subtitle:
        'Start 100% free with Guest Mode and scale whenever you want automated live account sync and advanced advisor metrics.',
      billing: {
        annually: 'Annually',
        monthly: 'Monthly',
        discount: '-20%',
      },
      plans: {
        hobby: {
          name: 'Explorer (Free)',
          price: '$0',
          description:
            'Perfect for new and casual players looking to check live market prices and calculate single-factory profitability.',
          featuresTitle: 'Core Tools',
          features: [
            'Basic Cycle & Profitability Calculator',
            'Full Encyclopedia of 50+ factory levels',
            'Live Market Prices and historical trends',
            'Guest Mode with no registration required',
            'Access to community Discord guides',
          ],
          cta: 'Start for Free',
        },
        growth: {
          name: 'Industrial Pro',
          badge: 'Most Popular',
          popular: true,
          price: '$4.99',
          period: '/month',
          description:
            'Built for active industrialists who want automated game account sync, cycle timers, and mathematical upgrade advice.',
          featuresTitle: "What's Included",
          features: [
            'Everything in Explorer',
            'Live OAuth sync with CraftWorld account',
            'Real-time factory cycle timers & notifications',
            'Upgrade Advisor with payback period & ROI ranking',
            'Reverse recipe tree and deficit cost planner',
            'Automated inventory valuation at spot prices',
          ],
          cta: 'Upgrade to Pro',
        },
        scale: {
          name: 'Guild Master',
          price: '$14.99',
          period: '/month',
          description:
            'Advanced multi-plot management, complex value chain simulations, and priority tooling for guild leaders.',
          featuresTitle: "What's Included",
          features: [
            'Everything in Industrial Pro',
            'Multi-plot & guild production management',
            'Unlimited scenario simulation exports (CSV/JSON)',
            'Price alert notifications on market swings',
            'Direct developer support & feature requests',
            'Early access to new game patch calculators',
          ],
          cta: 'Unlock Guild Access',
        },
      },
    },
    impact: {
      badge: 'Community',
      title: 'Trusted by Elite CraftWorld Players',
      subtitle:
        'Discover how active producers optimize their daily cycles and save millions of gold with exact mathematical formulas.',
      ratingBadge: {
        score: '4.9',
        basedOn: 'Based on 1.2k player reviews',
      },
      metrics: [
        { icon: 'bolt', value: '50+', label: 'Levels Modelled per Factory' },
        { icon: 'trend', value: '+35%', label: 'Average Margin Gain' },
        { icon: 'users', value: '2.5K+', label: 'Active Industrialists' },
        { icon: 'star', value: '100%', label: 'Game Formula Accuracy' },
      ],
      testimonialsRow1: [
        {
          id: '1',
          name: 'Kaelen Vance',
          role: 'Guild Master - Obsidian Forge',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'Managing 12 plots without Craft Companion was impossible. The upgrade advisor prioritized exactly which mines gave ROI in under 48 hours.',
          stars: 5,
        },
        {
          id: '2',
          name: 'Marcus Sterling',
          role: 'Commodity Trader - Iron Delta',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'The value chain planner showed me that refining intermediate goods yielded 40% more profit than selling raw ore on the spot market.',
          stars: 5,
        },
        {
          id: '3',
          name: 'Elena Rostova',
          role: 'Factory Architect - Titan Works',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'The worker reduction math and ad-boost compounding are 100% accurate with the game engine. An indispensable daily companion.',
          stars: 5,
        },
        {
          id: '4',
          name: 'Darius Thorne',
          role: 'Economic Strategist - Apex Realm',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'No guesswork. The inventory valuation tells me our total net worth in one glance whenever market prices shift.',
          stars: 5,
        },
      ],
      testimonialsRow2: [
        {
          id: '5',
          name: 'Aria Chen',
          role: 'Solo Industrialist - Gold Coast',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'Even in Guest Mode with zero setup, the cycle timers and encyclopedia helped me scale from a small workshop to full industrialization.',
          stars: 5,
        },
        {
          id: '6',
          name: 'Viktor Soren',
          role: 'Production Planner - North Star Guild',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'The reverse crafting tree calculates exactly what raw materials we are missing to hit our weekly guild production quotas.',
          stars: 5,
        },
        {
          id: '7',
          name: 'Sarah Miller',
          role: 'Market Analyst - Free Traders',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'Clean UI, dark mode styling, and instant calculations. Hands down the best companion app built for CraftWorld.',
          stars: 5,
        },
        {
          id: '8',
          name: 'Lucas Dupont',
          role: 'Dynasty Overseer - Sunspire',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'The audio notifications and timers keep my factories producing without idle downtime between shifts.',
          stars: 5,
        },
      ],
    },
    faq: {
      badge: 'Clarity',
      title: 'Frequently Asked Questions',
      subtitle:
        'Find straightforward answers about game account linking, exact economic formulas, and data security.',
      contact: {
        location: 'Global CraftWorld Community',
        phone: 'Discord: discord.gg/craftworld',
        email: 'support@craftcompanion.app',
      },
      questions: [
        {
          id: '1',
          question: 'Do I need to link my CraftWorld account to use the calculators?',
          answer:
            'No. You can freely use all calculators, the full encyclopedia, and market tables in Guest Mode. Linking your account via official OAuth allows automatic synchronization of your plots, factory levels, and workers.',
        },
        {
          id: '2',
          question: 'How are production costs and hourly profit calculated?',
          answer:
            'Our engine matches the exact CraftWorld game formulas: base cycle time, factory level multiplier (levels 1 to 50), mastery modifiers, workshop boosts, active ad-boosts, and worker cycle reduction factors.',
        },
        {
          id: '3',
          question: 'Are market prices updated dynamically?',
          answer:
            'Yes. Craft Companion tracks live transactions and order books to provide real-time spot prices, historical variation charts, and realistic valuation of your raw materials and stored products.',
        },
        {
          id: '4',
          question: 'Is it safe to authenticate with my CraftWorld account?',
          answer:
            'Absolutely. We utilize official OAuth authentication. We never request, see, or store your passwords, private keys, or wallet seed phrases. You can revoke access at any time.',
        },
        {
          id: '5',
          question: 'What is the Upgrade Advisor and how does it calculate ROI?',
          answer:
            'The Upgrade Advisor compares the gold cost of upgrading each owned factory against the additional net profit per day generated by the new level. It sorts recommendations by fastest payback period so you reinvest with maximum efficiency.',
        },
      ],
    },
    footer: {
      brandInitial: 'C',
      brandName: 'Craft Companion',
      headline: 'Master the economy, optimize your factories, and lead CraftWorld.',
      ctaButton: 'Launch Companion',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Community', href: '#impact' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
      copyright: '© 2026 Craft Companion. All rights reserved. Unofficial community companion.',
    },
    cookies: {
      title: 'Privacy Preferences Center',
      subtitle:
        'Customize your cookie settings below. Essential technical cookies are required for session and authentication security.',
      strictlyNecessary: {
        id: 'strictly_necessary',
        tabLabel: 'Strictly Necess...',
        title: 'Strictly Necessary',
        badge: 'Always Active',
        isAlwaysActive: true,
        description:
          'These cookies and local storage tokens are required for core security, session authentication, and theme preferences. They cannot be disabled.',
      },
      performance: {
        id: 'performance',
        tabLabel: 'Performance',
        title: 'Performance & Cache',
        description:
          'Allows client-side memory caching of market prices and recipe calculations to ensure instant interface responses.',
      },
      targeting: {
        id: 'targeting',
        tabLabel: 'Analytics',
        title: 'Anonymous Analytics',
        description:
          'Helps us understand which tool views are most frequently used to prioritize future game patches and formula updates.',
      },
      savePreferences: 'Save Preferences',
      acceptAll: 'Accept All Cookies',
    },
  },
  es: {
    brandName: 'Craft Companion',
    nav: {
      features: 'Herramientas',
      impact: 'Comunidad',
      platform: 'Herramientas',
      talentPool: 'Comunidad',
      caseStudies: 'Analítica',
      pricing: 'Precios',
      faq: 'FAQ',
      scheduleDemo: 'Abrir Companion',
      startFree: 'Empezar Gratis',
    },
    hero: {
      badge: 'Suite Analítica y Calculadora de Economía para CraftWorld',
      headline: 'Domina tus ciclos de producción,\nmaximiza tus beneficios',
      subtitle:
        'Calcula con exactitud márgenes netos por hora, optimiza cadenas de valor complejas, monitorea temporizadores de fábricas y toma las mejores decisiones de mejora con fórmulas idénticas al juego.',
      primaryCta: 'Abrir Herramientas Gratis',
      secondaryCta: 'Ver Características',
      trustedBy: 'Con la confianza de +2,500 productores de CraftWorld',
    },
    suite: {
      badge: 'Suite Industrial',
      titleLine1: 'El centro de mando económico',
      titleLine2: 'para tu imperio en CraftWorld',
      tabs: ['Calculadora de Rentabilidad', 'Planificador de Recursos', 'Cadenas de Valor', 'Temporizadores de Fábricas', 'Asesor de Mejoras'],
      card1: {
        num: '1',
        title: 'Calculadora de Ciclos y Márgenes',
        desc: 'Simula el beneficio neto por hora incorporando el nivel exacto de la fábrica (1-50), trabajadores asignados, boosters activos y precio de insumos de mercado.',
        item1Title: 'Margen Óptimo',
        item1Time: 'Ciclo: 12m',
        item2Title: 'Producción Activa',
        item2Time: '+45,200 Oro/h',
      },
      card2: {
        num: '2',
        title: 'Sincronización de Parcelas',
        desc: 'Conecta tu cuenta de CraftWorld para visualizar todas tus parcelas, fábricas en marcha, trabajadores activos y la valoración de tu almacén en tiempo real.',
        stat1Label: 'Parcelas Activas',
        stat1Value: '12',
        stat2Label: 'Fábricas en Marcha',
        stat2Value: '48',
        tableName: 'inventario_sincronizado',
        verifiedBadge: 'En Vivo',
      },
      card3: {
        num: '3',
        title: 'Mercado y Cadenas de Valor',
        desc: 'Visualiza la evolución de precios históricos, identifica materias primas infravaloradas, resuelve árboles de recetas y exporta tus simulaciones.',
        filterRegion: 'Todos los recursos',
        filterTime: 'Histórico 24h',
        exportButton: 'Exportar Simulación',
      },
    },
    pricing: {
      badge: 'Transparente',
      title: 'Planes Diseñados para Cada Productor',
      subtitle:
        'Empieza 100% gratis con el Modo Invitado y escala cuando quieras sincronización automática de parcelas y asesoramiento avanzado.',
      billing: {
        annually: 'Anual',
        monthly: 'Mensual',
        discount: '-20%',
      },
      plans: {
        hobby: {
          name: 'Explorador (Gratis)',
          price: '$0',
          description:
            'Perfecto para jugadores nuevos y casuales que quieren consultar precios y calcular la rentabilidad de sus primeras fábricas.',
          featuresTitle: 'Herramientas Principales',
          features: [
            'Calculadora básica de rentabilidad por ciclo',
            'Enciclopedia completa de +50 niveles de fábricas',
            'Precios de mercado en tiempo real e históricos',
            'Modo invitado sin necesidad de registro previo',
            'Acceso a guías de la comunidad en Discord',
          ],
          cta: 'Empezar Gratis',
        },
        growth: {
          name: 'Industrial Pro',
          badge: 'Más Popular',
          popular: true,
          price: '$4.99',
          period: '/mes',
          description:
            'Diseñado para productores activos que buscan sincronización OAuth con el juego, temporizadores y optimización matemática de mejoras.',
          featuresTitle: 'Qué Incluye',
          features: [
            'Todo lo de Explorador',
            'Sincronización OAuth en vivo con tu cuenta de CraftWorld',
            'Temporizadores de producción con alertas acústicas',
            'Asesor de Mejoras con clasificación por ROI y Payback',
            'Planificador de árbol inverso y costes de déficit',
            'Valoración automática del inventario a precio de mercado',
          ],
          cta: 'Mejorar a Pro',
        },
        scale: {
          name: 'Guild Master',
          price: '$14.99',
          period: '/mes',
          description:
            'Gestión multi-parcela avanzada, simulador de cadenas de producción complejas y soporte prioritario para líderes de gremio.',
          featuresTitle: 'Qué Incluye',
          features: [
            'Todo lo de Industrial Pro',
            'Gestión avanzada de múltiples parcelas y gremios',
            'Exportación ilimitada de simulaciones (CSV/JSON)',
            'Alertas de variaciones bruscas de mercado',
            'Soporte directo prioritario con el equipo desarrollador',
            'Acceso anticipado a calculadoras de nuevos parches',
          ],
          cta: 'Acceso Guild',
        },
      },
    },
    impact: {
      badge: 'Comunidad',
      title: 'La Herramienta Preferida por los Industriales',
      subtitle:
        'Descubre cómo los productores más competitivos ahorran millones de oro y optimizan sus ciclos con fórmulas exactas.',
      ratingBadge: {
        score: '4.9',
        basedOn: 'Basado en +1,200 valoraciones',
      },
      metrics: [
        { icon: 'bolt', value: '+50', label: 'Niveles Modelados por Fábrica' },
        { icon: 'trend', value: '+35%', label: 'Aumento de Margen Diario' },
        { icon: 'users', value: '+2,500', label: 'Jugadores Activos' },
        { icon: 'star', value: '100%', label: 'Fórmulas Exactas del Juego' },
      ],
      testimonialsRow1: [
        {
          id: '1',
          name: 'Carlos Mendoza',
          role: 'Líder de Gremio - Obsidian Forge',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'Gestionar 12 parcelas sin Craft Companion era imposible. El asesor de mejoras me indicó exactamente qué minas daban retorno en menos de 48 horas.',
          stars: 5,
        },
        {
          id: '2',
          name: 'Marcos Herrera',
          role: 'Comerciante de Materias Primas',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'El planificador de cadenas de valor me demostró que refinar materiales intermedios generaba 40% más beneficio que vender la mena cruda.',
          stars: 5,
        },
        {
          id: '3',
          name: 'Elena Rostova',
          role: 'Arquitecta Industrial - Titan Works',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'El cálculo de reducción por trabajadores y la combinación de ad boosts es 100% idéntico al motor del juego. Indispensable a diario.',
          stars: 5,
        },
        {
          id: '4',
          name: 'Darío Toro',
          role: 'Estratega Económico - Apex Realm',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'Sin conjeturas. La valoración de inventario me dice el patrimonio neto exacto de mi almacén cada vez que los precios fluctúan.',
          stars: 5,
        },
      ],
      testimonialsRow2: [
        {
          id: '5',
          name: 'Sofía Martínez',
          role: 'Productora Independiente - Costa Dorada',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'Incluso en Modo Invitado sin configurar nada, los temporizadores y la enciclopedia me permitieron escalar de un taller a producción industrial.',
          stars: 5,
        },
        {
          id: '6',
          name: 'Víctor Solís',
          role: 'Planificador - North Star Guild',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'El árbol inverso calcula al instante qué insumos nos faltan para cumplir con las cuotas de fabricación del gremio cada semana.',
          stars: 5,
        },
        {
          id: '7',
          name: 'Lucía Benítez',
          role: 'Analista de Mercado - Comerciantes Libres',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'Diseño oscuro impecable, cálculos instantáneos y navegación fluida. Sin duda el mejor companion desarrollado para CraftWorld.',
          stars: 5,
        },
        {
          id: '8',
          name: 'Javier Navarro',
          role: 'Supervisor de Dinastía - Sunspire',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop&crop=faces&q=80',
          quote:
            'Las notificaciones acústicas y los temporizadores evitan que las fábricas queden inactivas entre turnos de juego.',
          stars: 5,
        },
      ],
    },
    faq: {
      badge: 'Claridad',
      title: 'Preguntas Frecuentes',
      subtitle:
        'Respuestas transparentes sobre la vinculación de cuentas, fórmulas económicas y seguridad de tus datos.',
      contact: {
        location: 'Comunidad Global CraftWorld',
        phone: 'Discord: discord.gg/craftworld',
        email: 'support@craftcompanion.app',
      },
      questions: [
        {
          id: '1',
          question: '¿Necesito vincular mi cuenta de CraftWorld para usar las calculadoras?',
          answer:
            'No. Puedes usar libremente todas las calculadoras, la enciclopedia y las tablas de precios en Modo Invitado. Al conectar tu cuenta mediante OAuth oficial, se sincronizarán tus parcelas, niveles de fábricas y trabajadores en tiempo real.',
        },
        {
          id: '2',
          question: '¿Cómo se calculan los costes y la rentabilidad por hora?',
          answer:
            'Nuestro motor aplica las fórmulas exactas del juego: duración base del ciclo, multiplicador por nivel de fábrica (del 1 al 50), modificadores de maestría, mejoras de taller, multiplicadores de anuncios y reducción por trabajadores asignados.',
        },
        {
          id: '3',
          question: '¿Los precios del mercado se actualizan dinámicamente?',
          answer:
            'Sí. Craft Companion rastrea transacciones recientes y el libro de órdenes para proporcionar precios de compra/venta actualizados, gráficos de histórico y valoración realista de tus reservas de almacén.',
        },
        {
          id: '4',
          question: '¿Es seguro iniciar sesión con mi cuenta de CraftWorld?',
          answer:
            'Totalmente seguro. Utilizamos el protocolo de autenticación OAuth oficial. Nunca solicitamos, leemos ni almacenamos tus contraseñas, llaves privadas ni frases de recuperación de billeteras. Puedes revocar el acceso en cualquier momento.',
        },
        {
          id: '5',
          question: '¿Qué es el Asesor de Mejoras y cómo calcula el ROI?',
          answer:
            'El Asesor de Mejoras compara el coste en oro de mejorar cada una de tus fábricas contra el beneficio neto diario adicional que generará el nuevo nivel. Clasifica las sugerencias por tiempo de retorno (payback) para que priorices las mejoras más rentables.',
        },
      ],
    },
    footer: {
      brandInitial: 'C',
      brandName: 'Craft Companion',
      headline: 'Domina la economía, optimiza tus fábricas y lidera CraftWorld.',
      ctaButton: 'Abrir Companion',
      links: [
        { label: 'Herramientas', href: '#features' },
        { label: 'Comunidad', href: '#impact' },
        { label: 'Precios', href: '#pricing' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Privacidad', href: '/privacy' },
        { label: 'Términos', href: '/terms' },
      ],
      copyright: '© 2026 Craft Companion. Todos los derechos reservados. Herramienta comunitaria no oficial.',
    },
    cookies: {
      title: 'Centro de Preferencias de Privacidad',
      subtitle:
        'Personaliza la configuración de cookies a continuación. Las cookies técnicas son obligatorias para la seguridad de sesión y autenticación.',
      strictlyNecessary: {
        id: 'strictly_necessary',
        tabLabel: 'Estrictamente nec...',
        title: 'Estrictamente necesarias',
        badge: 'Siempre activas',
        isAlwaysActive: true,
        description:
          'Estas cookies y tokens de almacenamiento local son necesarios para el funcionamiento esencial, sesión OAuth segura y preferencias de tema. No se pueden desactivar.',
      },
      performance: {
        id: 'performance',
        tabLabel: 'Rendimiento',
        title: 'Rendimiento y Caché',
        description:
          'Permiten el almacenamiento en memoria de precios de mercado y cálculos de recetas para ofrecer tiempos de respuesta ultrarrápidos.',
      },
      targeting: {
        id: 'targeting',
        tabLabel: 'Analítica',
        title: 'Analítica Anónima',
        description:
          'Nos ayuda a entender qué calculadoras son más utilizadas para priorizar mejoras de balance en futuros parches del juego.',
      },
      savePreferences: 'Guardar preferencias',
      acceptAll: 'Aceptar todas las cookies',
    },
  },
};
