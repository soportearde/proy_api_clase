import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../auth/auth';
import { SearchService } from '../../services/search.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-navbar-component',
    standalone: true,
    imports: [RouterLink, CommonModule, FormsModule],
    templateUrl: './navbar-component.html',
    styleUrl: './navbar-component.css'
})
export class NavbarComponent {
    private authService = inject(AuthService);
    private searchService = inject(SearchService);
    public router: Router = inject(Router);

    public currentUser = this.authService.currentUser;
    public isLoggedIn = this.authService.isLoggedIn;
    public searchTerm = this.searchService.term;

    // El buscador solo lo enseño cuando estoy en /petitions
    public showSearch = signal<boolean>(this.isPetitionsList(this.router.url));

    constructor() {
        this.router.events
            .pipe(filter(e => e instanceof NavigationEnd))
            .subscribe((e: NavigationEnd) => {
                const active = this.isPetitionsList(e.urlAfterRedirects);
                this.showSearch.set(active);
                if (!active) {
                    this.searchService.clear();
                }
            });
    }

    onSearchChange(value: string): void {
        this.searchService.setTerm(value);
    }

    private isPetitionsList(url: string): boolean {
        const path = url.split('?')[0].split('#')[0];
        return path === '/petitions';
    }

    logout() {
        this.authService.logout().subscribe();
    }
}
