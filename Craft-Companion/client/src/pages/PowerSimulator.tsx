import React from 'react';
import { PowerSimulatorDashboard } from '../modules/powerSimulator';

/**
 * Power Simulator Page
 * Dedicated module for simulating daily power production from passive plants
 * (Airstream, Sunforge) and Power Packs, calculating effective COIN cost per 100k Power,
 * and comparing power acquisition methods.
 */
export default function PowerSimulator() {
  return <PowerSimulatorDashboard />;
}
