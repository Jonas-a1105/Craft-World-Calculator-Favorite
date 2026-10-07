import React from 'react';
import type { NavItem } from './types';
import {
  Home2BoldDuotone,
  Home2Linear,
  Buildings2BoldDuotone,
  Buildings2Linear,
  ChecklistBoldDuotone,
  ChecklistLinear,
  Chart2BoldDuotone,
  Chart2Linear,
  ArchiveBoldDuotone,
  ArchiveLinear,
  BoltBoldDuotone,
  BoltLinear,
  Book2BoldDuotone,
  Book2Linear,
  ScaleBoldDuotone,
  ScaleLinear,
  StopwatchBoldDuotone,
  StopwatchLinear,
  Widget2BoldDuotone,
  Widget2Linear,
  SettingsBoldDuotone,
  SettingsLinear,
} from 'solar-icon-set';

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/home',
    labelEn: 'Home',
    labelEs: 'Inicio',
    icon: (active: boolean) =>
      active ? <Home2BoldDuotone size={20} className="w-5 h-5 text-emerald-400" /> : <Home2Linear size={20} className="w-5 h-5" />,
  },
  {
    path: '/empire-dashboard',
    labelEn: 'Empire',
    labelEs: 'Imperio',
    icon: (active: boolean) =>
      active ? <Buildings2BoldDuotone size={20} className="w-5 h-5 text-purple-400" /> : <Buildings2Linear size={20} className="w-5 h-5" />,
  },
  {
    path: '/resource-planner',
    labelEn: 'Planner',
    labelEs: 'Plan',
    icon: (active: boolean) =>
      active ? <ChecklistBoldDuotone size={20} className="w-5 h-5 text-sky-400" /> : <ChecklistLinear size={20} className="w-5 h-5" />,
  },
  {
    path: '/profitability',
    labelEn: 'Profit',
    labelEs: 'Ganancia',
    icon: (active: boolean) =>
      active ? <Chart2BoldDuotone size={20} className="w-5 h-5 text-emerald-400" /> : <Chart2Linear size={20} className="w-5 h-5" />,
  },
  {
    path: '/inventory-value',
    labelEn: 'Inventory',
    labelEs: 'Inventario',
    icon: (active: boolean) =>
      active ? <ArchiveBoldDuotone size={20} className="w-5 h-5 text-amber-400" /> : <ArchiveLinear size={20} className="w-5 h-5" />,
  },
  {
    path: '/upgrade-advisor',
    labelEn: 'Upgrades',
    labelEs: 'Mejoras',
    icon: (active: boolean) =>
      active ? <BoltBoldDuotone size={20} className="w-5 h-5 text-yellow-400" /> : <BoltLinear size={20} className="w-5 h-5" />,
  },
  {
    path: '/encyclopedia',
    labelEn: 'Encyclopedia',
    labelEs: 'Enciclopedia',
    icon: (active: boolean) =>
      active ? <Book2BoldDuotone size={20} className="w-5 h-5 text-indigo-400" /> : <Book2Linear size={20} className="w-5 h-5" />,
  },
  {
    path: '/compare',
    labelEn: 'Compare',
    labelEs: 'Comparar',
    icon: (active: boolean) =>
      active ? <ScaleBoldDuotone size={20} className="w-5 h-5 text-pink-400" /> : <ScaleLinear size={20} className="w-5 h-5" />,
  },
  {
    path: '/timers',
    labelEn: 'Timers',
    labelEs: 'Tiempos',
    icon: (active: boolean) =>
      active ? <StopwatchBoldDuotone size={20} className="w-5 h-5 text-rose-400" /> : <StopwatchLinear size={20} className="w-5 h-5" />,
  },
  {
    path: '/matrix',
    labelEn: 'Matrix',
    labelEs: 'Matriz',
    icon: (active: boolean) =>
      active ? <Widget2BoldDuotone size={20} className="w-5 h-5 text-teal-400" /> : <Widget2Linear size={20} className="w-5 h-5" />,
  },
  {
    path: '/settings',
    labelEn: 'Settings',
    labelEs: 'Ajustes',
    icon: (active: boolean) =>
      active ? <SettingsBoldDuotone size={20} className="w-5 h-5 text-slate-300" /> : <SettingsLinear size={20} className="w-5 h-5" />,
  },
];
