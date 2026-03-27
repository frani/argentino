import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useParams, useNavigate, Navigate } from 'react-router-dom';
import { useMCP } from './hooks/useMCP';
import { Window, RetroButton } from './components/RetroUI';
import { RefreshCw, LayoutGrid, Globe, ChevronRight } from 'lucide-react';
import { EntityAnalysis } from './components/EntityAnalysis';
import { MarketOverview } from './components/MarketOverview';
import { useMCPContext } from './contexts/MCPContext';

function App() {
  const { call } = useMCP();
  const { 
    entities, 
    marketData, 
    loadingEntities, 
    loadingMarket, 
    fetchEntities, 
    fetchMarketData 
  } = useMCPContext();

  const syncData = async () => {
    try {
      await call('tools/call', { name: 'sync_bcra_data' });
      alert("Sincronización iniciada!");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEntities();
    fetchMarketData();
  }, [fetchEntities, fetchMarketData]);

  const topEntities = entities
    .filter(e => e.annotations?.latest_assets)
    .slice(0, 10)
    .map(e => ({
      name: e.name.replace('Balances de ', ''),
      assets: e.annotations?.latest_assets || 0
    }));

  const globalLoading = loadingEntities || loadingMarket;

  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen p-4 flex flex-col gap-4 font-sans text-black overflow-hidden h-screen">
      {/* Top Menu */}
      <div className="window py-1 px-2 flex justify-between items-center bg-retro-bg shrink-0">
        <div className="flex gap-2 text-xs">
          <RetroButton className="font-bold px-2">Inicio</RetroButton>
          <div className="w-[1px] bg-gray-600 self-stretch mx-1 shadow-button" />
          <RetroButton onClick={() => { fetchEntities(); fetchMarketData(); }} disabled={globalLoading}>
            <RefreshCw className={`w-3 h-3 ${globalLoading ? 'animate-spin' : ''}`} />
          </RetroButton>
          <RetroButton onClick={syncData} className="px-2">Sincronizar BCRA</RetroButton>
        </div>
        <div className="text-[10px] font-bold bg-pastel-yellow border-black border px-2 shadow-button">
          FinArgentina v1.0.0
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Sidebar */}
        <div className="col-span-3 h-full overflow-y-auto">
          <Window title="Explorador" className="bg-pastel-pink h-full">
            <div className="flex flex-col gap-1">
              <NavLink 
                to="/mercado-general"
                className={({isActive}) => `flex items-center gap-2 p-1 border border-transparent ${isActive ? 'bg-retro-blue text-white shadow-button' : 'hover:bg-retro-blue/20'}`}
              >
                <Globe className="w-4 h-4" />
                <span className="font-bold text-sm">Mercado General</span>
              </NavLink>
              
              <NavLink 
                to="/entidades"
                end
                className={({isActive}) => `flex items-center gap-2 p-1 border border-transparent ${isActive ? 'bg-retro-blue text-white shadow-button' : 'hover:bg-retro-blue/20'}`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="font-bold text-sm">Ranking Entidades</span>
              </NavLink>

              <div className="mt-4 border-t-2 border-black/10 pt-2 px-1">
                <span className="text-[9px] uppercase font-bold opacity-50">Acceso Directo</span>
                {entities.slice(0, 5).map(e => {
                  const id = e.uri.split('/').pop();
                  return (
                    <NavLink
                      key={e.uri}
                      to={`/entidades/${id}`}
                      className={({isActive}) => `flex items-center gap-2 p-1 text-[11px] truncate ${isActive ? 'bg-retro-green text-black border-black border' : 'hover:bg-retro-green/20'}`}
                    >
                      <ChevronRight className="w-3 h-3 shrink-0" />
                      <span className="truncate">{e.name.replace('Balances de ', '')}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </Window>
        </div>

        {/* Content Area */}
        <div className="col-span-9 h-full overflow-y-auto">
          {children}
        </div>
      </div>

      <div className="bg-retro-bg border-t-2 border-white shadow-button p-1 text-[10px] flex justify-between shrink-0">
        <span>Sistema Financiero Argentino</span>
        <div className="flex gap-4">
          <span>{new Date().toLocaleDateString()}</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/mercado-general" replace />} />
          <Route path="/mercado-general" element={
            <Window title="Análisis Macroeconómico del Sistema" className="bg-pastel-yellow h-full">
              {loadingMarket ? (
                <div className="p-10 text-center animate-pulse italic">Cargando datos maestros...</div>
              ) : (
                <MarketOverview data={marketData} topEntities={topEntities} />
              )}
            </Window>
          } />
          
          <Route path="/entidades" element={
            <Window title="Nómina y Ranking de Entidades" className="bg-pastel-yellow h-full">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-black bg-gray-100 italic">
                      <th className="p-2">#</th>
                      <th className="p-2">Denominación</th>
                      <th className="p-2">Activo (Últ.)</th>
                      <th className="p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entities.map((e, i) => {
                      const id = e.uri.split('/').pop();
                      return (
                        <tr key={e.uri} className="border-b border-gray-300 hover:bg-pastel-blue">
                          <td className="p-2 font-mono">{i + 1}</td>
                          <td className="p-2 font-bold">{e.name.replace('Balances de ', '')}</td>
                          <td className="p-2 font-mono">
                            {e.annotations?.latest_assets ? 
                              new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', notation: 'compact' }).format(e.annotations.latest_assets) 
                              : '-'}
                          </td>
                          <td className="p-2">
                            <Link to={`/entidades/${id}`}>
                              <RetroButton className="text-[10px] py-0 px-2">Ver Detalle</RetroButton>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Window>
          } />

          <Route path="/entidades/:id" element={<EntityDetailWrapper />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

// Wrapper to fetch entity data based on ID
function EntityDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  const { entities, fetchBalances, balancesCache } = useMCPContext();
  const [localBalances, setLocalBalances] = useState<any[]>(balancesCache[id || ''] || []);
  const [loading, setLoading] = useState(!balancesCache[id || '']);
  const navigate = useNavigate();

  const entity = entities.find(e => e.uri.endsWith(`/${id}`));
  const entityName = entity?.name.replace('Balances de ', '') || `Entidad ${id}`;

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      if (balancesCache[id]) {
        setLocalBalances(balancesCache[id]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const data = await fetchBalances(id);
      setLocalBalances(data);
      setLoading(false);
    };
    fetch();
  }, [id, fetchBalances, balancesCache]);

  return (
    <Window title={`Detalle: ${entityName}`} className="bg-pastel-blue h-full overflow-y-auto">
      <div className="flex flex-col gap-4">
        <RetroButton onClick={() => navigate('/entidades')} className="w-fit font-bold text-xs">
          ← Volver al Ranking
        </RetroButton>
        
        {loading ? (
          <div className="p-10 text-center animate-pulse italic text-retro-blue font-bold">
            Recuperando estados contables...
          </div>
        ) : localBalances.length > 0 ? (
          <EntityAnalysis balances={localBalances} />
        ) : (
          <div className="p-10 text-center italic text-red-500 bg-white border-2 border-red-500 shadow-button">
            No se encontraron datos para la entidad {id}.
          </div>
        )}
      </div>
    </Window>
  );
}

export default App;
