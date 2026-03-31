import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

interface Entity {
  uri: string;
  name: string;
  annotations?: {
    latest_assets?: number;
  };
}

interface Balance {
  entity_code: string;
  entity_name: string;
  year: number;
  month: number;
  assets: number;
  liabilities: number;
  net_worth: number;
  line_items?: any[];
}

interface MCPContextType {
  entities: Entity[];
  marketData: any[];
  balancesCache: Record<string, Balance[]>;
  loadingEntities: boolean;
  loadingMarket: boolean;
  fetchEntities: () => Promise<void>;
  fetchMarketData: () => Promise<void>;
  fetchBalances: (id: string) => Promise<Balance[]>;
  lastSyncDate: string | null;
  fetchLastSyncDate: () => Promise<void>;
  recentlyViewed: { id: string; name: string }[];
  addToRecentlyViewed: (id: string, name: string) => void;
  // Agro
  agroData: any[];
  agroHistory: Record<string, any[]>;
  loadingAgro: boolean;
  fetchAgroData: () => Promise<void>;
  fetchAgroHistory: (ticker: string, days?: number, startDate?: string, endDate?: string) => Promise<any[]>;
  syncAgroPrices: () => Promise<void>;
}

const MCPContext = createContext<MCPContextType | undefined>(undefined);

export const MCPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [balancesCache, setBalancesCache] = useState<Record<string, Balance[]>>({});
  
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [hasFetchedEntities, setHasFetchedEntities] = useState(false);
  const [hasFetchedMarket, setHasFetchedMarket] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<{ id: string; name: string }[]>(() => {
    const saved = localStorage.getItem('recentlyViewedEntities');
    return saved ? JSON.parse(saved) : [];
  });

  // Agro State
  const [agroData, setAgroData] = useState<any[]>([]);
  const [agroHistory, setAgroHistory] = useState<Record<string, any[]>>({});
  const [loadingAgro, setLoadingAgro] = useState(false);
  const [hasFetchedAgro, setHasFetchedAgro] = useState(false);

  // Refs to prevent infinite loops by removing state dependencies from fetchers
  const isFetchingEntities = useRef(false);
  const isFetchingMarket = useRef(false);
  const isFetchingAgro = useRef(false);

  const callMCP = async (method: string, params: any = {}) => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const response = await fetch(`${apiBaseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: Date.now(),
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.result;
  };

  const fetchEntities = useCallback(async () => {
    if (hasFetchedEntities || isFetchingEntities.current) return; 
    isFetchingEntities.current = true;
    setLoadingEntities(true);
    try {
      const result = await callMCP('resources/list');
      const resources = result.resources || [];
      setEntities(resources);
      setHasFetchedEntities(true);
    } catch (e) {
      console.error("Error fetching entities:", e);
      setHasFetchedEntities(true); 
    } finally {
      setLoadingEntities(false);
      isFetchingEntities.current = false;
    }
  }, [hasFetchedEntities]);

  const fetchMarketData = useCallback(async () => {
    if (hasFetchedMarket || isFetchingMarket.current) return;
    isFetchingMarket.current = true;
    setLoadingMarket(true);
    try {
      const result = await callMCP('tools/call', { name: 'get_market_overview' });
      if (result.content?.[0]?.text) {
        const data = JSON.parse(result.content[0].text);
        setMarketData(data.history || []);
      }
      setHasFetchedMarket(true);
    } catch (e) {
      console.error("Error fetching market data:", e);
      setHasFetchedMarket(true);
    } finally {
      setLoadingMarket(false);
      isFetchingMarket.current = false;
    }
  }, [hasFetchedMarket]);

  const fetchLastSyncDate = useCallback(async () => {
    try {
      const result = await callMCP('tools/call', { name: 'get_last_sync_date' });
      const text = result.content?.[0]?.text;
      if (text) {
        setLastSyncDate(text);
      }
    } catch (e) {
      console.error("Error fetching last sync date:", e);
    }
  }, []);

  const fetchBalances = useCallback(async (id: string) => {
    if (balancesCache[id]) {
      return balancesCache[id];
    }
    
    try {
      const result = await callMCP('resources/read', { uri: `finargentina://statements/${id}` });
      const content = result.contents?.[0];
      if (content && content.text) {
        const data = JSON.parse(content.text);
        setBalancesCache(prev => ({ ...prev, [id]: data }));
        return data;
      }
      setBalancesCache(prev => ({ ...prev, [id]: [] }));
      return [];
    } catch (e) {
      console.error("Error fetching balances for:", id, e);
      setBalancesCache(prev => ({ ...prev, [id]: [] }));
      return [];
    }
  }, [balancesCache]);

  const addToRecentlyViewed = useCallback((id: string, name: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(e => e.id !== id);
      const updated = [{ id, name }, ...filtered].slice(0, 6);
      localStorage.setItem('recentlyViewedEntities', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Agro methods
  const fetchAgroData = useCallback(async () => {
    if (hasFetchedAgro || isFetchingAgro.current) return;
    isFetchingAgro.current = true;
    setLoadingAgro(true);
    try {
      const result = await callMCP('tools/call', { name: 'get_agro_prices' });
      const text = result.content?.[0]?.text;
      if (text) {
        setAgroData(JSON.parse(text));
      }
      setHasFetchedAgro(true);
    } catch (e) {
      console.error("Error fetching agro data:", e);
    } finally {
      setLoadingAgro(false);
      isFetchingAgro.current = false;
    }
  }, [hasFetchedAgro]);

  const fetchAgroHistory = useCallback(async (ticker: string, days: number = 30, startDate?: string, endDate?: string) => {
    try {
      const result = await callMCP('tools/call', { 
        name: 'get_agro_history', 
        arguments: { ticker, days, startDate, endDate } 
      });
      const text = result.content?.[0]?.text;
      if (text) {
        const data = JSON.parse(text);
        setAgroHistory(prev => ({ ...prev, [ticker]: data }));
        return data;
      }
      return [];
    } catch (e) {
      console.error("Error fetching agro history for:", ticker, e);
      return [];
    }
  }, []);

  const syncAgroPrices = useCallback(async () => {
    try {
      await callMCP('tools/call', { name: 'sync_agro_prices' });
    } catch (e) {
      console.error("Error syncing agro prices:", e);
      throw e;
    }
  }, []);

  return (
    <MCPContext.Provider value={{
      entities,
      marketData,
      balancesCache,
      loadingEntities,
      loadingMarket,
      fetchEntities,
      fetchMarketData,
      fetchBalances,
      lastSyncDate,
      fetchLastSyncDate,
      recentlyViewed,
      addToRecentlyViewed,
      agroData,
      agroHistory,
      loadingAgro,
      fetchAgroData,
      fetchAgroHistory,
      syncAgroPrices
    }}>
      {children}
    </MCPContext.Provider>
  );
};

export const useMCPContext = () => {
  const context = useContext(MCPContext);
  if (!context) throw new Error('useMCPContext must be used within MCPProvider');
  return context;
};
