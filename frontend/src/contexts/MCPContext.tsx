import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
}

const MCPContext = createContext<MCPContextType | undefined>(undefined);

export const MCPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [balancesCache, setBalancesCache] = useState<Record<string, Balance[]>>({});
  
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [loadingMarket, setLoadingMarket] = useState(false);

  const callMCP = async (method: string, params: any = {}) => {
    const response = await fetch('http://localhost:8080/mcp', {
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
    if (entities.length > 0) return; // Simple cache
    setLoadingEntities(true);
    try {
      const result = await callMCP('resources/list');
      setEntities(result.resources || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEntities(false);
    }
  }, [entities]);

  const fetchMarketData = useCallback(async () => {
    if (marketData.length > 0) return; // Simple cache
    setLoadingMarket(true);
    try {
      const result = await callMCP('tools/call', { name: 'get_market_overview' });
      if (result.content?.[0]?.text) {
        const data = JSON.parse(result.content[0].text);
        setMarketData(data.history || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMarket(false);
    }
  }, [marketData]);

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
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [balancesCache]);

  return (
    <MCPContext.Provider value={{
      entities,
      marketData,
      balancesCache,
      loadingEntities,
      loadingMarket,
      fetchEntities,
      fetchMarketData,
      fetchBalances
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
