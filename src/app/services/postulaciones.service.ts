import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Postulaciones } from '../models/postulaciones';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EstadoCountDTO } from '../models/estado_countDTO';
import { CompatibilidadRangoDTO } from '../models/compatibilidad_rangoDTO';
import { EvaluadorCargaDTO } from '../models/evaluador_cargaDTO';
import { PostulacionesResumenDTO } from '../models/postulaciones_resumenDTO';

const base_url = environment.base;

@Injectable({
  providedIn: 'root'
})
export class PostulacionesService {
  private url = `${base_url}/postulaciones`;
  private listaCambio = new Subject<Postulaciones[]>();
  constructor(private http: HttpClient) { }

  private buildRangeParams(empresaId: number, fInicio: Date, fFin: Date): HttpParams {
    return new HttpParams()
      .set('empresaId', String(empresaId))
      .set('fInicio', fInicio.toISOString())
      .set('fFin', fFin.toISOString());
  }

  list() {
    return this.http.get<Postulaciones[]>(this.url);
  }
  insert(u: Postulaciones) {
    return this.http.post(this.url, u);
  }
  setList(listaNueva: Postulaciones[]) {
    this.listaCambio.next(listaNueva);
  }
  getList() {
    return this.listaCambio.asObservable();
  }
  listId(id: number) {
    return this.http.get<Postulaciones>(`${this.url}/${id}`)
  }
  update(u: Postulaciones) {
    return this.http.put(this.url, u);
  }
  eliminar(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  eliminarCascade(id: number) {
    return this.http.delete(`${this.url}/cascade/${id}`);
  }

  insertMultiple(postulaciones: Postulaciones[]) {
    return this.http.post(`${this.url}/multiple`, postulaciones);
  }

  upsertMultiple(postulaciones: Postulaciones[]) {
    return this.http.post(`${this.url}/upsert`, postulaciones);
  }

  listByPuestoTrabajo(puestoId: number) {
    return this.http.get<Postulaciones[]>(`${this.url}/puesto/${puestoId}`);
  }

  contarPostulacionesFinalizadasPorEmpresa(empresaId: number) {
    return this.http.get<number>(`${this.url}/reporte/finalizadas/empresa/${empresaId}`);
  }

  contarPostulacionesPendientesPorEmpresa(empresaId: number) {
    return this.http.get<number>(`${this.url}/reporte/pendientes/empresa/${empresaId}`);
  }

  contarPorUsuarioId(usuarioId: number) {
    return this.http.get<number>(`${this.url}/cantidad/usuario/${usuarioId}`);
  }

  contarNoPendientesPorUsuario(usuarioId: number) {
    return this.http.get<number>(`${this.url}/nopendientes/cantidad/usuario/${usuarioId}`);
  }

  contarPostulacionesAceptadas(usuarioId: number) {
    return this.http.get<number>(`${this.url}/aceptadas/usuario/${usuarioId}`);
  }

  contarPostulacionesRechazadas(usuarioId: number) {
    return this.http.get<number>(`${this.url}/rechazadas/usuario/${usuarioId}`);
  }

  listByPostulanteId(puestoId: number) {
    return this.http.get<Postulaciones[]>(`${this.url}/postulante/${puestoId}`);
  }

  dashKpiEvaluacionesActivas(empresaId: number, fInicio: Date, fFin: Date): Observable<number> {
    const params = this.buildRangeParams(empresaId, fInicio, fFin);
    return this.http.get<number>(`${this.url}/dash/kpi/activas`, { params });
  }

  dashKpiEvaluacionesFinalizadas(empresaId: number, fInicio: Date, fFin: Date): Observable<number> {
    const params = this.buildRangeParams(empresaId, fInicio, fFin);
    return this.http.get<number>(`${this.url}/dash/kpi/finalizadas`, { params });
  }

  dashKpiPostulantesEnProceso(empresaId: number, fInicio: Date, fFin: Date): Observable<number> {
    const params = this.buildRangeParams(empresaId, fInicio, fFin);
    return this.http.get<number>(`${this.url}/dash/kpi/postulantes-proceso`, { params });
  }

  dashKpiEvaluadoresActivos(empresaId: number, fInicio: Date, fFin: Date): Observable<number> {
    const params = this.buildRangeParams(empresaId, fInicio, fFin);
    return this.http.get<number>(`${this.url}/dash/kpi/evaluadores-activos`, { params });
  }

  // =======================
  // DASHBOARD – CHARTS
  // =======================

  dashChartEvaluacionesPorEstado(
    empresaId: number,
    fInicio: Date,
    fFin: Date
  ): Observable<EstadoCountDTO[]> {
    const params = this.buildRangeParams(empresaId, fInicio, fFin);
    return this.http.get<EstadoCountDTO[]>(`${this.url}/dash/chart/evaluaciones-por-estado`, { params });
  }

  dashChartPostulantesPorResultado(
    empresaId: number,
    fInicio: Date,
    fFin: Date
  ): Observable<CompatibilidadRangoDTO[]> {
    const params = this.buildRangeParams(empresaId, fInicio, fFin);
    return this.http.get<CompatibilidadRangoDTO[]>(`${this.url}/dash/chart/postulantes-por-resultado`, { params });
  }

  dashChartCargaEvaluadores(
    empresaId: number,
    fInicio: Date,
    fFin: Date,
    topN = 10
  ): Observable<EvaluadorCargaDTO[]> {
    let params = this.buildRangeParams(empresaId, fInicio, fFin).set('topN', String(topN));
    return this.http.get<EvaluadorCargaDTO[]>(`${this.url}/dash/chart/carga-evaluadores`, { params });
  }

  // =======================
  // DASHBOARD – TABLA RESUMEN
  // =======================

  dashTablePostulacionesResumen(
    empresaId: number,
    fInicio: Date,
    fFin: Date,
    estado?: 'pendiente' | 'aceptado' | 'rechazado'
  ): Observable<PostulacionesResumenDTO[]> {
    let params = this.buildRangeParams(empresaId, fInicio, fFin);
    if (estado) params = params.set('estado', estado);
    return this.http.get<PostulacionesResumenDTO[]>(`${this.url}/dash/table/resumen`, { params });
  }

}
