import React from 'react';
import { Badge } from '../../../components/ui';

export interface StatusBadgeProps {
  active: boolean;
  text: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ active, text }) => {
  return (
    <Badge variant={active ? 'success' : 'neutral'} size="sm">
      {text}
    </Badge>
  );
};
