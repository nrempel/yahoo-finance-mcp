import { describe, it, expect } from "vitest";
import {
  getQuoteSchema,
  getHistoricalSchema,
  getFinancialsSchema,
  getCompanyInfoSchema,
  searchSymbolsSchema,
  getNewsSchema,
} from "./schemas.js";

describe("MCP Input Validation Schemas", () => {
  describe("getQuoteSchema", () => {
    it("should accept valid symbol", () => {
      expect(() => getQuoteSchema.parse({ symbol: "AAPL" })).not.toThrow();
      expect(() => getQuoteSchema.parse({ symbol: "MSFT" })).not.toThrow();
      expect(() => getQuoteSchema.parse({ symbol: "BRK.B" })).not.toThrow();
    });

    it("should reject empty symbol", () => {
      expect(() => getQuoteSchema.parse({ symbol: "" })).toThrow();
    });

    it("should reject symbol longer than 10 chars", () => {
      expect(() => getQuoteSchema.parse({ symbol: "VERYLONGSYMBOL" })).toThrow();
    });

    it("should reject missing symbol", () => {
      expect(() => getQuoteSchema.parse({})).toThrow();
    });
  });

  describe("getHistoricalSchema", () => {
    it("should accept valid inputs", () => {
      expect(() => getHistoricalSchema.parse({ symbol: "AAPL" })).not.toThrow();
      expect(() => getHistoricalSchema.parse({ symbol: "AAPL", period: "1y" })).not.toThrow();
      expect(() =>
        getHistoricalSchema.parse({ symbol: "AAPL", period: "5d", interval: "1d" })
      ).not.toThrow();
    });

    it("should reject invalid period", () => {
      expect(() => getHistoricalSchema.parse({ symbol: "AAPL", period: "2d" })).toThrow();
    });

    it("should reject invalid interval", () => {
      expect(() => getHistoricalSchema.parse({ symbol: "AAPL", interval: "1h" })).toThrow();
    });

    it("should use default values", () => {
      const result = getHistoricalSchema.parse({ symbol: "AAPL" });
      expect(result.period).toBe("1mo");
      expect(result.interval).toBe("1d");
    });
  });

  describe("getFinancialsSchema", () => {
    it("should accept valid inputs", () => {
      expect(() => getFinancialsSchema.parse({ symbol: "AAPL", statement: "income" })).not.toThrow();
      expect(() =>
        getFinancialsSchema.parse({ symbol: "AAPL", statement: "balance" })
      ).not.toThrow();
      expect(() =>
        getFinancialsSchema.parse({ symbol: "AAPL", statement: "cashflow" })
      ).not.toThrow();
      expect(() =>
        getFinancialsSchema.parse({ symbol: "AAPL", statement: "income", quarterly: true })
      ).not.toThrow();
    });

    it("should reject invalid statement type", () => {
      expect(() => getFinancialsSchema.parse({ symbol: "AAPL", statement: "profit" })).toThrow();
    });

    it("should reject missing statement", () => {
      expect(() => getFinancialsSchema.parse({ symbol: "AAPL" })).toThrow();
    });

    it("should use default quarterly value", () => {
      const result = getFinancialsSchema.parse({ symbol: "AAPL", statement: "income" });
      expect(result.quarterly).toBe(false);
    });
  });

  describe("getCompanyInfoSchema", () => {
    it("should accept valid symbol", () => {
      expect(() => getCompanyInfoSchema.parse({ symbol: "TSLA" })).not.toThrow();
    });

    it("should reject empty symbol", () => {
      expect(() => getCompanyInfoSchema.parse({ symbol: "" })).toThrow();
    });
  });

  describe("searchSymbolsSchema", () => {
    it("should accept valid query", () => {
      expect(() => searchSymbolsSchema.parse({ query: "apple" })).not.toThrow();
      expect(() => searchSymbolsSchema.parse({ query: "tech stocks" })).not.toThrow();
    });

    it("should reject empty query", () => {
      expect(() => searchSymbolsSchema.parse({ query: "" })).toThrow();
    });
  });

  describe("getNewsSchema", () => {
    it("should accept valid symbol", () => {
      expect(() => getNewsSchema.parse({ symbol: "AMZN" })).not.toThrow();
    });

    it("should reject empty symbol", () => {
      expect(() => getNewsSchema.parse({ symbol: "" })).toThrow();
    });
  });
});
