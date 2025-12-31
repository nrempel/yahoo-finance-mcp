import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleGetQuote,
  handleGetHistorical,
  handleGetFinancials,
  handleGetCompanyInfo,
  handleSearchSymbols,
  handleGetNews,
  getStartDate,
} from "./handlers.js";

const { mockQuote, mockChart, mockQuoteSummary, mockSearch, mockFundamentalsTimeSeries } =
  vi.hoisted(() => ({
    mockQuote: vi.fn(),
    mockChart: vi.fn(),
    mockQuoteSummary: vi.fn(),
    mockSearch: vi.fn(),
    mockFundamentalsTimeSeries: vi.fn(),
  }));

vi.mock("yahoo-finance2", () => ({
  default: {
    quote: mockQuote,
    chart: mockChart,
    quoteSummary: mockQuoteSummary,
    search: mockSearch,
    fundamentalsTimeSeries: mockFundamentalsTimeSeries,
  },
}));

describe("getStartDate", () => {
  it("should return correct date for 1d period", () => {
    const now = Date.now();
    const result = getStartDate("1d");
    const diff = now - result.getTime();

    expect(diff).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(diff).toBeLessThan(25 * 60 * 60 * 1000);
  });

  it("should return correct date for 5d period", () => {
    const now = Date.now();
    const result = getStartDate("5d");
    const diff = now - result.getTime();

    expect(diff).toBeGreaterThan(4.9 * 24 * 60 * 60 * 1000);
    expect(diff).toBeLessThan(5.1 * 24 * 60 * 60 * 1000);
  });

  it("should return correct date for 1y period", () => {
    const now = Date.now();
    const result = getStartDate("1y");
    const diff = now - result.getTime();

    expect(diff).toBeGreaterThan(364 * 24 * 60 * 60 * 1000);
    expect(diff).toBeLessThan(366 * 24 * 60 * 60 * 1000);
  });

  it("should return epoch start for max period", () => {
    const result = getStartDate("max");
    expect(result.getUTCFullYear()).toBe(1970);
    expect(result.getUTCMonth()).toBe(0);
    expect(result.getUTCDate()).toBe(1);
  });

  it("should default to 1mo for unknown period", () => {
    const now = Date.now();
    const result = getStartDate("unknown");
    const diff = now - result.getTime();

    expect(diff).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
    expect(diff).toBeLessThan(31 * 24 * 60 * 60 * 1000);
  });
});

describe("handleGetQuote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return formatted quote data", async () => {
    const quoteData = {
      symbol: "AAPL",
      shortName: "Apple Inc.",
      regularMarketPrice: 150.25,
      regularMarketChange: 2.5,
      regularMarketChangePercent: 1.69,
      regularMarketVolume: 50000000,
      marketCap: 2400000000000,
      trailingPE: 25.5,
      fiftyTwoWeekHigh: 180.0,
      fiftyTwoWeekLow: 120.0,
      averageDailyVolume3Month: 60000000,
      regularMarketOpen: 148.0,
      regularMarketPreviousClose: 147.75,
      regularMarketDayHigh: 151.0,
      regularMarketDayLow: 147.5,
    };

    mockQuote.mockResolvedValue(quoteData as any);

    const result = await handleGetQuote("aapl");
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(data.symbol).toBe("AAPL");
    expect(data.name).toBe("Apple Inc.");
    expect(data.price).toBe(150.25);
    expect(data.change).toBe(2.5);
    expect(data.marketCap).toBe(2400000000000);
    expect(mockQuote).toHaveBeenCalledWith("AAPL");
  });

  it("should handle errors and return isError flag", async () => {
    mockQuote.mockRejectedValue(new Error("Symbol not found"));

    const result = await handleGetQuote("INVALID");

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Error fetching quote");
    expect(result.content[0].text).toContain("Symbol not found");
  });

  it("should uppercase the symbol", async () => {
    mockQuote.mockResolvedValue({ symbol: "MSFT" } as any);

    await handleGetQuote("msft");

    expect(mockQuote).toHaveBeenCalledWith("MSFT");
  });
});

