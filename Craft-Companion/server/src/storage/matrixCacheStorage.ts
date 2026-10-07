import { prisma } from '../db/prisma.js';

export type MatrixCachePayload = {
  updatedAt: string;
  selectedGroup?: string;
  scanStatus?: 'idle' | 'scanning';
  scanColumn?: string;
  scanStartedAt?: string;
  nextScanAt?: string;
  cells: Record<string, unknown>;
};

export async function getMatrixCache(): Promise<MatrixCachePayload> {
  try {
    const record = await prisma.matrixCache.findUnique({
      where: { id: 'default' },
    });

    if (!record) {
      return { updatedAt: '', scanStatus: 'idle', cells: {} };
    }

    let parsedCells: Record<string, unknown> = {};
    try {
      parsedCells = JSON.parse(record.cells || '{}');
    } catch {
      parsedCells = {};
    }

    return {
      updatedAt: record.updatedAt,
      selectedGroup: record.selectedGroup ?? undefined,
      scanStatus: record.scanStatus === 'scanning' ? 'scanning' : 'idle',
      scanColumn: record.scanColumn ?? undefined,
      scanStartedAt: record.scanStartedAt ?? undefined,
      nextScanAt: record.nextScanAt ?? undefined,
      cells: parsedCells,
    };
  } catch {
    return { updatedAt: '', scanStatus: 'idle', cells: {} };
  }
}

export async function saveMatrixCache(payload: MatrixCachePayload): Promise<MatrixCachePayload> {
  const safePayload: MatrixCachePayload = {
    updatedAt: payload.updatedAt || new Date().toISOString(),
    selectedGroup: payload.selectedGroup,
    scanStatus: payload.scanStatus || 'idle',
    scanColumn: payload.scanColumn || '',
    scanStartedAt: payload.scanStartedAt || '',
    nextScanAt: payload.nextScanAt || '',
    cells: payload.cells || {},
  };

  await prisma.matrixCache.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      selectedGroup: safePayload.selectedGroup || null,
      scanStatus: safePayload.scanStatus || 'idle',
      scanColumn: safePayload.scanColumn || null,
      scanStartedAt: safePayload.scanStartedAt || null,
      nextScanAt: safePayload.nextScanAt || null,
      cells: JSON.stringify(safePayload.cells || {}),
      updatedAt: safePayload.updatedAt,
    },
    update: {
      selectedGroup: safePayload.selectedGroup || null,
      scanStatus: safePayload.scanStatus || 'idle',
      scanColumn: safePayload.scanColumn || null,
      scanStartedAt: safePayload.scanStartedAt || null,
      nextScanAt: safePayload.nextScanAt || null,
      cells: JSON.stringify(safePayload.cells || {}),
      updatedAt: safePayload.updatedAt,
    },
  });

  return safePayload;
}