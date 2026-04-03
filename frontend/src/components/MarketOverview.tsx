import React, { useEffect, useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, BarChart3, Globe, PieChart as PieIcon, AlertTriangle } from 'lucide-react';

interface MarketPeriod {
  year: number;
  month: number;
  total_assets: number;
  total_liabilities: number;
  total_net_worth: number;
  avg_solvency: number;
  entity_count: number;
}

interface SystemDebtorSummary {
  period_date: string;
  total_debtors: number;
  total_debt: number;
  debt_sit_1: number;
  debt_sit_2: number;
  debt_sit_3: number;
  debt_sit_4: number;
  debt_sit_5: number;
  debt_sit_11: number;
  entity_count: number;
}

interface MarketOverviewProps {
  data: MarketPeriod[];
  topEntities: { name: string; assets: number }[];
}

const COLORS = ['#000080', '#008080', '#800080', '#808000', '#008000', '#800000', '#FF00FF', '#00FFFF', '#C0C0C0'];

export const MarketOverview: React.FC<MarketOverviewProps> = ({ data, topEntities }) => {
  const [systemDebtors, setSystemDebtors] = useState<SystemDebtorSummary | null>(null);

  useEffect(() => {
    const fetchDebtors = async () => {
      try {
        const apiBaseUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiBaseUrl}/mcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'tools/call',
            params: { name: 'get_system_debtors' },
            id: Date.now(),
          }),
        });
        const data = await response.json();
        const content = data.result?.content?.[0]?.text;
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed && parsed.total_debt > 0) {
            setSystemDebtors(parsed);
          }
        }
      } catch (e) {
        console.error("Error fetching system debtors:", e);
      }
    };
    fetchDebtors();
  }, []);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center animate-pulse text-retro-blue font-bold">Cargando datos del mercado...</div>;
  }

  const latest = data[data.length - 1];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(val);
  };

  const chartData = data.map(p => ({
    periodo: `${p.month}/${p.year}`,
    ...p
  }));

  // Pie Chart Data: Top 7 + Others
  const top7 = topEntities.slice(0, 7);
  const totalTop7 = top7.reduce((acc, curr) => acc + curr.assets, 0);
  const othersAssets = latest.total_assets - totalTop7;
  
  const pieData = [
    ...top7.map(e => ({ name: e.name, value: e.assets })),
    { name: 'Otros (Sistema)', value: othersAssets > 0 ? othersAssets : 0 }
  ];

  // System debtor pie data
  const debtPieData = systemDebtors ? [
    { name: 'Normal (1)', value: systemDebtors.debt_sit_1, color: '#22c55e' },
    { name: 'Riesgo Bajo (2)', value: systemDebtors.debt_sit_2, color: '#eab308' },
    { name: 'Riesgo Medio (3)', value: systemDebtors.debt_sit_3, color: '#f97316' },
    { name: 'Riesgo Alto (4)', value: systemDebtors.debt_sit_4, color: '#ef4444' },
    { name: 'Irrecuperable (5)', value: systemDebtors.debt_sit_5, color: '#7f1d1d' },
    { name: 'Garantías (11)', value: systemDebtors.debt_sit_11, color: '#3b82f6' },
  ].filter(d => d.value > 0) : [];

  const systemMorosidad = systemDebtors && systemDebtors.total_debt > 0
    ? (((systemDebtors.debt_sit_2 || 0) + (systemDebtors.debt_sit_3 || 0) + (systemDebtors.debt_sit_4 || 0) + (systemDebtors.debt_sit_5 || 0)) / systemDebtors.total_debt * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Macro Stats */}
      <div className="window bg-pastel-yellow">
        <div className="title-bar !bg-retro-blue flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span>Resumen Macro - Sistema Financiero Argentino ({latest.month}/{latest.year})</span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Activo Total Sistema", val: formatCurrency(latest.total_assets), color: "text-retro-blue" },
            { label: "Patrimonio Neto Total", val: formatCurrency(latest.total_net_worth), color: "text-retro-green" },
            { label: "Solvencia Promedio", val: latest.avg_solvency.toFixed(1) + "%", color: "text-purple-700" },
            { label: "Entidades Registradas", val: latest.entity_count, color: "text-black" },
            { label: "Morosidad Sistema (BCRA)", val: systemMorosidad > 0 ? systemMorosidad.toFixed(2) + "%" : "N/D", color: systemMorosidad > 5 ? "text-red-600" : "text-orange-600" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-3 border-2 border-black shadow-button flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold opacity-60 text-center">{s.label}</span>
              <span className={`text-xl font-bold ${s.color}`}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Evolution */}
        <div className="window bg-white h-[400px]">
          <div className="title-bar !bg-retro-blue flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Evolución del Tamaño del Sistema</span>
          </div>
          <div className="p-4 h-full pb-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="periodo" />
                <YAxis tickFormatter={(val) => `$${(val / 1e12).toFixed(1)}T`} />
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                <Legend />
                <Area type="monotone" dataKey="total_assets" stroke="#000080" fill="#000080" fillOpacity={0.1} name="Activo Total" />
                <Area type="monotone" dataKey="total_net_worth" stroke="#008000" fill="#008000" fillOpacity={0.1} name="P. Neto Total" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Solvency Trend */}
        <div className="window bg-white h-[400px]">
          <div className="title-bar !bg-purple-700 flex items-center gap-2 text-white">
            <TrendingUp className="w-4 h-4" />
            <span>Tendencia de Solvencia del Sistema (%)</span>
          </div>
          <div className="p-4 h-full pb-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="periodo" />
                <YAxis unit="%" domain={[0, 'auto']} tickFormatter={(val) => `${val.toFixed(1)}%`} />
                <Tooltip formatter={(val: number) => [`${val.toFixed(2)}%`, "Solvencia"]} />
                <Legend />
                <Line type="monotone" dataKey="avg_solvency" stroke="#7e22ce" strokeWidth={3} name="Solvencia Promedio (%)" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Ranking */}
        <div className="window bg-white h-[450px]">
          <div className="title-bar !bg-black flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span>Ranking de Entidades (Top 10 por Activos)</span>
          </div>
          <div className="p-4 h-full pb-12">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEntities} layout="vertical" margin={{ left: 160 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(val) => `$${(val / 1e12).toFixed(1)}T`} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 9 }} />
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                <Legend />
                <Bar dataKey="assets" fill="#000080" name="Activos Totales" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Share Pie */}
        <div className="window bg-white h-[450px]">
          <div className="title-bar !bg-retro-green flex items-center gap-2">
            <PieIcon className="w-4 h-4" />
            <span>Market Share (Activos)</span>
          </div>
          <div className="p-4 h-full pb-12">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name.substring(0, 10)} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Central de Deudores - Sistema Completo */}
      {debtPieData.length > 0 && systemDebtors && (
        <div className="window bg-white h-[450px]">
          <div className="title-bar !bg-[#ef4444] !text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Central de Deudores - Sistema Financiero Completo</span>
            </div>
            <span className="text-[10px] font-mono opacity-80">
              {systemDebtors.entity_count} entidades · {new Intl.NumberFormat('es-AR').format(systemDebtors.total_debtors)} deudores · {formatCurrency(systemDebtors.total_debt)} total
            </span>
          </div>
          <div className="p-4 h-full pb-12 flex flex-col md:flex-row gap-4">
            {/* Pie chart */}
            <div className="flex-1 h-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={debtPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 70}
                    outerRadius={typeof window !== 'undefined' && window.innerWidth < 768 ? 70 : 110}
                    labelLine={false}
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {debtPieData.map((entry, index) => (
                      <Cell key={`debt-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Summary stats */}
            <div className="flex flex-col gap-2 justify-center md:w-[280px] shrink-0">
              <div className="bg-green-50 border-2 border-green-300 p-3 shadow-button">
                <div className="text-[10px] uppercase font-bold opacity-60">Cartera Normal (Sit 1)</div>
                <div className="text-lg font-bold text-green-700">{formatCurrency(systemDebtors.debt_sit_1)}</div>
                <div className="text-[10px] opacity-50">{(systemDebtors.debt_sit_1 / systemDebtors.total_debt * 100).toFixed(1)}% del total</div>
              </div>
              <div className="bg-red-50 border-2 border-red-300 p-3 shadow-button">
                <div className="text-[10px] uppercase font-bold opacity-60">Cartera Irregular (Sit 2-5)</div>
                <div className="text-lg font-bold text-red-700">{formatCurrency(
                  (systemDebtors.debt_sit_2 || 0) + (systemDebtors.debt_sit_3 || 0) + (systemDebtors.debt_sit_4 || 0) + (systemDebtors.debt_sit_5 || 0)
                )}</div>
                <div className="text-[10px] opacity-50">{systemMorosidad.toFixed(2)}% del total (morosidad)</div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-300 p-3 shadow-button">
                <div className="text-[10px] uppercase font-bold opacity-60">Garantías (Sit 11)</div>
                <div className="text-lg font-bold text-blue-700">{formatCurrency(systemDebtors.debt_sit_11)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
