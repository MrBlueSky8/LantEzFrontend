import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { LogsAuditoria } from '../models/logs_auditoria';
import { HttpClient } from '@angular/common/http';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class LogsAuditoriaService {
  private url = `${base_url}/logs`;
  private listaCambio = new Subject<LogsAuditoria[]>();
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<LogsAuditoria[]>(this.url);
  }
  insert(u: LogsAuditoria) {
    //console.log('evento: intento de insertar estado postulante: ' + JSON.stringify(u));
    return this.http.post(this.url, u);
  }
  setList(listaNueva: LogsAuditoria[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id:number){
    return this.http.get<LogsAuditoria>(`${this.url}/${id}`)
  }
  update(u: LogsAuditoria){
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  listarPorEmpresaId(empresaId: number) {
    return this.http.get<LogsAuditoria[]>(`${this.url}/empresa/${empresaId}`);
  }

  listarPorUsuarioId(usuarioId: number) {
    return this.http.get<LogsAuditoria[]>(`${this.url}/usuario/${usuarioId}`);
  }


}
