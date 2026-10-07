import React from 'react';
import Card from '../../../components/Card';
import { useTranslation } from '../../../utils/i18n';

export interface ScopeUnauthorizedCardProps {
  scope: string;
  onReauthorize: () => void;
}

export const ScopeUnauthorizedCard: React.FC<ScopeUnauthorizedCardProps> = ({
  scope,
  onReauthorize,
}) => {
  const { language } = useTranslation();

  return (
    <Card>
      <div className="text-center py-6">
        <p className="text-amber-400 font-bold mb-2">
          ⚠️ Scope `{scope}` {language === 'es' ? 'no autorizado aún' : 'not authorized yet'}
        </p>
        <button type="button" onClick={onReauthorize} className="retroBtn">
          {language === 'es' ? 'Re-vincular Cuenta' : 'Re-link Account'}
        </button>
      </div>
    </Card>
  );
};
