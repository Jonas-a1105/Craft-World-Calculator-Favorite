import React from 'react';
import { useTranslation } from '../utils/i18n';
import { Card as UICard, CardProps } from './ui/Card';

export interface LegacyCardProps extends Omit<CardProps, 'title'> {
  title?: string;
}

export default function Card({
  title,
  children,
  style,
  className = '',
  ...props
}: LegacyCardProps) {
  const { t } = useTranslation();
  const translatedTitle = title ? t(title) : undefined;

  return (
    <UICard
      title={translatedTitle}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </UICard>
  );
}
