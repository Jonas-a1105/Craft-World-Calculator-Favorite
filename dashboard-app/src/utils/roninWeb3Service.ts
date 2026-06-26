import { ethers } from 'ethers';
import juegoConfig from './juegoABI.json';
import { TOKENS } from './priceService';

const RONIN_RPC = 'https://api.roninchain.com/rpc';
const MULTICALL3_ADDRESS = '0xca11bde05977b3631167028862be2a173976ca11';
const RNS_REGISTRY_ADDRESS = '0x67c409dab0ee741a1b1be874bd1333234cfdbf44';
const PUBLIC_RESOLVER_ADDRESS = '0xadb077d236d9e81fb24b96ae9cb8089ab9942d48';

// Create read-only provider
export const roninProvider = new ethers.JsonRpcProvider(RONIN_RPC, 2020);

// Namehash implementation for RNS
export function rnsNamehash(name: string): string {
  let node = ethers.ZeroHash;
  if (name) {
    const labels = name.toLowerCase().split('.');
    for (let i = labels.length - 1; i >= 0; i--) {
      const labelHash = ethers.keccak256(ethers.toUtf8Bytes(labels[i]));
      node = ethers.keccak256(ethers.concat([node, labelHash]));
    }
  }
  return node;
}

// RNS Resolver
export async function resolveRNS(name: string): Promise<string> {
  const cleanName = name.trim().toLowerCase();
  
  if (ethers.isAddress(cleanName)) {
    return cleanName;
  }
  
  let targetName: string = cleanName;
  
  const queryName = async (n: string): Promise<string> => {
    const node = rnsNamehash(n);
    
    // 1. Get Resolver from Registry
    const registryAbi = ['function resolver(bytes32 node) view returns (address)'];
    const registryContract = new ethers.Contract(RNS_REGISTRY_ADDRESS, registryAbi, roninProvider);
    
    let resolverAddress = ethers.ZeroAddress;
    try {
      resolverAddress = await registryContract.resolver(node);
    } catch (e) {
      console.warn(`RNS Registry check failed for ${n}, using fallback resolver`, e);
      resolverAddress = PUBLIC_RESOLVER_ADDRESS;
    }
    
    if (resolverAddress === ethers.ZeroAddress) {
      resolverAddress = PUBLIC_RESOLVER_ADDRESS;
    }
    
    // 2. Query Resolver
    const resolverAbi = ['function addr(bytes32 node) view returns (address)'];
    const resolverContract = new ethers.Contract(resolverAddress, resolverAbi, roninProvider);
    const resolved = await resolverContract.addr(node);
    
    if (resolved === ethers.ZeroAddress) {
      throw new Error(`RNS name resolved to ZeroAddress: ${n}`);
    }
    return resolved.toLowerCase();
  };

  try {
    return await queryName(targetName);
  } catch (err: any) {
    if (targetName.endsWith('.ronin')) {
      const altName = targetName.slice(0, -6) + '.ron';
      try {
        console.log(`Resolving fallback name: ${altName}`);
        return await queryName(altName);
      } catch (err2: any) {
        throw new Error(`Failed to resolve RNS name "${targetName}" or "${altName}": ${err.message}`);
      }
    }
    throw err;
  }
}

// Multicall3 ABI
const MULTICALL3_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'target', type: 'address' },
          { name: 'allowFailure', type: 'bool' },
          { name: 'callData', type: 'bytes' }
        ],
        name: 'calls',
        type: 'tuple[]'
      }
    ],
    name: 'aggregate3',
    outputs: [
      {
        components: [
          { name: 'success', type: 'bool' },
          { name: 'returnData', type: 'bytes' }
        ],
        name: 'returnData',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

export interface OnChainFactoryResult {
  factoryId: number;
  symbol: string;
  level: number;
  active: boolean;
}

// Batch query all 30 factories
export async function fetchFactoriesFromOnChain(walletAddress: string): Promise<OnChainFactoryResult[]> {
  const resolvedAddress = await resolveRNS(walletAddress);
  
  const multicallContract = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, roninProvider);
  const gameInterface = new ethers.Interface(juegoConfig.abi);
  
  const getFactoryLevelFunc = juegoConfig.functions.getFactoryLevel.split('(')[0].trim();
  const isFactoryActiveFunc = juegoConfig.functions.isFactoryActive.split('(')[0].trim();
  
  const calls: any[] = [];
  
  for (let id = 1; id <= 30; id++) {
    calls.push({
      target: juegoConfig.contractAddress,
      allowFailure: true,
      callData: gameInterface.encodeFunctionData(getFactoryLevelFunc, [resolvedAddress, id])
    });
    
    calls.push({
      target: juegoConfig.contractAddress,
      allowFailure: true,
      callData: gameInterface.encodeFunctionData(isFactoryActiveFunc, [resolvedAddress, id])
    });
  }
  
  console.log(`📡 Sending batch request to Multicall3 for address ${resolvedAddress}...`);
  const results = await multicallContract.aggregate3(calls);
  
  const parsedFactories: OnChainFactoryResult[] = [];
  
  for (let i = 0; i < 30; i++) {
    const factoryId = i + 1;
    const symbol = (juegoConfig.factoryIdToSymbol as Record<string, string>)[factoryId.toString()] || `FACTORY_${factoryId}`;
    
    const levelRes = results[i * 2];
    const activeRes = results[i * 2 + 1];
    
    let level = 0;
    let active = false;
    
    if (levelRes.success && levelRes.returnData !== '0x') {
      try {
        const decoded = gameInterface.decodeFunctionResult(getFactoryLevelFunc, levelRes.returnData);
        level = Number(decoded[0]);
      } catch (e) {
        console.warn(`Error decoding level for factory ID ${factoryId}:`, e);
      }
    }
    
    if (activeRes.success && activeRes.returnData !== '0x') {
      try {
        const decoded = gameInterface.decodeFunctionResult(isFactoryActiveFunc, activeRes.returnData);
        active = Boolean(decoded[0]);
      } catch (e) {
        console.warn(`Error decoding active status for factory ID ${factoryId}:`, e);
      }
    }
    
    parsedFactories.push({
      factoryId,
      symbol,
      level,
      active
    });
  }
  
  return parsedFactories;
}

// Batch query ERC20 balances for the wallet
export async function fetchBalancesFromOnChain(walletAddress: string): Promise<Record<string, number>> {
  const resolvedAddress = await resolveRNS(walletAddress);
  const tokenSymbols = Object.keys(TOKENS);
  
  const multicallContract = new ethers.Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, roninProvider);
  const erc20Interface = new ethers.Interface([
    'function balanceOf(address account) view returns (uint256)'
  ]);
  
  const calls = tokenSymbols.map(symbol => ({
    target: TOKENS[symbol],
    allowFailure: true,
    callData: erc20Interface.encodeFunctionData('balanceOf', [resolvedAddress])
  }));
  
  console.log(`📡 Batch querying ${tokenSymbols.length} token balances on-chain...`);
  const results = await multicallContract.aggregate3(calls);
  
  const balances: Record<string, number> = {};
  
  tokenSymbols.forEach((symbol, index) => {
    const res = results[index];
    if (res.success && res.returnData !== '0x') {
      try {
        const [val] = erc20Interface.decodeFunctionResult('balanceOf', res.returnData);
        balances[symbol] = Number(val) / 1e18;
      } catch (e) {
        balances[symbol] = 0;
      }
    } else {
      balances[symbol] = 0;
    }
  });
  
  return balances;
}
