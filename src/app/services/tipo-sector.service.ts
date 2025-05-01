import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { TipoSector } from '../models/tipo-sector';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class TipoSectorService {

  private url = `${base_url}/tiposector`;
  private listaCambio = new Subject<TipoSector[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<TipoSector[]>(this.url);
  }
  insert(u: TipoSector) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: TipoSector[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<TipoSector>(`${this.url}/${id}`)
  }
  update(u: TipoSector){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }
}
