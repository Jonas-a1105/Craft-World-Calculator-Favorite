import React, { useState } from 'react';
import { Pen2Linear } from 'solar-icon-set';

interface BaseCostLevelSelectorProps {
  token: string;
  curLevel: number;
  maxLevel: number;
  onLevelChange: (token: string, level: number) => void;
}

export const BaseCostLevelSelector: React.FC<BaseCostLevelSelectorProps> = ({
  token,
  curLevel,
  maxLevel,
  onLevelChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(String(curLevel));

  const handleCommit = () => {
    const parsed = parseInt(val, 10);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= maxLevel) {
      onLevelChange(token, parsed);
    } else {
      setVal(String(curLevel));
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        type="number"
        min={1}
        max={maxLevel}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCommit();
          if (e.key === 'Escape') {
            setVal(String(curLevel));
            setIsEditing(false);
          }
        }}
        className="w-12 bg-[#131316] border-none ring-1 ring-amber-400 rounded px-1.5 py-0.5 text-xs font-mono text-center text-white focus:outline-none"
      />
    );
  }

  return (
    <div
      onClick={() => {
        setVal(String(curLevel));
        setIsEditing(true);
      }}
      className="group/lvl relative inline-flex items-center justify-center gap-0.5 cursor-pointer px-2 py-0.5 rounded-lg bg-[#131316] hover:bg-[#202026] transition-colors ring-1 ring-white/5"
      title={`Nivel ${curLevel} de ${maxLevel} (Click para editar)`}
    >
      <span className="font-mono text-xs text-slate-100 font-semibold">{curLevel}</span>
      <span className="font-mono text-[10px] text-slate-500">/{maxLevel}</span>
      <Pen2Linear
        size={11}
        className="opacity-0 group-hover/lvl:opacity-100 transition-opacity text-amber-400 ml-1 shrink-0"
      />
    </div>
  );
};