describe("handleGetHistorical", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return formatted historical data", async () => {
    const chartData = {
      meta: { symbol: "AAPL", currency: "USD" },
      quotes: [
        {
          date: new Date("2024-01-01"),
          open: 145,
          high: 148,
          low: 144,
          close: 147,
          volume: 1000000,
        },
        {
          date: new Date("2024-01-02"),
          open: 147,
          high: 150,
          low: 146,
          close: 149,
          volume: 1200000,
        },
      ],
    };

    mockChart.mockResolvedValue(chartData as any);

    const result = await handleGetHistorical("AAPL", "5d", "1d");
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(data.symbol).toBe("AAPL");
    expect(data.currency).toBe("USD");
    expect(data.data).toHaveLength(2);
    expect(data.data[0].close).toBe(147);
  });

  it("should handle errors", async () => {
    mockChart.mockRejectedValue(new Error("Network error"));

    const result = await handleGetHistorical("AAPL", "5d", "1d");

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Error fetching historical data");
  });
});

describe("handleGetFinancials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return income statement data using fundamentalsTimeSeries", async () => {
    const mockStatements = [
      { date: new Date("2023-12-31"), totalRevenue: 400000000000, netIncome: 100000000000 },
      { date: new Date("2022-12-31"), totalRevenue: 380000000000, netIncome: 95000000000 },
    ];

    mockFundamentalsTimeSeries.mockResolvedValue(mockStatements);

    const result = await handleGetFinancials("AAPL", "income", false);
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(data.statements).toHaveLength(2);
    expect(data.statements[0].totalRevenue).toBe(400000000000);
    expect(data.type).toBe("income");
    expect(data.quarterly).toBe(false);
    expect(mockFundamentalsTimeSeries).toHaveBeenCalledWith(
      "AAPL",
      expect.objectContaining({ type: "annual", module: "financials" }),
      { validateResult: false }
    );
  });

  it("should request quarterly data when specified", async () => {
    mockFundamentalsTimeSeries.mockResolvedValue([]);

    const result = await handleGetFinancials("AAPL", "income", true);
    const data = JSON.parse(result.content[0].text);

    expect(data.quarterly).toBe(true);
    expect(mockFundamentalsTimeSeries).toHaveBeenCalledWith(
      "AAPL",
      expect.objectContaining({ type: "quarterly", module: "financials" }),
      { validateResult: false }
    );
  });

  it("should handle balance sheet using fundamentalsTimeSeries", async () => {
    const mockStatements = [{ date: new Date("2023-12-31"), totalAssets: 500000000000 }];

    mockFundamentalsTimeSeries.mockResolvedValue(mockStatements);

    const result = await handleGetFinancials("AAPL", "balance", false);
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(data.statements).toHaveLength(1);
    expect(data.type).toBe("balance");
    expect(mockFundamentalsTimeSeries).toHaveBeenCalledWith(
      "AAPL",
      expect.objectContaining({ module: "balance-sheet" }),
      { validateResult: false }
    );
  });

  it("should handle cashflow using fundamentalsTimeSeries", async () => {
    const mockStatements = [{ date: new Date("2023-12-31"), operatingCashFlow: 100000000000 }];

    mockFundamentalsTimeSeries.mockResolvedValue(mockStatements);

    const result = await handleGetFinancials("AAPL", "cashflow", false);
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(data.statements).toHaveLength(1);
    expect(data.type).toBe("cashflow");
    expect(mockFundamentalsTimeSeries).toHaveBeenCalledWith(
      "AAPL",
      expect.objectContaining({ module: "cash-flow" }),
      { validateResult: false }
    );
  });

  it("should handle errors from fundamentalsTimeSeries", async () => {
    mockFundamentalsTimeSeries.mockRejectedValue(new Error("API error"));

    const result = await handleGetFinancials("AAPL", "income", false);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Error fetching financials");
  });
});

