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
  CrownBoldDuotone,
  CrownLinear,
  TuningBoldDuotone,
  TuningLinear,
  BatteryChargeBoldDuotone,
  BatteryChargeLinear,
  CalculatorBoldDuotone,
  CalculatorLinear,
  SettingsBoldDuotone,
  SettingsLinear,
} from 'solar-icon-set';

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/home',
    labelEn: 'Home',
    labelEs: 'Inicio',
    icon: (active: boolean) =>
      active ? <Home2BoldDuotone size={24} className="w-6 h-6 text-emerald-400" /> : <Home2Linear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/empire-dashboard',
    labelEn: 'Empire',
    labelEs: 'Imperio',
    icon: (active: boolean) =>
      active ? <Buildings2BoldDuotone size={24} className="w-6 h-6 text-purple-400" /> : <Buildings2Linear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/resource-planner',
    labelEn: 'Planner',
    labelEs: 'Plan',
    icon: (active: boolean) =>
      active ? <ChecklistBoldDuotone size={24} className="w-6 h-6 text-sky-400" /> : <ChecklistLinear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/profitability',
    labelEn: 'Profit',
    labelEs: 'Ganancia',
    icon: (active: boolean) =>
      active ? <Chart2BoldDuotone size={24} className="w-6 h-6 text-emerald-400" /> : <Chart2Linear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/inventory-value',
    labelEn: 'Inventory',
    labelEs: 'Inventario',
    icon: (active: boolean) =>
      active ? <ArchiveBoldDuotone size={24} className="w-6 h-6 text-amber-400" /> : <ArchiveLinear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/upgrade-advisor',
    labelEn: 'Upgrades',
    labelEs: 'Mejoras',
    icon: (active: boolean) =>
      active ? <BoltBoldDuotone size={24} className="w-6 h-6 text-yellow-400" /> : <BoltLinear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/upgrade-simulator',
    labelEn: 'Upgrade Sim',
    labelEs: 'Mejoras Sim',
    icon: (active: boolean) =>
      active ? <TuningBoldDuotone size={24} className="w-6 h-6 text-amber-400" /> : <TuningLinear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/power-simulator',
    labelEn: 'Power Sim',
    labelEs: 'Poder Sim',
    icon: (active: boolean) =>
      active ? <BatteryChargeBoldDuotone size={24} className="w-6 h-6 text-cyan-400" /> : <BatteryChargeLinear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/base-cost',
    labelEn: 'Base Cost',
    labelEs: 'Costo Base',
    icon: (active: boolean) =>
      active ? <CalculatorBoldDuotone size={24} className="w-6 h-6 text-emerald-400" /> : <CalculatorLinear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/encyclopedia',
    labelEn: 'Encyclopedia',
    labelEs: 'Enciclopedia',
    icon: (active: boolean) =>
      active ? <Book2BoldDuotone size={24} className="w-6 h-6 text-indigo-400" /> : <Book2Linear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/masterpiece',
    labelEn: 'Masterpiece',
    labelEs: 'Masterpiece',
    icon: (active: boolean) =>
      active ? <CrownBoldDuotone size={24} className="w-6 h-6 text-amber-400" /> : <CrownLinear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/compare',
    labelEn: 'Compare',
    labelEs: 'Comparar',
    icon: (active: boolean) =>
      active ? <ScaleBoldDuotone size={24} className="w-6 h-6 text-pink-400" /> : <ScaleLinear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/timers',
    labelEn: 'Timers',
    labelEs: 'Tiempos',
    icon: (active: boolean) =>
      active ? <StopwatchBoldDuotone size={24} className="w-6 h-6 text-rose-400" /> : <StopwatchLinear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/matrix',
    labelEn: 'Matrix',
    labelEs: 'Matriz',
    icon: (active: boolean) =>
      active ? <Widget2BoldDuotone size={24} className="w-6 h-6 text-teal-400" /> : <Widget2Linear size={24} className="w-6 h-6 text-slate-300" />,
  },
  {
    path: '/settings',
    labelEn: 'Settings',
    labelEs: 'Ajustes',
    icon: (active: boolean) =>
      active ? <SettingsBoldDuotone size={24} className="w-6 h-6 text-slate-300" /> : <SettingsLinear size={24} className="w-6 h-6 text-slate-400" />,
  },
];
