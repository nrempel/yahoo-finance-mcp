import { describe, it, expect, vi } from "vitest";
import { createServer } from "./server.js";

vi.mock("./handlers.js", () => ({
  handleGetQuote: vi.fn(),
  handleGetHistorical: vi.fn(),
  handleGetFinancials: vi.fn(),
  handleGetCompanyInfo: vi.fn(),
  handleSearchSymbols: vi.fn(),
  handleGetNews: vi.fn(),
}));

describe("createServer", () => {
  it("should create an MCP server instance", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });

  it("should create server without throwing", () => {
    expect(() => createServer()).not.toThrow();
  });

  it("should create a new server instance each time", () => {
    const server1 = createServer();
    const server2 = createServer();
    expect(server1).not.toBe(server2);
  });
});
