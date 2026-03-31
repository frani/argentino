import React, { useEffect, useState } from 'react';
import { useMCPContext } from '../contexts/MCPContext';
import { Window, RetroButton } from './RetroUI';
import { Sprout, TrendingUp, TrendingDown, Info, Calendar, Leaf, Wheat } from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';

export const AgroView: React.FC = () => {
  const { agroData, fetchAgroData, agroHistory, fetchAgroHistory, syncAgroPrices, loadingAgro } = useMCPContext();
  const [selectedTicker, setSelectedTicker] = useState<string>('SOJA');
  const [timeRange, setTimeRange] = useState<number>(30); // Default 30 days
  const [syncing, setSyncing] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchAgroData();
  }, [fetchAgroData]);

  useEffect(() => {
    if (selectedTicker) {
      if (customRange.start && customRange.end) {
        fetchAgroHistory(selectedTicker, 0, customRange.start, customRange.end);
      } else {
        fetchAgroHistory(selectedTicker, timeRange);
      }
    }
  }, [selectedTicker, timeRange, customRange, fetchAgroHistory]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncAgroPrices();
      alert("Sincronización de datos iniciada (Precio actual e historial).");
      // Wait a bit longer since history sync is triggered as well
      setTimeout(() => {
        fetchAgroData();
        fetchAgroHistory(selectedTicker, timeRange);
      }, 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const getTickerLabel = (ticker: string) => {
    const labels: Record<string, string> = {
      'SOJA': 'Soja Rosario',
      'MAIZ': 'Maíz Rosario',
      'TRIGO': 'Trigo Rosario',
      'GIRASOL': 'Girasol Rosario',
      'SORGO': 'Sorgo Rosario'
    };
    return labels[ticker] || ticker;
  };

  const safeAgroData = Array.isArray(agroData) ? agroData : [];
  const mainGrains = safeAgroData.filter(d => d && ['SOJA', 'MAIZ', 'TRIGO'].includes(d.ticker));
  const otherGrains = safeAgroData.filter(d => d && !['SOJA', 'MAIZ', 'TRIGO'].includes(d.ticker));
  const lastSyncDateText = safeAgroData[0]?.source_ts ? new Date(safeAgroData[0].source_ts).toLocaleString() : 'No disponible';

  const history = (agroHistory && Array.isArray(agroHistory[selectedTicker])) ? agroHistory[selectedTicker] : [];
  const chartData = history.map(h => ({
    date: h.source_ts ? new Date(h.source_ts).toLocaleDateString() : '?',
    price: h.price || 0
  }));

  const currentPrice = safeAgroData.find(d => d.ticker === selectedTicker)?.price || 0;
  const prevPrice = (history && history.length > 1) ? history[history.length - 2].price : currentPrice;
  const change = currentPrice - (prevPrice || 0);
  const changePct = (prevPrice && prevPrice > 0) ? (change / prevPrice) * 100 : 0;

  const formatPrice = (price: any) => {
    if (typeof price !== 'number') return '---';
    return price.toLocaleString();
  };

  const ranges = [
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
    { label: '1A', value: 365 },
  ];

  const minPrice = history.length > 0 ? Math.min(...history.map(h => h.price)) : 0;
  const maxPrice = history.length > 0 ? Math.max(...history.map(h => h.price)) : 0;
  const firstDate = history.length > 0 && history[0].source_ts ? new Date(history[0].source_ts).toISOString().split('T')[0] : '';
  const lastDate = history.length > 0 && history[history.length - 1].source_ts ? new Date(history[history.length - 1].source_ts).toISOString().split('T')[0] : '';

  const getLatestPriceFromHistory = (ticker: string) => {
    const h = agroHistory[ticker];
    if (Array.isArray(h) && h.length > 0) {
      return h[h.length - 1].price;
    }
    return safeAgroData.find(d => d.ticker === ticker)?.price;
  };

  const getGrainStyle = (ticker: string, isSelected: boolean) => {
    const styles: Record<string, { idle: string, selected: string }> = {
      'SOJA': { idle: 'border-emerald-500 bg-white hover:bg-emerald-50 text-emerald-900', selected: 'bg-emerald-600 text-white border-emerald-900' },
      'MAIZ': { idle: 'border-yellow-500 bg-white hover:bg-yellow-50 text-yellow-900', selected: 'bg-yellow-500 text-black border-yellow-700' },
      'TRIGO': { idle: 'border-amber-600 bg-white hover:bg-amber-50 text-amber-900', selected: 'bg-amber-600 text-white border-amber-900' }
    };
    const s = styles[ticker] || { idle: 'border-black bg-white hover:bg-gray-50', selected: 'bg-retro-blue text-white' };
    return isSelected ? s.selected : s.idle;
  };

  const getGrainIcon = (ticker: string) => {
    switch (ticker) {
      case 'SOJA': return <Leaf className="w-5 h-5 text-emerald-500" />;
      case 'MAIZ': return <div className="w-5 h-5 flex items-center justify-center font-bold text-lg select-none">🌽</div>;
      case 'TRIGO': return <Wheat className="w-5 h-5 text-amber-600" />;
      default: return <Sprout className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {['SOJA', 'MAIZ', 'TRIGO'].map(ticker => {
          const price = getLatestPriceFromHistory(ticker);
          const isSelected = selectedTicker === ticker;
          return (
            <div 
              key={ticker}
              onClick={() => setSelectedTicker(ticker)}
              className={`
                cursor-pointer transition-all duration-300 border-2 p-4 shadow-button relative overflow-hidden
                ${getGrainStyle(ticker, isSelected)}
              `}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rotate-45 translate-x-4 -translate-y-4" />
              )}
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className={`text-xs uppercase font-black tracking-widest ${isSelected ? 'opacity-90' : 'opacity-50'}`}>{ticker}</span>
                <div className="relative">
                  {getGrainIcon(ticker)}
                </div>
              </div>
              <div className="text-3xl font-black mb-1 relative z-10 tracking-tighter">
                USD {formatPrice(price)}
              </div>
              <div className={`text-[10px] font-bold ${isSelected ? 'opacity-80' : 'opacity-40'}`}>Precio por Tonelada</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart View - Full Width */}
        <div className="lg:col-span-12 flex flex-col gap-3">
          <Window 
            title={`Tendencia Histórica: ${getTickerLabel(selectedTicker)}`}
            className="bg-white/80"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-2 gap-2 border-b border-black/5 pb-3">
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold">
                <div className="flex flex-col">
                  <span className="opacity-40 uppercase tracking-tighter text-[9px]">Desde</span>
                  <input 
                    type="date" 
                    value={customRange.start || firstDate} 
                    onChange={(e) => {
                      setCustomRange(prev => ({ ...prev, start: e.target.value }));
                      setTimeRange(0);
                    }}
                    className="border border-black/10 px-1 bg-white focus:outline-none focus:border-retro-blue text-[10px]"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="opacity-40 uppercase tracking-tighter text-[9px]">Hasta</span>
                  <input 
                    type="date" 
                    value={customRange.end || lastDate} 
                    onChange={(e) => {
                      setCustomRange(prev => ({ ...prev, end: e.target.value }));
                      setTimeRange(0);
                    }}
                    className="border border-black/10 px-1 bg-white focus:outline-none focus:border-retro-blue text-[10px]"
                  />
                </div>
                <div className="w-[1px] h-6 bg-black/10 mx-1 hidden sm:block" />
                <div className="flex flex-col">
                  <span className="text-red-500 uppercase tracking-tighter text-[9px]">Mínimo</span>
                  <span>USD {formatPrice(minPrice)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-green-600 uppercase tracking-tighter text-[9px]">Máximo</span>
                  <span>USD {formatPrice(maxPrice)}</span>
                </div>
              </div>
              <div className="flex gap-1 bg-retro-bg/30 p-1 border border-black/10 rounded">
                {ranges.map(r => (
                  <button
                    key={r.value}
                    onClick={() => {
                      setTimeRange(r.value);
                      setCustomRange({ start: '', end: '' });
                    }}
                    className={`
                      px-3 py-1 text-[10px] font-bold border border-black/20 shadow-sm transition-all
                      ${timeRange === r.value ? 'bg-black text-white shadow-none' : 'bg-white hover:bg-gray-100'}
                    `}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[280px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis 
                      dataKey="date" 
                      tick={{fontSize: 9}} 
                      interval="preserveEnd"
                      minTickGap={40}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      tick={{fontSize: 9}}
                      tickFormatter={(val) => `USD ${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '2px solid black', fontSize: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center italic opacity-40">
                  {loadingAgro ? 'Cargando historial...' : 'No hay datos históricos disponibles'}
                </div>
              )}
            </div>
          </Window>
        </div>

        {/* Details & Other Grains - Now Below the Chart */}
        <div className="lg:col-span-12">
          <Window title="Resumen de Precios" className="bg-pastel-yellow/30">
            <div className="flex flex-col gap-3">
              <div className="bg-white border-2 border-black p-3 shadow-button">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs uppercase tracking-tight">Variación Diaria</span>
                  <div className={`flex items-center gap-1 text-sm font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {change >= 0 ? '+' : ''}{changePct.toFixed(2)}%
                  </div>
                </div>
                <div className="text-[10px] opacity-60">Basado en la última cotización registrada ({lastSyncDateText})</div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase opacity-50 px-1 border-l-4 border-retro-blue ml-1">Otras Cotizaciones</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {otherGrains.map(grain => (
                    <div key={grain.ticker} className="flex justify-between items-center p-2 bg-white border border-black/10 hover:bg-retro-blue/5 transition-colors">
                      <span className="font-bold text-xs">{getTickerLabel(grain.ticker)}</span>
                      <span className="font-bold text-sm text-retro-blue">USD {formatPrice(grain.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-2 flex gap-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
                <p className="text-[9px] text-blue-800 leading-tight">
                  Precios de referencia Matba Rofex para el mercado físico. Los valores históricos se consolidan cada 24hs.
                </p>
              </div>
            </div>
          </Window>
        </div>
      </div>
    </div>
  );
};
