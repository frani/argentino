import React from 'react';
import { Window, RetroButton } from './RetroUI';
import { Globe, LayoutGrid, DollarSign, Columns, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-4 animate-in fade-in duration-500">
      <Window title="Argentino - Bienvenido" className="bg-white">
        <div className="p-4 md:p-8 flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 border-4 border-black shadow-button flex flex-col mb-2 rotate-3 hover:rotate-0 transition-transform overflow-hidden relative">
            <div className="h-1/3 bg-[#74ACDF]"></div>
            <div className="h-1/3 bg-white"></div>
            <div className="h-1/3 bg-[#74ACDF]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-4xl font-black text-[#F6B40E]">AR</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase italic">
              Argentino
            </h1>
            <p className="text-lg md:text-xl font-bold px-4 py-2 inline-block text-yellow-500">
              Metricas, datos y Analisis
            </p>
          </div>

          <p className="max-w-2xl text-base md:text-lg leading-relaxed font-medium">
            Encontrá analisis de bancos, indices economicos, cotizaciones del dolar y mucho mas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4">
            <div className="p-4 flex flex-col items-center gap-2">
              <TrendingUp className="w-8 h-8 text-pink-500" />
              <h3 className="font-bold uppercase text-sm text-pink-500">Mercado Real</h3>
              <p className="text-xs">Seguimiento de índices macroeconómicos y tendencias del sistema.</p>
            </div>
            <div className="p-4 flex flex-col items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-green-500" />
              <h3 className="font-bold uppercase text-sm text-green-500">Transparencia</h3>
              <p className="text-xs">Análisis detallado de balances y solvencia de entidades bancarias.</p>
            </div>
            <div className="p-4 flex flex-col items-center gap-2">
              <Zap className="w-8 h-8 text-blue-500" />
              <h3 className="font-bold uppercase text-sm text-blue-500">Agilidad</h3>
              <p className="text-xs">Datos actualizados del BCRA y cotización del dólar en tiempo real.</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link to="/general">
              <RetroButton className="px-8 py-3 text-lg font-black bg-retro-blue text-white">
                EXPLORAR SISTEMA
              </RetroButton>
            </Link>
            <Link to="/dolar">
              <RetroButton className="px-8 py-3 text-lg font-black bg-pastel-green text-black">
                VER DÓLAR
              </RetroButton>
            </Link>
          </div>
        </div>
      </Window>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Window title="¿Qué podés hacer?" className="bg-pastel-yellow">
          <ul className="space-y-3 p-2 font-bold text-sm">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-black rounded-full" />
              Consultar el ranking de bancos por activos.
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-black rounded-full" />
              Analizar la solvencia y gastos de cada entidad.
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-black rounded-full" />
              Comparar múltiples entidades cara a cara.
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-black rounded-full" />
              Visualizar flujos contables con diagramas Sankey.
            </li>
          </ul>
        </Window>

        <Window title="Estado del Sistema" className="bg-pastel-blue">
          <div className="p-2 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b-2 border-black/10 pb-2">
              <span className="text-xs font-bold uppercase">Conectividad BCRA</span>
              <span className="bg-green-400 px-2 py-0.5 text-[10px] font-black border border-black shadow-[1px_1px_0px_black]">ONLINE</span>
            </div>
            <div className="flex justify-between items-center border-b-2 border-black/10 pb-2">
              <span className="text-xs font-bold uppercase">Datos de Mercado</span>
              <span className="bg-green-400 px-2 py-0.5 text-[10px] font-black border border-black shadow-[1px_1px_0px_black]">ACTUALIZADOS</span>
            </div>
            <div className="text-[10px] italic opacity-60">
              * Los datos son obtenidos de fuentes públicas oficiales y actualizados diariamente para brindarte la mejor información.
            </div>
          </div>
        </Window>
      </div>
    </div>
  );
};
