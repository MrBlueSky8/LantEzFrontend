import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AppModuloEnDesarrolloComponent } from '../app-modulo-en-desarrollo/app-modulo-en-desarrollo.component';

@Component({
  selector: 'app-evaluaciones',
  imports: [AppModuloEnDesarrolloComponent],
  templateUrl: './evaluaciones.component.html',
  styleUrl: './evaluaciones.component.css'
})
export class EvaluacionesComponent implements OnInit {
  constructor(public route: ActivatedRoute) {}
  ngOnInit(): void {}
}
