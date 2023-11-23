import { CompanyProfile } from './company-profile.model';
import { StockDetail } from './stock-detail.model';

export interface Company extends CompanyProfile, StockDetail {}
