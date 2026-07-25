import { useTranslation } from '../utils/i18n';
import styles from './Card.module.css';

export default function Card({
  title,
  children,
  style,
  className,
}: {
  title?: string;
  children: any;
  style?: React.CSSProperties;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.bentoCard} ${className || ''}`} style={style}>
      {title && <h3 className={styles.cardTitle}>{t(title)}</h3>}
      {children}
    </div>
  );
}
