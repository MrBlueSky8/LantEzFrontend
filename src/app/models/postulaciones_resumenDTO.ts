export class PostulacionesResumenDTO {
    postulacionId: number = 0;
    fechaPostulacion: Date = new Date(Date.now());
    empresaId: number = 0;
    empresaNombre: string = '';
    puestoId: number = 0;
    puestoNombre: string = '';
    evaluadorId: number = 0;
    evaluadorNombre: string = '';
    postulanteId: number = 0;
    postulanteNombre: string = '';
    estadoPostulacion: string = '';
    porcentajeCompatibilidad: number | null = null;
    aprobado: boolean = false;
    ocultar: boolean = false;
}