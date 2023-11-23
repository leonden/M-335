import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { API_BASE_URL, API_KEY } from 'src/utils';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonToast,
  ToastController,
} from '@ionic/angular/standalone';
import { StockDetail } from 'src/app/models/stock-detail.model';
import { CommonModule } from '@angular/common';
import { heartOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';
import * as dayjs from 'dayjs';
import { News } from 'src/app/models/news.model';
import { pipe } from 'rxjs';

@Component({
  selector: 'app-stock-detail',
  templateUrl: './stock-detail.component.html',
  styleUrls: ['./stock-detail.component.scss'],
  standalone: true,
  imports: [
    HttpClientModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    CommonModule,
    IonIcon,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonToast,
  ],
})
export class StockDetailComponent implements OnInit {
  public symbol?: string;
  public company?: string;
  public iframeSafeUrl!: SafeResourceUrl;
  private iframeUrl?: string | undefined;
  public stockDetail!: StockDetail;
  private client: SupabaseClient;
  private favourite = false;
  public latestNews: News[] = [];
  private isToastOpen = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private toastController: ToastController
  ) {
    addIcons({ heartOutline });
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseClient
    );
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.symbol = params['symbol'];
      this.company = params['company'];

      this.iframeUrl = `https://widget.finnhub.io/widgets/stocks/chart?symbol=${this.symbol}&watermarkColor=%black&backgroundColor=%white&textColor=black`;

      this.iframeSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.iframeUrl
      );

      this.http
        .get(`${API_BASE_URL}/quote?symbol=${this.symbol}&token=${API_KEY}`)
        .subscribe((res: any) => {
          // Ensure company and symbol are defined before creating stockDetail
          if (this.company !== undefined && this.symbol !== undefined) {
            this.stockDetail = {
              company: this.company,
              symbol: this.symbol,
              current: res.c,
              change: res.d,
              percentChange: res.dp,
              highestOfDay: res.h,
              lowestOfDay: res.l,
            };
          }
        });

      const today = dayjs().format('YYYY-MM-DD');
      const yesterday = dayjs(-1).format('YYYY-MM-DD');

      this.http
        .get(
          `${API_BASE_URL}/company-news?symbol=${this.symbol}&from=${yesterday}&to=${today}&token=${API_KEY}`
        )
        .subscribe((res: any) => {
          pipe(
            (this.latestNews = res
              .map((news: any) => {
                return {
                  headline: news.headline,
                  summary: news.summary,
                  related: news.related,
                  url: news.url,
                };
              })
              .slice(0, 10))
          );
        });
    });
  }

  async saveData() {
    const { data, error } = await this.client
      .from('fav_stock')
      .insert([
        { company: this.stockDetail.company, symbol: this.stockDetail.symbol },
      ])
      .select();

    return data;
  }

  async saveToLocalStorage() {
    try {
      await Preferences.set({
        key: this.stockDetail.symbol,
        value: this.stockDetail.company,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async setFav() {
    if (this.favourite === false) {
      try {
        this.saveData();
        this.saveToLocalStorage();
      } catch (e) {
        console.error(e);
      }
    }

    this.isToastOpen = true;
    const added = 'Added to favourites';
    const alreadyFav = 'Already in favourites';
    const toast = await this.toastController.create({
      duration: 1500,
    });

    if (this.isToastOpen === true && this.favourite === false) {
      toast.message = added;
    } else {
      toast.message = alreadyFav;
    }

    await toast.present();

    this.favourite = true;
  }
}
