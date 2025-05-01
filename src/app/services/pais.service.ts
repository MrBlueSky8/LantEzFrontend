import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { Pais } from '../models/pais';
import { HttpClient } from '@angular/common/http';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class PaisService {
  private url = `${base_url}/pais`;
  private listaCambio = new Subject<Pais[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Pais[]>(this.url);
  }
  insert(u: Pais) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: Pais[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<Pais>(`${this.url}/${id}`)
  }
  update(u: Pais){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }
}
