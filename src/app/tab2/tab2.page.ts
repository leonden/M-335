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
  IonButton,
  IonIcon,
  IonText,
  ToastController,
} from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { API_BASE_URL, API_KEY } from 'src/utils';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { StockDetail } from '../models/stock-detail.model';
import { Company } from '../models/company.model';
import { CompanyProfile } from '../models/company-profile.model';
import { CommonModule } from '@angular/common';
import { switchMap, forkJoin, map } from 'rxjs';
import {
  removeCircleOutline,
  trendingUpOutline,
  trendingDownOutline,
  reorderTwoOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
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
    IonButton,
    IonIcon,
    IonText,
  ],
})
export class Tab2Page implements OnInit {
  favourites: string[] = [];
  stocksToDisplay: StockDetail[] = [];
  stockDetail!: StockDetail;
  companyProfile!: CompanyProfile;
  companies: Company[] = [];
  client: SupabaseClient;
  isToastOpen: boolean = false;
  favourite: boolean = true;

  constructor(
    private http: HttpClient,
    private toastController: ToastController
  ) {
    addIcons({
      removeCircleOutline,
      trendingUpOutline,
      trendingDownOutline,
      reorderTwoOutline,
    });
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseClient
    );
  }

  ngOnInit(): void {
    this.getAllFavourites();
  }

  async removeFav(symbol: string) {
    console.log(`Removed ${symbol} from favourites`);

    try {
      Preferences.remove({ key: symbol });

      const { error } = await this.client
        .from('fav_stock')
        .delete()
        .eq('symbol', symbol);
    } catch (e) {
      console.error(e);
    }

    this.isToastOpen = true;
    const removed = 'Removed from favourites';
    const alreadyRemoved = 'Already removed';
    const toast = await this.toastController.create({
      duration: 1500,
    });

    if (this.isToastOpen === true && this.favourite === true) {
      toast.message = removed;
    } else {
      toast.message = alreadyRemoved;
    }

    await toast.present();

    this.favourite = false;
  }

  async getAllFavourites() {
    Preferences.keys().then((result) => {
      const requests = result.keys.map((key) => this.getStock(key));

      forkJoin(requests).subscribe(() => {});
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
            map((responses: any) => {
              // Find the position of the first dash
              const dashIndex = responses.profile.exchange.indexOf('-');

              // Use substring to get the part before the dash
              const exchange =
                dashIndex !== -1
                  ? responses.profile.exchange.substring(0, dashIndex).trim()
                  : responses.profile.exchange.trim();

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
                exchange: exchange, // Use the modified exchange here
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
