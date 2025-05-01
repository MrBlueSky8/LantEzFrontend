import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Empresas } from '../models/empresas';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {
  private url = `${base_url}/empresas`;
  private listaCambio = new Subject<Empresas[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Empresas[]>(this.url);
  }
  insert(u: Empresas) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: Empresas[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<Empresas>(`${this.url}/${id}`)
  }
  update(u: Empresas){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }
}
