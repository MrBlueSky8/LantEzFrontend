import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GptRquest } from '../models/gptRequest';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class GptService {
  private url = `${base_url}/ia`;
  private listaCambio = new Subject<GptRquest[]>();
  constructor(private http: HttpClient) {}

  // gpt.service.ts
  retroalimentacionIndividual(prompt: string) {
    return this.http.post(`${this.url}/retroalimentacion`, { prompt }, { responseType: 'text' });
  }
}
