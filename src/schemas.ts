import { z } from "zod";

export const getQuoteSchema = z.object({
  symbol: z.string().min(1).max(10).describe("Stock ticker symbol (e.g., AAPL, GOOGL, MSFT)"),
});

export const getHistoricalSchema = z.object({
  symbol: z.string().min(1).max(10).describe("Stock ticker symbol (e.g., AAPL, GOOGL)"),
  period: z
    .enum(["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "max"])
    .default("1mo")
    .describe("Time period for historical data"),
  interval: z.enum(["1d", "1wk", "1mo"]).default("1d").describe("Data interval"),
});

export const getFinancialsSchema = z.object({
  symbol: z.string().min(1).max(10).describe("Stock ticker symbol"),
  statement: z.enum(["income", "balance", "cashflow"]).describe("Type of financial statement"),
  quarterly: z.boolean().default(false).describe("Get quarterly data instead of annual"),
});

export const getCompanyInfoSchema = z.object({
  symbol: z.string().min(1).max(10).describe("Stock ticker symbol"),
});

export const searchSymbolsSchema = z.object({
  query: z.string().min(1).describe("Search query (company name or keywords)"),
});

export const getNewsSchema = z.object({
  symbol: z.string().min(1).max(10).describe("Stock ticker symbol"),
});
