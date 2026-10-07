import React from 'react';
import { CatalogItem } from '../types';
import { ResourceIcon, FactoryIcon } from '../../../components/GameIcon';
import { Badge } from '../../../components/ui';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  item: CatalogItem;
}

export const SelectedBanner: React.FC<Props> = ({ item }) => {
  const { language } = useTranslation();

  const rawName = language === 'es' ? item.nameEs : item.name;
  // Normalize diacritics so TheImpostor font glyphs never fallback to system fonts
  const cleanName = rawName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  return (
    <div className="flex items-center gap-3 mb-5 select-none min-w-0 max-w-full">
      <div className="w-10 h-10 rounded-2xl bg-[#1c1c20] flex items-center justify-center shrink-0 shadow-lg">
        {item.isBuilding ? (
          <FactoryIcon symbol={item.iconSymbol} size={28} />
        ) : (
          <ResourceIcon symbol={item.iconSymbol} size={28} />
        )}
      </div>

      <h2
        className="text-base sm:text-lg md:text-xl font-game text-white tracking-wide truncate"
        style={{
          fontFamily: "'TheImpostor', sans-serif",
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        }}
        title={rawName}
      >
        {cleanName}
      </h2>

      <Badge variant="neutral" size="sm" className="bg-[#24242a] text-slate-300 rounded-full border-none shrink-0">
        {language === 'es' ? item.badgeEs : item.badge}
      </Badge>
    </div>
  );
};
