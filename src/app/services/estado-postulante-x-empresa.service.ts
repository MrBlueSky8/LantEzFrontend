import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { EstadoPostulanteXEmpresa } from '../models/estado_postulanteX_empresa';
import { HttpClient } from '@angular/common/http';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class EstadoPostulanteXEmpresaService {
  private url = `${base_url}/estadopostulantexempresa`;
  private listaCambio = new Subject<EstadoPostulanteXEmpresa[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<EstadoPostulanteXEmpresa[]>(this.url);
  }
  insert(u: EstadoPostulanteXEmpresa) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: EstadoPostulanteXEmpresa[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<EstadoPostulanteXEmpresa>(`${this.url}/${id}`)
  }
  update(u: EstadoPostulanteXEmpresa){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  obtenerEstado(empresaId: number, postulanteId: number) {
  return this.http.get<boolean>(`${this.url}/estado/${empresaId}/${postulanteId}`);
  }

}
