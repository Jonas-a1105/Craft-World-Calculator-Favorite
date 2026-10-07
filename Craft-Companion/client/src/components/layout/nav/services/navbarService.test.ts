import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  formatWalletAddress,
  getWalletInitial,
  getWalletLabel,
  resolveUserDisplayName,
} from './navbarService';

test('formatWalletAddress truncates long ethereum addresses safely', () => {
  const address = '0x71C83638415Ba3567bC0c78F8cD0E28a8d11a89f';
  assert.equal(formatWalletAddress(address), '0x71C8...a89f');
  assert.equal(formatWalletAddress('0x1234'), '0x1234');
  assert.equal(formatWalletAddress(''), '');
  assert.equal(formatWalletAddress(undefined), '');
});

test('getWalletInitial returns S for smart account, third character for eoa, and W fallback', () => {
  assert.equal(getWalletInitial('Smart Account', '0x71C836'), 'S');
  assert.equal(getWalletInitial('smart wallet', '0x71C836'), 'S');
  assert.equal(getWalletInitial('EOA', '0x93B...'), '9');
  assert.equal(getWalletInitial(undefined, '0xAbc'), 'A');
  assert.equal(getWalletInitial(undefined, undefined), 'W');
});

test('getWalletLabel prioritizes primary tag, then type, then index fallback', () => {
  assert.equal(getWalletLabel({ primary: true }, 0, 'es'), 'Wallet Principal');
  assert.equal(getWalletLabel({ primary: true }, 0, 'en'), 'Primary Wallet');
  assert.equal(getWalletLabel({ primary: false, type: 'MetaMask' }, 1, 'es'), 'MetaMask');
  assert.equal(getWalletLabel({}, 2, 'es'), 'Wallet 3');
});

test('resolveUserDisplayName falls back appropriately', () => {
  assert.equal(resolveUserDisplayName('CaptainMiner', 'usr_1'), 'CaptainMiner');
  assert.equal(resolveUserDisplayName('', 'usr_1'), 'usr_1');
  assert.equal(resolveUserDisplayName(undefined, undefined), 'Player');
});
