import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { API_BASE_URL, API_KEY } from 'src/utils';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    HttpClientModule,
    NgFor,
    RouterModule,
  ],
})
export class Tab1Page {
  public results: any[] = [];

  constructor(private client: HttpClient) {}

  handleInput(event: any) {
    const query = event.target.value.toLowerCase();

    this.getSymbol(query);
  }

  getSymbol(query: string) {
    this.client
      .get(`${API_BASE_URL}/search?q=${query}&token=${API_KEY}`)
      .subscribe(
        (res: any) => {
          // Assuming the response is an array of objects
          this.results = res.result;

          console.log(this.results);

          this.results = this.results.filter((item, index, array) => {
            return (
              array.indexOf(item) === index && array.lastIndexOf(item) === index
            );
          });
        },
        (error: Error) => {
          console.error('Error fetching data:', error);
        }
      );
  }
}
