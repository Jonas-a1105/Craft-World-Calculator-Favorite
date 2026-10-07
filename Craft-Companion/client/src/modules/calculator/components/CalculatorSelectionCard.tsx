import React from 'react';
import Card from '../../../components/Card';
import Select from '../../../components/ui/Select';

interface CalculatorSelectionCardProps {
  language: string;
  selectedToken: string;
  selectedLevel: number;
  uniqueTokens: string[];
  availableLevels: number[];
  onSelectToken: (token: string) => void;
  onSelectLevel: (level: number) => void;
}

export const CalculatorSelectionCard: React.FC<CalculatorSelectionCardProps> = ({
  language,
  selectedToken,
  selectedLevel,
  uniqueTokens,
  availableLevels,
  onSelectToken,
  onSelectLevel,
}) => {
  return (
    <Card
      title={language === 'es' ? '⚙️ Seleccionar Fábrica y Nivel' : '⚙️ Select Factory & Level'}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label={language === 'es' ? 'Recurso / Fábrica:' : 'Resource / Factory:'}
          value={selectedToken}
          onChange={(e) => onSelectToken(e.target.value)}
        >
          {uniqueTokens.map((token) => (
            <option key={token} value={token}>
              {token}
            </option>
          ))}
        </Select>

        <Select
          label={language === 'es' ? 'Nivel de Fábrica:' : 'Factory Level:'}
          value={selectedLevel}
          onChange={(e) => onSelectLevel(Number(e.target.value))}
        >
          {availableLevels.map((lvl) => (
            <option key={lvl} value={lvl}>
              Nivel {lvl}
            </option>
          ))}
        </Select>
      </div>
    </Card>
  );
};
