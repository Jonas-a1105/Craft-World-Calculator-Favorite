import React from 'react';
import { useTranslation } from '../utils/i18n';
import { Card as UICard, CardProps } from './ui/Card';

export interface LegacyCardProps extends Omit<CardProps, 'title'> {
  title?: React.ReactNode;
}

export default function Card({
  title,
  children,
  style,
  className = '',
  ...props
}: LegacyCardProps) {
  const { t } = useTranslation();
  const translatedTitle = typeof title === 'string' ? t(title) : title;

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
