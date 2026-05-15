import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink, FormsModule],
    templateUrl: './home-component.html',
    styleUrl: './home-component.css'
})
export class HomeComponent {
    searchTerm: string = '';

    constructor(private router: Router) {}

    search() {
        if (this.searchTerm.trim()) {
            this.router.navigate(['/petitions'], { queryParams: { q: this.searchTerm } });
        } else {
            this.router.navigate(['/petitions']);
        }
    }
}
