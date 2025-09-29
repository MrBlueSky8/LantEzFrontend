import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Empresas } from '../../../models/empresas';
import { MatDialog } from '@angular/material/dialog';
import { EmpresasService } from '../../../services/empresas.service';
import { LoginService } from '../../../services/login.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { PostulacionesService } from '../../../services/postulaciones.service';
import { EstadoCountDTO } from '../../../models/estado_countDTO';
import { CompatibilidadRangoDTO } from '../../../models/compatibilidad_rangoDTO';
import { EvaluadorCargaDTO } from '../../../models/evaluador_cargaDTO';
import { PostulacionesResumenDTO } from '../../../models/postulaciones_resumenDTO';
import { catchError, finalize, forkJoin, Subject, takeUntil } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { getCustomPaginatorIntl } from '../../shared/paginator-config/paginator-intl-es';

@Component({
  selector: 'app-dashboard-fundades',
  imports: [CommonModule, FormsModule, BaseChartDirective, MatPaginatorModule],
  templateUrl: './dashboard-fundades.component.html',
  styleUrl: './dashboard-fundades.component.css',
  providers: [
    { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() },
  ],
})
export class DashboardFundadesComponent implements OnInit {
  miEmpresa: Empresas = new Empresas();

  miCorreo: string = '';
  miRol: string = '';

  empresas: Empresas[] = [];
  empresaSeleccionadaId: number | null = null;

  // Filtros
  fInicio!: string;
  fFin!: string;
  estado?: 'pendiente' | 'aceptado' | 'rechazado';
  topN: number = 10;

  // KPIs
  kpiActivas: number = 0;
  kpiFinalizadas: number = 0;
  kpiPostulantesProceso: number = 0;
  kpiEvaluadoresActivos: number = 0;

  // Datos crudos (API)
  chartEstadosRaw: EstadoCountDTO[] = [];
  chartCompatibilidadRaw: CompatibilidadRangoDTO[] = [];
  chartCargaEvaluadoresRaw: EvaluadorCargaDTO[] = [];
  tablaResumen: PostulacionesResumenDTO[] = [];

  // Tabla paginada
  tablaPaginada: PostulacionesResumenDTO[] = [];
  pageSize: number = 10;
  pageIndex: number = 0;

  // Estados UI
  loading: boolean = false;
  loadingTabla: boolean = false;
  errorMsg: string = '';

  private destroy$ = new Subject<void>();

