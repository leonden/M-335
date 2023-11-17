export interface StockDetail {
  company: string | undefined;
  symbol: string | undefined;
  current: number | undefined;
  change: number | undefined;
  percentChange: number | undefined;
  highestOfDay: number | undefined;
  lowestOfDay: number | undefined;
}
