import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Ciudades } from '../models/ciudades';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class CiudadesService {
  private url = `${base_url}/ciudades`;
  private listaCambio = new Subject<Ciudades[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Ciudades[]>(this.url);
  }
  insert(u: Ciudades) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: Ciudades[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<Ciudades>(`${this.url}/${id}`)
  }
  update(u: Ciudades){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }
}
