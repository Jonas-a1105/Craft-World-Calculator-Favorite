// Dominio: seguimiento ligero de módulos visitados (LP2).
// Lo usa el checklist de primera sesión para marcar pasos completados sin
// backend. Persistido en localStorage por ruta.
const VISITS_KEY = 'craftworld.moduleVisits';

export function markModuleVisit(pathname: string): void {
  try {
    const visited = JSON.parse(localStorage.getItem(VISITS_KEY) || '{}');
    if (visited[pathname]) return; // ya contado, evita re-escrituras en cada repintado
    visited[pathname] = 1;
    localStorage.setItem(VISITS_KEY, JSON.stringify(visited));
  } catch {
    // storage unavailable
  }
}

export function hasVisitedModule(pathname: string): boolean {
  try {
    const visited = JSON.parse(localStorage.getItem(VISITS_KEY) || '{}');
    return Boolean(visited[pathname]);
  } catch {
    return false;
  }
}
