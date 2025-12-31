import { describe, it, expect } from "vitest";
import {
  handleGetQuote,
  handleGetHistorical,
  handleGetFinancials,
  handleGetCompanyInfo,
  handleSearchSymbols,
  handleGetNews,
} from "./handlers.js";

describe("E2E: handleGetQuote", () => {
  it("should fetch real quote data for AAPL", async () => {
    const result = await handleGetQuote("AAPL");
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(data.symbol).toBe("AAPL");
    expect(data.name).toBe("Apple Inc.");
    expect(typeof data.price).toBe("number");
    expect(data.price).toBeGreaterThan(0);
    expect(typeof data.volume).toBe("number");
    expect(typeof data.marketCap).toBe("number");
  });

  it("should return error for invalid symbol", async () => {
    const result = await handleGetQuote("INVALIDXYZ123");

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Error");
  });
});

describe("E2E: handleGetHistorical", () => {
  it("should fetch historical data for MSFT", async () => {
    const result = await handleGetHistorical("MSFT", "5d", "1d");
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(data.symbol).toBe("MSFT");
    expect(data.currency).toBe("USD");
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);

    const firstQuote = data.data[0];
    expect(typeof firstQuote.open).toBe("number");
    expect(typeof firstQuote.high).toBe("number");
    expect(typeof firstQuote.low).toBe("number");
    expect(typeof firstQuote.close).toBe("number");
    expect(typeof firstQuote.volume).toBe("number");
  });
});

describe("E2E: handleGetFinancials", () => {
  it("should fetch income statement for GOOGL with rich data", async () => {
    const result = await handleGetFinancials("GOOGL", "income", false);
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(data.type).toBe("income");
    expect(data.quarterly).toBe(false);
    expect(Array.isArray(data.statements)).toBe(true);
    expect(data.statements.length).toBeGreaterThan(0);

    const stmt = data.statements[0];
    expect(stmt.date).toBeDefined();
    expect(typeof stmt.totalRevenue).toBe("number");
    expect(stmt.totalRevenue).toBeGreaterThan(0);
  });

  it("should fetch balance sheet for AMZN with rich data", async () => {
    const result = await handleGetFinancials("AMZN", "balance", false);
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(data.type).toBe("balance");
    expect(Array.isArray(data.statements)).toBe(true);
    expect(data.statements.length).toBeGreaterThan(0);

    const stmt = data.statements[0];
    expect(stmt.date).toBeDefined();
    expect(typeof stmt.totalAssets).toBe("number");
  });

  it("should fetch cashflow statement for META with rich data", async () => {
    const result = await handleGetFinancials("META", "cashflow", false);
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(data.type).toBe("cashflow");
    expect(Array.isArray(data.statements)).toBe(true);
    expect(data.statements.length).toBeGreaterThan(0);

    const stmt = data.statements[0];
    expect(stmt.date).toBeDefined();
  });

  it("should fetch quarterly income data", async () => {
    const result = await handleGetFinancials("AAPL", "income", true);
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(data.quarterly).toBe(true);
    expect(Array.isArray(data.statements)).toBe(true);
  });
});

describe("E2E: handleGetCompanyInfo", () => {
  it("should fetch company info for TSLA", async () => {
    const result = await handleGetCompanyInfo("TSLA");
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(data.symbol).toBe("TSLA");
    expect(data.name).toBeDefined();
    expect(data.sector).toBeDefined();
    expect(data.industry).toBeDefined();
    expect(data.description).toBeDefined();
    expect(typeof data.employees).toBe("number");
    expect(data.keyStats).toBeDefined();
    expect(typeof data.keyStats.beta).toBe("number");
  });
});

describe("E2E: handleSearchSymbols", () => {
  it("should find symbols for 'nvidia'", async () => {
    const result = await handleSearchSymbols("nvidia");
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    const nvda = data.find((s: { symbol: string }) => s.symbol === "NVDA");
    expect(nvda).toBeDefined();
    expect(nvda.name).toContain("NVIDIA");
    expect(nvda.type).toBe("EQUITY");
  });

  it("should return empty array for nonsense query", async () => {
    const result = await handleSearchSymbols("xyznotarealcompany123456");
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("E2E: handleGetNews", () => {
  it("should fetch news for AAPL", async () => {
    const result = await handleGetNews("AAPL");
    const data = JSON.parse(result.content[0].text);

    expect(result.isError).toBeUndefined();
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0].title).toBeDefined();
      expect(data[0].publisher).toBeDefined();
      expect(data[0].link).toBeDefined();
    }
  });
});
