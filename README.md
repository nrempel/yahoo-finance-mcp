# Yahoo Finance MCP Server

A Model Context Protocol (MCP) server that provides access to Yahoo Finance data including stock quotes, historical prices, financial statements, company information, symbol search, and news.

## Installation

### Claude Code

```bash
claude mcp add yfinance-mcp -- npx yfinance-mcp
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "yfinance-mcp": {
      "command": "npx",
      "args": ["yfinance-mcp"]
    }
  }
}
```

## Available Tools

### get_quote

Get real-time stock quote data including price, change, volume, and key metrics.

**Parameters:**
- `symbol` (string, required): Stock ticker symbol (e.g., "AAPL", "GOOGL")

**Example response:**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 273.08,
  "change": -0.68,
  "changePercent": -0.25,
  "volume": 20667651,
  "marketCap": 4052613332992,
  "peRatio": 36.56
}
```

### get_historical

Get historical OHLCV (Open, High, Low, Close, Volume) price data.

**Parameters:**
- `symbol` (string, required): Stock ticker symbol
- `period` (string, optional): Time period - "1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "max" (default: "1mo")
- `interval` (string, optional): Data interval - "1d", "1wk", "1mo" (default: "1d")

### get_financials

Get company financial statements (income statement, balance sheet, or cash flow).

**Parameters:**
- `symbol` (string, required): Stock ticker symbol
- `statement` (string, required): Type of statement - "income", "balance", "cashflow"
- `quarterly` (boolean, optional): Get quarterly data instead of annual (default: false)

### get_company_info

Get company profile including sector, industry, description, and key statistics.

**Parameters:**
- `symbol` (string, required): Stock ticker symbol

### search_symbols

Search for stock symbols by company name or keywords.

**Parameters:**
- `query` (string, required): Search query (company name or keywords)

### get_news

Get latest news for a stock symbol.

**Parameters:**
- `symbol` (string, required): Stock ticker symbol

## Development

### Run in development mode

```bash
pnpm dev
```

### Run tests

```bash
pnpm test           # Run tests in watch mode
pnpm test -- --run  # Run tests once
```

### Run tests with coverage

```bash
pnpm test:coverage
```

### Lint and format

```bash
pnpm lint       # Check for linting errors
pnpm lint:fix   # Fix linting errors
pnpm format     # Format code with Prettier
```

### Build

```bash
pnpm build
```

## Tech Stack

- TypeScript
- MCP SDK (`@modelcontextprotocol/sdk`)
- yahoo-finance2
- Zod for input validation
- Vitest for testing
- ESLint + Prettier for code quality

## License

MIT
