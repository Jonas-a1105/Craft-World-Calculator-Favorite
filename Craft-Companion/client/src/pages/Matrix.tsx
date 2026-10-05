import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';
import {
  Input,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '../components/ui';

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
            className="text-3xl font-extrabold text-white tracking-wider font-main"
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
          <div className="w-full sm:w-80">
            <Input
              type="text"
              placeholder={
                language === 'es'
                  ? 'Filtrar por recurso o fábrica...'
                  : 'Filter by resource or factory...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z"
                  />
                </svg>
              }
            />
          </div>
        </Card>

        {/* Matrix Table */}
        <Card
          title={
            language === 'es'
              ? `🧩 Matriz de Crafteo (${filtered.length} filas)`
              : `🧩 Crafting Matrix (${filtered.length} rows)`
          }
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>
                  {language === 'es' ? 'Fábrica' : 'Factory'}
                </TableHeaderCell>
                <TableHeaderCell>
                  {language === 'es' ? 'Nivel' : 'Level'}
                </TableHeaderCell>
                <TableHeaderCell>
                  {language === 'es' ? 'Tiempo' : 'Time'}
                </TableHeaderCell>
                <TableHeaderCell>
                  {language === 'es' ? 'Insumo 1' : 'Input 1'}
                </TableHeaderCell>
                <TableHeaderCell>
                  {language === 'es' ? 'Insumo 2' : 'Input 2'}
                </TableHeaderCell>
                <TableHeaderCell>Output</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(0, 100).map((r, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-bold text-white">
                      <FactoryIcon symbol={r.token} size={24} />
                      <span className="text-emerald-400">{r.token}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-300 font-mono">Nv. {r.level}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-400 font-mono">{r.duration_min} min</span>
                  </TableCell>
                  <TableCell>
                    {r.input_token_1 ? (
                      <span className="flex items-center gap-1.5 font-mono">
                        <ResourceIcon symbol={r.input_token_1} size={16} />
                        {r.input_amount_1} {r.input_token_1}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {r.input_token_2 ? (
                      <span className="flex items-center gap-1.5 font-mono">
                        <ResourceIcon symbol={r.input_token_2} size={16} />
                        {r.input_amount_2} {r.input_token_2}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 font-bold text-amber-300 font-mono">
                      <ResourceIcon symbol={r.output_token} size={18} />
                      {r.output_amount} {r.output_token}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
