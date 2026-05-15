import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/navbar-component/navbar-component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    private router = inject(Router);

    // Con esta señal se si estoy en una ruta del panel admin para ocultar el navbar publico
    isAdminRoute = signal<boolean>(false);

    constructor() {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin'));
            });
    }
}
