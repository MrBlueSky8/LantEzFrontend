import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { Requerimientos_minimos_puesto } from '../models/requerimientos_minimos_puesto';
import { HttpClient } from '@angular/common/http';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class RequerimientosMinimosPuestoService {
  private url = `${base_url}/requermientosminimospuesto`;
  private listaCambio = new Subject<Requerimientos_minimos_puesto[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Requerimientos_minimos_puesto[]>(this.url);
  }
  insert(u: Requerimientos_minimos_puesto) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: Requerimientos_minimos_puesto[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<Requerimientos_minimos_puesto>(`${this.url}/${id}`)
  }
  update(u: Requerimientos_minimos_puesto){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }
}
