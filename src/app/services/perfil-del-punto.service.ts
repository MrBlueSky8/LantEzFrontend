import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { Perfil_del_punto } from '../models/perfil_del_punto';
import { HttpClient } from '@angular/common/http';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class PerfilDelPuntoService {
  private url = `${base_url}/perfil-del-punto`;
  private listaCambio = new Subject<Perfil_del_punto[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Perfil_del_punto[]>(this.url);
  }
  insert(u: Perfil_del_punto) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: Perfil_del_punto[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<Perfil_del_punto>(`${this.url}/${id}`)
  }
  update(u: Perfil_del_punto){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }
}
