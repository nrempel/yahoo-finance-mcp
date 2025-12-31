import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  handleGetQuote,
  handleGetHistorical,
  handleGetFinancials,
  handleGetCompanyInfo,
  handleSearchSymbols,
  handleGetNews,
} from "./handlers.js";
import {
  getQuoteSchema,
  getHistoricalSchema,
  getFinancialsSchema,
  getCompanyInfoSchema,
  searchSymbolsSchema,
  getNewsSchema,
} from "./schemas.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "yahoo-finance",
    version: "1.0.0",
  });

  server.registerTool(
    "get_quote",
    {
      description: "Get real-time stock quote data including price, change, volume, and key metrics",
      inputSchema: getQuoteSchema.shape,
    },
    async ({ symbol }) => handleGetQuote(symbol)
  );

  server.registerTool(
    "get_historical",
    {
      description: "Get historical OHLCV (Open, High, Low, Close, Volume) price data",
      inputSchema: getHistoricalSchema.shape,
    },
    async ({ symbol, period, interval }) => handleGetHistorical(symbol, period, interval)
  );

  server.registerTool(
    "get_financials",
    {
      description: "Get company financial statements (income statement, balance sheet, or cash flow)",
      inputSchema: getFinancialsSchema.shape,
    },
    async ({ symbol, statement, quarterly }) => handleGetFinancials(symbol, statement, quarterly)
  );

  server.registerTool(
    "get_company_info",
    {
      description: "Get company profile including sector, industry, description, and key statistics",
      inputSchema: getCompanyInfoSchema.shape,
    },
    async ({ symbol }) => handleGetCompanyInfo(symbol)
  );

  server.registerTool(
    "search_symbols",
    {
      description: "Search for stock symbols by company name or keywords",
      inputSchema: searchSymbolsSchema.shape,
    },
    async ({ query }) => handleSearchSymbols(query)
  );

  server.registerTool(
    "get_news",
    {
      description: "Get latest news for a stock symbol",
      inputSchema: getNewsSchema.shape,
    },
    async ({ symbol }) => handleGetNews(symbol)
  );

  return server;
}
