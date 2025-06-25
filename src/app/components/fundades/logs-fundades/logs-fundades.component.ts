import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { getCustomPaginatorIntl } from '../../shared/paginator-config/paginator-intl-es';
import { Empresas } from '../../../models/empresas';
import { LogsAuditoria } from '../../../models/logs_auditoria';
import { EmpresasService } from '../../../services/empresas.service';
import { LoginService } from '../../../services/login.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { LogsAuditoriaService } from '../../../services/logs-auditoria.service';

@Component({
  selector: 'app-logs-fundades',
  imports: [CommonModule, MatPaginatorModule, FormsModule],
  templateUrl: './logs-fundades.component.html',
  styleUrl: './logs-fundades.component.css',
  providers: [
    { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() },
  ],
})
export class LogsFundadesComponent implements OnInit {
  miEmpresa: Empresas = new Empresas();
  logs: LogsAuditoria[] = [];
  logsFiltrados: LogsAuditoria[] = [];
  logsPaginados: LogsAuditoria[] = [];

  filtroBusqueda: string = '';
  pageSize: number = 5;
  pageIndex: number = 0;

  constructor(
    private empresaService: EmpresasService,
    private loginService: LoginService,
    private usuarioService: UsuariosService,
    private logsService: LogsAuditoriaService
  ) {}

  ngOnInit(): void {
    this.usuarioService
          .findIdEmpresaByEmail(this.loginService.showUser())
          .subscribe({
            next: (idEmpresa) => {
              this.empresaService.listId(idEmpresa).subscribe({
                next: (empresa) => {
                  this.miEmpresa = empresa;
                  this.logsService.listarPorEmpresaId(empresa.id!).subscribe({
                    next: (data: LogsAuditoria[]) => {
                      this.logs = data;
                      this.logsFiltrados = [...this.logs];
                      this.updateLogsPaginados();
                    },
                    error: (err) => console.error('Error al obtener áreas:', err),
                  });
                },
                error: (err) => console.error('Error al obtener empresa:', err),
              });
            },
            error: (err) => console.error('Error al obtener ID:', err),
          });
  }

  filtrarLogs(): void {
    const filtro = this.filtroBusqueda.toLowerCase();
    this.logsFiltrados = this.logs.filter((log) =>
      log.accion?.toLowerCase().includes(filtro)
    );
    this.pageIndex = 0;
    this.updateLogsPaginados();
  }

  updateLogsPaginados(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.logsPaginados = this.logsFiltrados.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateLogsPaginados();
  }

   private refrescarLogs(): void {
    this.logsService.listarPorEmpresaId(this.miEmpresa.id).subscribe((todas) => {
      this.logs = todas;
      this.pageIndex = 0;
      this.filtrarLogs();
    });
  }

}


