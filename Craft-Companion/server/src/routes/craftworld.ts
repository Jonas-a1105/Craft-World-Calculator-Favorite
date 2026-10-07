import { Router } from 'express';
import {
  getProfile,
  getCraftWorld,
  getMasterpieces,
  getCraft,
  getExchange,
  getOnchain,
  getInventory,
  getPurchases,
  getPriceList,
  getDynoCycle,
  getHome,
} from '../controllers/craftworld.controller.js';

export const craftworldRouter = Router();

craftworldRouter.get('/profile', getProfile);
craftworldRouter.get('/craft-world', getCraftWorld);
craftworldRouter.get('/masterpieces', getMasterpieces);
craftworldRouter.get('/craft', getCraft);
craftworldRouter.get('/exchange', getExchange);
craftworldRouter.get('/onchain', getOnchain);
craftworldRouter.get('/inventory', getInventory);
craftworldRouter.get('/purchases', getPurchases);
craftworldRouter.get('/price-list', getPriceList);
craftworldRouter.get('/dyno-cycle', getDynoCycle);
craftworldRouter.get('/home', getHome);
