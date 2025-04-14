import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { Usuarios } from '../models/usuarios';
import { HttpClient } from '@angular/common/http';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private url = `${base_url}/usuarios`;
  private listaCambio = new Subject<Usuarios[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Usuarios[]>(this.url);
  }
  insert(u: Usuarios) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: Usuarios[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<Usuarios>(`${this.url}/${id}`)
  }
  update(u: Usuarios){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }

  findNameByEmail(email: string): Observable<string> {
    return this.http.get<string>(`${this.url}/findname/${email}`);
  }

  findIdByEmail(email: string): Observable<number> {
    return this.http.get<number>(`${this.url}/findid/${email}`);;
  }


}
