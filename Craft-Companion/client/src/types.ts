export * from '../../server/src/types';

export type Me = {
  id: string;
  craftWorldUid?: string;
  craftWorldDisplayName?: string;
  craftWorldAvatarUrl?: string;
  craftWorldLevel?: number;
  createdAt: string;
  lastLoginAt?: string;
};