describe("handleGetCompanyInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return company info with name from price module", async () => {
    const mockSummary = {
      assetProfile: {
        sector: "Technology",
        industry: "Consumer Electronics",
        website: "https://www.apple.com",
        fullTimeEmployees: 164000,
        longBusinessSummary: "Apple Inc. designs...",
        country: "United States",
        city: "Cupertino",
      },
      defaultKeyStatistics: {
        beta: 1.2,
        priceToBook: 40.5,
      },
      summaryDetail: {
        dividendYield: 0.005,
      },
      price: {
        shortName: "Apple Inc.",
        longName: "Apple Inc.",
      },
    };

    mockQuoteSummary.mockResolvedValue(mockSummary as any);

    const result = await handleGetCompanyInfo("AAPL");
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(data.name).toBe("Apple Inc.");
    expect(data.sector).toBe("Technology");
    expect(data.industry).toBe("Consumer Electronics");
    expect(data.employees).toBe(164000);
    expect(data.keyStats.beta).toBe(1.2);
  });

  it("should handle missing price module gracefully", async () => {
    const mockSummary = {
      assetProfile: { sector: "Technology" },
      defaultKeyStatistics: {},
      summaryDetail: {},
    };

    mockQuoteSummary.mockResolvedValue(mockSummary as any);

    const result = await handleGetCompanyInfo("AAPL");
    const data = JSON.parse(result.content[0].text);

    expect(data.name).toBeUndefined();
    expect(data.sector).toBe("Technology");
  });

  it("should handle errors", async () => {
    mockQuoteSummary.mockRejectedValue(new Error("API error"));

    const result = await handleGetCompanyInfo("INVALID");

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Error fetching company info");
  });
});

describe("handleSearchSymbols", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should filter and return only EQUITY type results", async () => {
    const searchData = {
      quotes: [
        { symbol: "AAPL", shortname: "Apple Inc.", exchange: "NASDAQ", quoteType: "EQUITY" },
        { symbol: "AAPL230120C00150000", shortname: "AAPL Option", quoteType: "OPTION" },
        { symbol: "APLE", shortname: "Apple Hospitality", exchange: "NYSE", quoteType: "EQUITY" },
      ],
      news: [],
    };

    mockSearch.mockResolvedValue(searchData as any);

    const result = await handleSearchSymbols("apple");
    const data = JSON.parse(result.content[0].text);

    expect(data).toHaveLength(2);
    expect(data[0].symbol).toBe("AAPL");
    expect(data[1].symbol).toBe("APLE");
  });

  it("should handle empty results", async () => {
    mockSearch.mockResolvedValue({ quotes: [], news: [] } as any);

    const result = await handleSearchSymbols("xyznotfound");
    const data = JSON.parse(result.content[0].text);

    expect(data).toHaveLength(0);
  });

  it("should handle errors", async () => {
    mockSearch.mockRejectedValue(new Error("Search failed"));

    const result = await handleSearchSymbols("test");

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Error searching for");
  });
});

describe("handleGetNews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return formatted news items", async () => {
    const newsSearchData = {
      quotes: [],
      news: [
        {
          title: "Apple announces new iPhone",
          publisher: "Reuters",
          link: "https://example.com/news/1",
          providerPublishTime: new Date("2024-01-15T10:00:00Z"),
        },
        {
          title: "Apple stock rises",
          publisher: "Bloomberg",
          link: "https://example.com/news/2",
          providerPublishTime: new Date("2024-01-15T11:00:00Z"),
        },
      ],
    };

    mockSearch.mockResolvedValue(newsSearchData as any);

    const result = await handleGetNews("AAPL");
    const data = JSON.parse(result.content[0].text);

    expect(data).toHaveLength(2);
    expect(data[0].title).toBe("Apple announces new iPhone");
    expect(data[0].publisher).toBe("Reuters");
    expect(data[0].link).toBe("https://example.com/news/1");
  });

  it("should handle no news", async () => {
    mockSearch.mockResolvedValue({ quotes: [], news: [] } as any);

    const result = await handleGetNews("AAPL");
    const data = JSON.parse(result.content[0].text);

    expect(data).toHaveLength(0);
  });

  it("should handle undefined news array", async () => {
    mockSearch.mockResolvedValue({ quotes: [] } as any);

    const result = await handleGetNews("AAPL");
    const data = JSON.parse(result.content[0].text);

    expect(data).toHaveLength(0);
  });
});
