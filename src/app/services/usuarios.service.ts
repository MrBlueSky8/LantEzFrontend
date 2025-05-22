import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { Usuarios } from '../models/usuarios';
import { HttpClient } from '@angular/common/http';
import { UsuariosLight } from '../models/usuariosLight';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private url = `${base_url}/usuarios`;
  private listaCambio = new Subject<Usuarios[]>();

  private listaCambioPublica = new Subject<UsuariosLight[]>();

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Usuarios[]>(this.url);
  }
  listPublico() {
    return this.http.get<UsuariosLight[]>(`${this.url}/publico`);
  }
  insert(u: Usuarios) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: Usuarios[]) {
    this.listaCambio.next(listaNueva);
  }

  setListPublico(listaNuevaPublica: UsuariosLight[]) {
    this.listaCambioPublica.next(listaNuevaPublica);
  }

  getList() {
    return this.listaCambio.asObservable();
  }

  getListPublica() {
    return this.listaCambioPublica.asObservable();
  }

  listId(id:number){
    return this.http.get<Usuarios>(`${this.url}/${id}`)
  }

  listIdPublico(id:number){
    return this.http.get<UsuariosLight>(`${this.url}/publico/${id}`)
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
    return this.http.get(`${this.url}/findname/${email}`, { responseType: 'text' });
  }

  findIdByEmail(email: string): Observable<number> {
    return this.http.get<number>(`${this.url}/findid/${email}`);;
  }

  findIdEmpresaByEmail(email: string): Observable<number> {
    return this.http.get<number>(`${this.url}/findidempresa/${email}`);;
  }

  listbyEmpresaId(id: number) {
      return this.http.get<UsuariosLight[]>(`${this.url}/empresa/${id}`);
  }


}
