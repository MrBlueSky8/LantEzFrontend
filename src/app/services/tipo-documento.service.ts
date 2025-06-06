import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { TipoDocumento } from '../models/tipo-documento';
import { HttpClient } from '@angular/common/http';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class TipoDocumentoService {
  private url = `${base_url}/tipodocumento`;
  private listaCambio = new Subject<TipoDocumento[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<TipoDocumento[]>(this.url);
  }
  insert(u: TipoDocumento) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: TipoDocumento[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<TipoDocumento>(`${this.url}/${id}`)
  }
  update(u: TipoDocumento){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }
}
