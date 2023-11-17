import { Routes } from '@angular/router';
import { StockDetailComponent } from './components/stock-detail/stock-detail.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'search/stock',
    component: StockDetailComponent,
  },
];
