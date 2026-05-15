import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../auth/auth.model';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './profile.html',
    styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
    user$: Observable<User | null>;

    constructor(
        private auth: AuthService,
        private router: Router
    ) {
        this.user$ = this.auth.user$;
    }

    ngOnInit(): void {
        this.auth.loadUserIfNeeded();
    }

    logout() {
        this.auth.logout().subscribe(() => this.router.navigate(['/login']));
    }
}
