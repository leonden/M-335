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
  IonBackButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { StockDetail } from 'src/app/models/stock-detail.model';
import { CommonModule } from '@angular/common';
import { heartOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

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
    IonBackButton,
  ],
})
export class StockDetailComponent implements OnInit {
  public symbol?: string | undefined;
  public company?: string | undefined;
  public iframeSafeUrl!: SafeResourceUrl;
  private iframeUrl?: string | undefined;
  public stockDetail!: StockDetail;

  constructor(
    private route: ActivatedRoute,
    private client: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    addIcons({ heartOutline });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.symbol = params['symbol'];
      this.company = params['company'];

      console.log(this.symbol);

      this.iframeUrl = `https://widget.finnhub.io/widgets/stocks/chart?symbol=${this.symbol}&watermarkColor=%black&backgroundColor=%white&textColor=black`;

      this.iframeSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.iframeUrl
      );

      this.client
        .get(`${API_BASE_URL}/quote?symbol=${this.symbol}&token=${API_KEY}`)
        .subscribe((res: any) => {
          console.log(res);

          this.stockDetail = {
            company: this.company,
            symbol: this.symbol,
            current: res.c,
            change: res.d,
            percentChange: res.dp,
            highestOfDay: res.h,
            lowestOfDay: res.l,
          };
        });
    });
  }

  setFav() {
    console.log(`Set ${this.stockDetail.company} as a favourite`);
  }
}
