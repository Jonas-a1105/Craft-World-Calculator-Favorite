import { useTranslation } from '../utils/i18n';
import styles from './Card.module.css';

export default function Card({ title, children, style }: { title?: string; children: any; style?: React.CSSProperties }) {
  const { t } = useTranslation();
  return (
    <div className={styles.bentoCard} style={style}>
      {title && <h3 className={styles.cardTitle}>{t(title)}</h3>}
      {children}
    </div>
  );
}
