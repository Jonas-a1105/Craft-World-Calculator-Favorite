import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';

export default function Matrix() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadFactoryData()
      .then((factoryRows) => setRows(factoryRows))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );

  const filtered = rows.filter(
    (r) =>
      r.token.toLowerCase().includes(search.toLowerCase()) ||
      r.output_token.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Layout>
      <div className="w-full max-w-[1200px] mx-auto space-y-6">
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-3xl font-extrabold text-white tracking-wider"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >
            {language === 'es' ? 'Matriz de Recursos y Recetas' : 'Resource & Recipe Matrix'}
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Tabla completa de crafteo, entradas, salidas y tiempos de producción por nivel.'
              : 'Complete table of crafting inputs, outputs, and production runtimes by level.'}
          </p>
        </div>

        {/* Search */}
        <Card>
          <input
            type="text"
            placeholder={
              language === 'es'
                ? 'Filtrar por recurso o fábrica...'
                : 'Filter by resource or factory...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80"
          />
        </Card>

        {/* Matrix Table */}
        <Card
          title={
            language === 'es'
              ? `🧩 Matriz de Crafteo (${filtered.length} filas)`
              : `🧩 Crafting Matrix (${filtered.length} rows)`
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Fábrica</th>
                  <th className="p-3">Nivel</th>
                  <th className="p-3">Tiempo (Min)</th>
                  <th className="p-3">Insumo 1</th>
                  <th className="p-3">Insumo 2</th>
                  <th className="p-3">Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filtered.slice(0, 80).map((r, i) => (
                  <tr key={i} className="hover:bg-slate-900/50 transition">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <FactoryIcon symbol={r.token} size={24} />
                      <span className="text-emerald-400">{r.token}</span>
                    </td>
                    <td className="p-3 text-slate-300">Lv. {r.level}</td>
                    <td className="p-3 text-slate-400">{r.duration_min} min</td>
                    <td className="p-3 text-slate-200">
                      {r.input_token_1 ? (
                        <span className="flex items-center gap-1.5">
                          <ResourceIcon symbol={r.input_token_1} size={16} />
                          {r.input_amount_1} {r.input_token_1}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-slate-200">
                      {r.input_token_2 ? (
                        <span className="flex items-center gap-1.5">
                          <ResourceIcon symbol={r.input_token_2} size={16} />
                          {r.input_amount_2} {r.input_token_2}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 font-bold text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <ResourceIcon symbol={r.output_token} size={18} />
                        {r.output_amount} {r.output_token}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
