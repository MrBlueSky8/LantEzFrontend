import { animate, style, transition, trigger } from "@angular/animations";

export interface INavbarData {
    routeLink?: string;
    icon?: string;
    svgIcon?: string;
    svgIconActive?: string;
    label: string;
    dividerAfter?: boolean;
    expanded?: boolean;
    items?: INavbarData[];
    action?: () => void; // NUEVO: función personalizada a ejecutar
}

export const fadeInOut = trigger('fadeInOut', [
    transition(':enter', [
      style({opacity: 0}),
      animate('350ms',
        style({opacity: 1})
      )
    ]),
    transition(':leave', [
      style({opacity: 1}),
      animate('350ms',
        style({opacity: 0})
      )
    ])
  ])
