import React from 'react';
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
  Line
} from 'recharts';
import { TrendingUp, BarChart3, Calculator } from 'lucide-react';

interface LineItem {
  label: string;
  indentation: number;
  value: number;
}

interface Balance {
  entity_code: string;
  entity_name: string;
  year: number;
  month: number;
  assets: number;
  liabilities: number;
  net_worth: number;
  line_items?: LineItem[];
}

interface EntityAnalysisProps {
  balances: Balance[];
}

export const EntityAnalysis: React.FC<EntityAnalysisProps> = ({ balances }) => {
  // Helper to find value by label (normalized matching)
  const getValue = (b: Balance, labels: string[]) => {
    const normalize = (s: string) => s.replace(/[\s\.]+/g, '').toUpperCase();
    const targetLabels = labels.map(normalize);

    const item = b.line_items?.find(li => {
      const normalizedItemLabel = normalize(li.label);
      return targetLabels.some(tl => normalizedItemLabel.includes(tl));
    });
    return item?.value || 0;
  };

  // Sort balances chronologically
  const sortedBalances = [...balances].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const latest = [...balances].sort((a, b) => (b.year * 100 + b.month) - (a.year * 100 + a.month))[0];

  const processedData = sortedBalances.map(b => {
    const netIncome = getValue(b, ["RDOS", "RESULTADO"]);
    const deposits = getValue(b, ["DEPÓSITOS", "DEPOSITOS"]);
    const cash = getValue(b, ["EFECTIVO", "DISPONIBILIDADES"]);
    const nonPerforming = getValue(b, ["PREVISIONES", "CARTERA IRREGULAR"]);
    
    const assets = b.assets || getValue(b, ["ACTIVO"]);
    const netWorth = b.net_worth || getValue(b, ["PATRIMONIONETO"]);

    return {
      periodo: `${b.month}/${b.year}`,
      activo: assets,
      pasivo: b.liabilities,
      patrimonio: netWorth,
      roa: assets > 0 ? (netIncome / assets) * 100 : 0,
      roe: netWorth > 0 ? (netIncome / netWorth) * 100 : 0,
      liquidez: deposits > 0 ? (cash / deposits) * 100 : 0,
      morosidad: assets > 0 ? (Math.abs(nonPerforming) / assets) * 100 : 0,
    };
  });

  const current = processedData[processedData.length - 1] || { roa: 0, roe: 0, liquidez: 0, morosidad: 0 };
  
  const basicRatios = {
    solvency: latest?.assets > 0 ? (latest.net_worth / latest.assets) * 100 : 0,
    leverage: latest?.net_worth > 0 ? latest.liabilities / latest.net_worth : 0,
  };

  const formatCurrency = (val: number) => {
    if (val === 0 || val === undefined) return "-";
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(val);
  };

  const formatDateLabel = (year: number, month: number) => {
    if (!year || !month) return "N/A";
    try {
      return new Intl.DateTimeFormat('es-AR', { month: 'short', year: 'numeric' })
        .format(new Date(year, month - 1))
        .replace(/^\w/, c => c.toUpperCase());
    } catch (e) {
      return `${month}/${year}`;
    }
  };

  const allRows: { label: string; indentation: number }[] = [];
  const rowMap = new Map<string, { label: string; indentation: number }>();

  const referenceBalance = balances.reduce((prev, current) => 
    (prev.line_items?.length || 0) > (current.line_items?.length || 0) ? prev : current
  , balances[0]);

  referenceBalance.line_items?.forEach(item => {
    if (!rowMap.has(item.label)) {
      rowMap.set(item.label, { label: item.label, indentation: item.indentation });
      allRows.push({ label: item.label, indentation: item.indentation });
    }
  });

  if (!latest) return <div className="p-4 italic text-center text-retro-blue">No hay datos disponibles.</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Indicadores de Gestión */}
      <div className="window bg-pastel-green">
        <div className="title-bar !bg-retro-green flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          <span>Indicadores de Gestión (CAMELS) - {latest.month}/{latest.year}</span>
        </div>
        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: "Solvencia (PN/Act)", val: basicRatios.solvency.toFixed(2) + "%", color: "text-retro-blue" },
             { label: "ROA (Período)", val: current.roa.toFixed(2) + "%", color: current.roa >= 0 ? "text-green-700" : "text-red-700" },
             { label: "ROE (Período)", val: current.roe.toFixed(2) + "%", color: current.roe >= 0 ? "text-green-700" : "text-red-700" },
             { label: "Liquidez/Depósitos", val: current.liquidez.toFixed(1) + "%", color: "text-blue-700" },
             { label: "Apalancamiento", val: basicRatios.leverage.toFixed(2) + "x", color: "text-black" },
             { label: "Morosidad/Activo", val: current.morosidad.toFixed(2) + "%", color: "text-red-600" }
           ].map((r, i) => (
             <div key={i} className="bg-white p-2 border-2 border-black shadow-button flex flex-col items-center">
               <span className="text-[10px] uppercase font-bold opacity-60 text-center">{r.label}</span>
               <span className={`text-xl font-bold ${r.color}`}>{r.val}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="window bg-white h-[350px]">
          <div className="title-bar !bg-retro-blue flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Patrimonio y Pasivos</span>
          </div>
          <div className="p-4 h-full pb-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="periodo" />
                <YAxis tickFormatter={(val) => `$${(val/1e6).toFixed(0)}M`} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="activo" stroke="#000080" fill="#000080" fillOpacity={0.1} name="Activo" />
                <Area type="monotone" dataKey="pasivo" stroke="#ff0000" fill="#ff0000" fillOpacity={0.05} name="Pasivo" />
                <Area type="monotone" dataKey="patrimonio" stroke="#008000" fill="#008000" fillOpacity={0.05} name="P. Neto" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="window bg-white h-[350px]">
          <div className="title-bar !bg-pastel-pink !text-black flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Rentabilidad (%)</span>
          </div>
          <div className="p-4 h-full pb-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="periodo" />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="roa" stroke="#10b981" strokeWidth={2} name="ROA (%)" />
                <Line type="monotone" dataKey="roe" stroke="#ec4899" strokeWidth={2} name="ROE (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="window bg-white shadow-button">
        <div className="title-bar !bg-black flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          <span>Estado de Situación Patrimonial y de Resultados (Detallado)</span>
        </div>
        <div className="p-0 overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-retro">
          <table className="w-full border-collapse text-[11px] font-mono leading-tight">
            <thead className="sticky top-0 bg-gray-200 z-10 shadow-sm">
              <tr className="border-b-2 border-black">
                <th className="p-2 border-r border-black text-left w-[45%] bg-gray-300">Rubro / Cuenta</th>
                {sortedBalances.map(b => (
                  <th key={`${b.month}-${b.year}`} className="p-2 border-r border-black text-right whitespace-nowrap min-w-[100px]">
                    {formatDateLabel(b.year, b.month)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allRows.map((row, rowIndex) => (
                <tr key={rowIndex} className={`border-b border-gray-200 hover:bg-yellow-50 ${row.indentation <= 1 ? 'font-bold bg-gray-50' : ''}`}>
                  <td className="p-1 border-r border-gray-300 truncate whitespace-pre" style={{ paddingLeft: `${row.indentation * 12 + 4}px` }}>
                    {row.label}
                  </td>
                  {sortedBalances.map(b => {
                    const item = b.line_items?.find(li => li.label === row.label);
                    return (
                      <td key={`${b.month}-${b.year}`} className={`p-1 border-r border-gray-200 text-right ${item && item.value < 0 ? 'text-red-600' : ''}`}>
                        {item ? formatCurrency(item.value) : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
