import yahooFinance from "yahoo-finance2";

export interface ToolResult {
  [key: string]: unknown;
  content: { type: "text"; text: string }[];
  isError?: boolean;
}

export async function handleGetQuote(symbol: string): Promise<ToolResult> {
  try {
    const quote = await yahooFinance.quote(symbol.toUpperCase());

    const data = {
      symbol: quote.symbol,
      name: quote.shortName || quote.longName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      peRatio: quote.trailingPE,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      avgVolume: quote.averageDailyVolume3Month,
      open: quote.regularMarketOpen,
      previousClose: quote.regularMarketPreviousClose,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error fetching quote for ${symbol}: ${message}` }],
      isError: true,
    };
  }
}

export function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case "1d":
      return new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    case "5d":
      return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    case "1mo":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "3mo":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "6mo":
      return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    case "1y":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case "2y":
      return new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
    case "5y":
      return new Date(now.getTime() - 1825 * 24 * 60 * 60 * 1000);
    case "max":
      return new Date("1970-01-01");
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

export async function handleGetHistorical(
  symbol: string,
  period: string,
  interval: "1d" | "1wk" | "1mo"
): Promise<ToolResult> {
  try {
    const result = await yahooFinance.chart(symbol.toUpperCase(), {
      period1: getStartDate(period),
      interval: interval,
    });

    const data = result.quotes.map((q) => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { symbol: result.meta.symbol, currency: result.meta.currency, data },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error fetching historical data for ${symbol}: ${message}` }],
      isError: true,
    };
  }
}

type StatementType = "income" | "balance" | "cashflow";

const fundamentalsModuleMap: Record<StatementType, string> = {
  income: "financials",
  balance: "balance-sheet",
  cashflow: "cash-flow",
};

export async function handleGetFinancials(
  symbol: string,
  statement: StatementType,
  quarterly: boolean
): Promise<ToolResult> {
  try {
    const statements = await yahooFinance.fundamentalsTimeSeries(
      symbol.toUpperCase(),
      {
        period1: getStartDate("5y"),
        type: quarterly ? "quarterly" : "annual",
        module: fundamentalsModuleMap[statement],
      },
      { validateResult: false }
    );

    const data = {
      type: statement,
      quarterly,
      statements,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error fetching financials for ${symbol}: ${message}` }],
      isError: true,
    };
  }
}

export async function handleGetCompanyInfo(symbol: string): Promise<ToolResult> {
  try {
    const result = await yahooFinance.quoteSummary(symbol.toUpperCase(), {
      modules: ["assetProfile", "defaultKeyStatistics", "summaryDetail", "price"],
    });

    const profile = result.assetProfile;
    const stats = result.defaultKeyStatistics;
    const summary = result.summaryDetail;
    const price = result.price;

    const data = {
      symbol: symbol.toUpperCase(),
      name: price?.shortName || price?.longName,
      sector: profile?.sector,
      industry: profile?.industry,
      website: profile?.website,
      employees: profile?.fullTimeEmployees,
      description: profile?.longBusinessSummary,
      country: profile?.country,
      city: profile?.city,
      keyStats: {
        beta: stats?.beta,
        priceToBook: stats?.priceToBook,
        forwardPE: stats?.forwardPE,
        profitMargins: stats?.profitMargins,
        floatShares: stats?.floatShares,
        sharesOutstanding: stats?.sharesOutstanding,
        heldPercentInsiders: stats?.heldPercentInsiders,
        heldPercentInstitutions: stats?.heldPercentInstitutions,
      },
      dividendInfo: {
        dividendRate: summary?.dividendRate,
        dividendYield: summary?.dividendYield,
        exDividendDate: summary?.exDividendDate,
        payoutRatio: summary?.payoutRatio,
      },
    };

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error fetching company info for ${symbol}: ${message}` }],
      isError: true,
    };
  }
}

export async function handleSearchSymbols(query: string): Promise<ToolResult> {
  try {
    const results = await yahooFinance.search(query);

    const data = results.quotes
      .filter(
        (q): q is typeof q & { symbol: string; quoteType: string } =>
          "quoteType" in q && q.quoteType === "EQUITY" && "symbol" in q
      )
      .map((q) => ({
        symbol: q.symbol,
        name:
          ("shortname" in q ? q.shortname : undefined) ||
          ("longname" in q ? q.longname : undefined),
        exchange: "exchange" in q ? q.exchange : undefined,
        type: q.quoteType,
      }));

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error searching for "${query}": ${message}` }],
      isError: true,
    };
  }
}

export async function handleGetNews(symbol: string): Promise<ToolResult> {
  try {
    const results = await yahooFinance.search(symbol.toUpperCase());

    const news =
      results.news?.map((n) => ({
        title: n.title,
        publisher: n.publisher,
        link: n.link,
        publishedAt: n.providerPublishTime,
      })) || [];

    return {
      content: [{ type: "text", text: JSON.stringify(news, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error fetching news for ${symbol}: ${message}` }],
      isError: true,
    };
  }
}
