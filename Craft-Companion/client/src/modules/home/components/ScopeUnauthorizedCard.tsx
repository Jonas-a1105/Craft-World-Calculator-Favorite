import React from 'react';
import Card from '../../../components/Card';
import { useTranslation } from '../../../utils/i18n';
import { DangerTriangleBoldDuotone } from 'solar-icon-set';

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
      <div className="flex flex-col items-center justify-center py-6">
        <p className="text-amber-400 font-bold mb-3 flex items-center justify-center gap-2">
          <DangerTriangleBoldDuotone className="w-5 h-5 text-amber-400" />
          <span>
            Scope `{scope}` {language === 'es' ? 'no autorizado aún' : 'not authorized yet'}
          </span>
        </p>
        <button type="button" onClick={onReauthorize} className="retroBtn">
          {language === 'es' ? 'Re-vincular Cuenta' : 'Re-link Account'}
        </button>
      </div>
    </Card>
  );
};
