import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Areas } from '../models/area';

const base_url = environment.base;

@Injectable({
  providedIn: 'root',
})
export class AreasService {
  private url = `${base_url}/areas`;
  private listacambio = new Subject<Areas[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Areas[]>(this.url);
  }
  insert(eu: Areas) {
    return this.http.post(this.url, eu);
  }
  setList(listaNueva: Areas[]) {
    this.listacambio.next(listaNueva);
  }
  getList() {
    return this.listacambio.asObservable();
  }
  listId(id: number) {
    return this.http.get<Areas>(`${this.url}/${id}`);
  }
  update(eu: Areas) {
    return this.http.put(this.url, eu);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number) {
    return this.http.delete(`${this.url}/cascade/${id}`);
  }
}
