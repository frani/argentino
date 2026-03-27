package scraper

type BCRAEntity struct {
	Codigo       int     `json:"codigo"`
	Denominacion string  `json:"denominacion"`
	LatestAssets float64 `json:"latest_assets,omitempty"`
}

type MarketPeriod struct {
	Year             int     `json:"year"`
	Month            int     `json:"month"`
	TotalAssets      float64 `json:"total_assets"`
	TotalLiabilities float64 `json:"total_liabilities"`
	TotalNetWorth    float64 `json:"total_net_worth"`
	AvgSolvency      float64 `json:"avg_solvency"`
	EntityCount      int     `json:"entity_count"`
}

type MarketOverview struct {
	History []MarketPeriod `json:"history"`
}

type BCRAApiResponse struct {
	Success   bool         `json:"success"`
	Entidades []BCRAEntity `json:"entidades"`
}

type LineItem struct {
	Label       string  `json:"label"`
	Indentation int     `json:"indentation"`
	Value       float64 `json:"value"`
}

type EntityBalance struct {
	EntityCode  string     `json:"entity_code"`
	EntityName  string     `json:"entity_name"`
	Year        int        `json:"year"`
	Month       int        `json:"month"`
	Assets      float64    `json:"assets"`
	Liabilities float64    `json:"liabilities"`
	NetWorth    float64    `json:"net_worth"`
	LineItems   []LineItem `json:"line_items"`
}
