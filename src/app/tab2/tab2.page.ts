import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { API_BASE_URL, API_KEY } from 'src/utils';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { StockDetail } from '../models/stock-detail.model';
import { Company } from '../models/company.model';
import { CompanyProfile } from '../models/company-profile.model';
import { CommonModule } from '@angular/common';
import { switchMap, forkJoin, tap } from 'rxjs';
import { removeCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    HttpClientModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    CommonModule,
  ],
})
export class Tab2Page implements OnInit {
  favourites: string[] = [];
  stocksToDisplay: StockDetail[] = [];
  stockDetail!: StockDetail;
  companyProfile!: CompanyProfile;
  companies: Company[] = [];

  constructor(private http: HttpClient) {
    addIcons({ removeCircleOutline });
  }

  ngOnInit(): void {
    this.getAllFavourites();
  }

  async getAllFavourites() {
    Preferences.keys().then((result) => {
      const requests = result.keys.map((key) => this.getStock(key));

      forkJoin(requests).subscribe(() => {
        // All getStock requests are completed, you can now do something with this.companies
        console.log(this.companies);
      });
    });
  }

  getStock(query: string) {
    return this.http
      .get(`${API_BASE_URL}/search?q=${query}&token=${API_KEY}`)
      .pipe(
        switchMap((res: any) => {
          let company = res.result[0].description;
          let symbol = res.result[0].symbol;

          return forkJoin({
            quote: this.http.get(
              `${API_BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`
            ),
            profile: this.http.get(
              `${API_BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_KEY}`
            ),
          }).pipe(
            tap((responses: any) => {
              this.stockDetail = {
                company: company,
                symbol: symbol,
                current: responses.quote.c,
                change: responses.quote.d,
                percentChange: responses.quote.dp,
                highestOfDay: responses.quote.h,
                lowestOfDay: responses.quote.l,
              };

              this.companyProfile = {
                country: responses.profile.country,
                exchange: responses.profile.exchange,
                name: responses.profile.name,
                ticker: responses.profile.ticker,
                weburl: responses.profile.weburl,
                logo: responses.profile.logo,
              };

              this.companies.push({
                ...this.stockDetail,
                ...this.companyProfile,
              });
            })
          );
        })
      )
      .subscribe();
  }
}