  // 1) Doughnut: Evaluaciones por estado
  doughnutEstadosData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  doughnutEstadosOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { enabled: true },
    },
    animation: { duration: 250 }
  };

  // 2) Barras: Postulantes por compatibilidad (rango)
  barCompatData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Postulantes' }] };
  barCompatOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { ticks: { autoSkip: false } }, y: { beginAtZero: true } },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    animation: { duration: 250 }
  };

  // 3) Barras horizontales: Carga por evaluador (Top N)
  barCargaEvalData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Evaluaciones' }] };
  barCargaEvalOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { beginAtZero: true } },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    animation: { duration: 250 }
  };

  constructor(
    private dialog: MatDialog,
    private empresaService: EmpresasService,
    private loginService: LoginService,
    private usuarioService: UsuariosService,
    private postulacionesService: PostulacionesService,
  ) {
    // Rango por defecto: últimos 30 días
    const hoy = new Date();
    const ini = new Date(hoy);
    ini.setDate(ini.getDate() - 30);

    this.fInicio = formatDate(ini, 'yyyy-MM-dd', 'en-US');
    this.fFin = formatDate(hoy, 'yyyy-MM-dd', 'en-US');
  }

  ngOnInit(): void {
    this.miCorreo = this.loginService.showUser();
    this.miRol = this.loginService.showRole();

    this.usuarioService
      .findIdEmpresaByEmail(this.loginService.showUser())
      .subscribe({
        next: (idEmpresa) => {
          this.empresaService.listId(idEmpresa).subscribe({
            next: (empresa) => {
              this.miEmpresa = empresa;
              this.loadDashboard();
            },
            error: (err) => console.error('Error al obtener empresa:', err),
          });
        },
        error: (err) => console.error('Error al obtener ID:', err),
      });

    this.empresaService.list().subscribe({
      next: (empresasTodas) => {
        this.empresas = empresasTodas;
      },
      error: (err) =>
        console.error('Error al listar empresas para el combo:', err),
    });
  }

  onEmpresaSeleccionadaChange(): void {
    const id = this.empresaSeleccionadaId;
    if (!id || id === this.miEmpresa.id) {
      // Si selecciona su propia empresa (o null), simplemente usar miEmpresa
      this.refrescarDashboards();
      return;
    }

    this.empresaService.listId(id).subscribe({
      next: (empresa) => {
        this.miEmpresa = empresa;
        this.refrescarDashboards();
      },
      error: (err) => console.error('Error al cambiar de empresa:', err),
    });
  }

  private refrescarDashboards(): void {
    // Limpia UI para que no queden restos de la empresa anterior
    this.errorMsg = '';
    this.kpiActivas = 0;
    this.kpiFinalizadas = 0;
    this.kpiPostulantesProceso = 0;
    this.kpiEvaluadoresActivos = 0;

    this.chartEstadosRaw = [];
    this.chartCompatibilidadRaw = [];
    this.chartCargaEvaluadoresRaw = [];
    this.tablaResumen = [];

    // Vacía datasets visibles (evita parpadeos con datos viejos)
    this.doughnutEstadosData = { labels: [], datasets: [{ data: [] }] };
    this.barCompatData = { labels: [], datasets: [{ data: [], label: 'Postulantes' }] };
    this.barCargaEvalData = { labels: [], datasets: [{ data: [], label: 'Evaluaciones' }] };

    // Vuelve a cargar todo para la empresa seleccionada
    this.loadDashboard();
  }


  // =========================
  // Carga total (KPIs + Charts)
  // =========================
  loadDashboard(): void {
    if (!this.miEmpresa?.id) return;

    this.errorMsg = '';
    this.loading = true;

    const empresaId = this.miEmpresa.id;
    const fInicio = this.toDateStart(this.fInicio);
    const fFin = this.toDateEnd(this.fFin);

    forkJoin({
      activas: this.postulacionesService.dashKpiEvaluacionesActivas(empresaId, fInicio, fFin),
      finalizadas: this.postulacionesService.dashKpiEvaluacionesFinalizadas(empresaId, fInicio, fFin),
      postulantesProceso: this.postulacionesService.dashKpiPostulantesEnProceso(empresaId, fInicio, fFin),
      evaluadoresActivos: this.postulacionesService.dashKpiEvaluadoresActivos(empresaId, fInicio, fFin),
      estados: this.postulacionesService.dashChartEvaluacionesPorEstado(empresaId, fInicio, fFin),
      compat: this.postulacionesService.dashChartPostulantesPorResultado(empresaId, fInicio, fFin),
      cargaEval: this.postulacionesService.dashChartCargaEvaluadores(empresaId, fInicio, fFin, this.topN),
    })
      .pipe(
        catchError(err => {
          console.error('Error cargando dashboard:', err);
          this.errorMsg = 'Ocurrió un problema cargando el dashboard.';
          throw err;
        }),
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe(res => {
        // KPIs
        this.kpiActivas = res.activas ?? 0;
        this.kpiFinalizadas = res.finalizadas ?? 0;
        this.kpiPostulantesProceso = res.postulantesProceso ?? 0;
        this.kpiEvaluadoresActivos = res.evaluadoresActivos ?? 0;

        // Datos crudos
        this.chartEstadosRaw = (res.estados ?? []).sort(this.sortEstados);
        this.chartCompatibilidadRaw = res.compat ?? [];
        this.chartCargaEvaluadoresRaw = res.cargaEval ?? [];

        // Construir charts
        this.buildEstadosChart();
        this.buildCompatChart();
        this.buildCargaEvalChart();

        // Tabla por separado
        this.loadTablaResumen();
      });
  }

  // =========================
  // Tabla Resumen
  // =========================
  loadTablaResumen(): void {
    if (!this.miEmpresa?.id) return;

    this.loadingTabla = true;

    const fInicio = this.toDateStart(this.fInicio);
    const fFin = this.toDateEnd(this.fFin);

    this.postulacionesService
      .dashTablePostulacionesResumen(this.miEmpresa.id, fInicio, fFin, this.estado)
      .pipe(
        catchError(err => {
          console.error('Error cargando tabla resumen:', err);
          this.errorMsg = 'No se pudo cargar la tabla resumen.';
          throw err;
        }),
        finalize(() => this.loadingTabla = false),
        takeUntil(this.destroy$)
      )
      .subscribe(res => {
        this.tablaResumen = res ?? [];
        this.pageIndex = 0;            // reset al cambiar datos
        this.updateTablaPaginada();    // construir página actual
      });
  }

  updateTablaPaginada(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.tablaPaginada = this.tablaResumen.slice(start, end);
  }

  onPageTablaChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateTablaPaginada();
  }

  // =========================
  // Builders de charts
  // =========================
  private buildEstadosChart(): void {
    const order: Record<string, number> = { 'pendiente': 1, 'aceptado': 2, 'rechazado': 3 };
    const labels = this.chartEstadosRaw
      .slice()
      .sort((a, b) => (order[a.estado] ?? 99) - (order[b.estado] ?? 99))
      .map(x => this.prettyEstado(x.estado));

    const data = this.chartEstadosRaw
      .slice()
      .sort((a, b) => (order[a.estado] ?? 99) - (order[b.estado] ?? 99))
      .map(x => x.total);

    this.doughnutEstadosData = {
      labels,
      datasets: [{ data }]
    };
  }

  private buildCompatChart(): void {
    // Orden fijo de rangos
    const RANGOS = ['<40', '40-59', '60-79', '80-100', '>100'];
    const map = new Map(this.chartCompatibilidadRaw.map(r => [r.rango, r.total]));
    const data = RANGOS.map(r => map.get(r) ?? 0);

    this.barCompatData = {
      labels: RANGOS,
      datasets: [{ data, label: 'Postulantes' }]
    };
  }

  private buildCargaEvalChart(): void {
    const labels = this.chartCargaEvaluadoresRaw.map(e => e.evaluadorNombre || `ID ${e.evaluadorId}`);
    const data = this.chartCargaEvaluadoresRaw.map(e => e.total);

    this.barCargaEvalData = {
      labels,
      datasets: [{ data, label: 'Evaluaciones' }]
    };
  }

  // =========================
  // Eventos UI
  // =========================
  onDateRangeChange(): void {
    if (this.fInicio && this.fFin && this.fInicio > this.fFin) {
      const tmp = this.fInicio;
      this.fInicio = this.fFin;
      this.fFin = tmp;
    }
    this.loadDashboard();
  }

  onEstadoChange(value?: 'pendiente' | 'aceptado' | 'rechazado' | ''): void {
    this.estado = (value && value.length > 0) ? (value as any) : undefined;
    this.loadTablaResumen();
  }

  onTopNChange(n: number): void {
    this.topN = Math.max(1, Number(n) || 10);
    this.loadDashboard();
  }

  // =========================
  // Helpers
  // =========================
  private toDateStart(v: string): Date {
    // v es 'yyyy-MM-dd' → local 00:00:00
    return new Date(`${v}T00:00:00`);
  }

  private toDateEnd(v: string): Date {
    // v es 'yyyy-MM-dd' → local 23:59:59.999
    return new Date(`${v}T23:59:59.999`);
  }

  private prettyEstado(v: string): string {
    const m: Record<string, string> = {
      'pendiente': 'Pendiente',
      'aceptado': 'Aceptado',
      'rechazado': 'Rechazado'
    };
    return m[v?.toLowerCase?.()] ?? v;
  }

  private sortEstados = (a: EstadoCountDTO, b: EstadoCountDTO): number => {
    const order: Record<string, number> = { 'pendiente': 1, 'aceptado': 2, 'rechazado': 3 };
    return (order[a.estado] ?? 99) - (order[b.estado] ?? 99);
  };

  trackByIdx(_i: number): number { return _i; }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
