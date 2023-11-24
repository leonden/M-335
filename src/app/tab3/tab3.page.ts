import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonText,
} from '@ionic/angular/standalone';
import { API_BASE_URL, API_KEY } from 'src/utils';
import { News } from '../models/news.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
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
export class Tab3Page implements OnInit {
  public news: News[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get(`${API_BASE_URL}/news?category=general&token=${API_KEY}`)
      .subscribe(
        (res: any) => {
          console.log('API Response:', res);
          console.log('API Response:', res[0].headline);

          // Check if the response has the required properties
          if (res) {
            res.forEach((newsItem: any) => {
              let article: News = {
                headline: newsItem.headline,
                summary: newsItem.summary,
                related: newsItem.related,
                url: newsItem.url,
                image: newsItem.image,
              };

              this.news.push(article);
            });
          }

          console.log('Updated News Array:', this.news);
        },
        (error) => {
          console.error('API Error:', error);
        }
      );
  }
}
