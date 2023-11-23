export interface StockDetail {
  company: string;
  symbol: string;
  current: number;
  change: number;
  percentChange: number;
  highestOfDay: number;
  lowestOfDay: number;
}
