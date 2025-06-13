import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { PuestosTrabajo } from '../models/puestos-trabajo';
import { HttpClient } from '@angular/common/http';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class PuestoTrabajoService {
  private url = `${base_url}/puestotrabajo`;
  private listaCambio = new Subject<PuestosTrabajo[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<PuestosTrabajo[]>(this.url);
  }
  insert(u: PuestosTrabajo) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: PuestosTrabajo[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<PuestosTrabajo>(`${this.url}/${id}`)
  }

  listbyEmpresaId(id: number) {
        return this.http.get<PuestosTrabajo[]>(`${this.url}/empresa/${id}`);
  }

  listarPuestosPendientesByEmpresaId(id: number) {
    return this.http.get<PuestosTrabajo[]>(`${this.url}/pendientes/empresa/${id}`);
  }


  update(u: PuestosTrabajo){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number){
    return this.http.delete(`${this.url}/cascade/${id}`);
  }
}
