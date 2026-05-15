import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth';

@Component({
    standalone: true,
    selector: 'app-register',
    imports: [FormsModule, CommonModule, RouterLink],
    templateUrl: './register.html',
    styleUrl: './register.css'
})
export class RegisterComponent {
    formData = {
        name: '',
        email: '',
        password: '',
    };

    errorMessage: string = '';

    constructor(
        private auth: AuthService,
        private router: Router
    ) {}

    register() {
        this.errorMessage = '';
        this.auth.register(this.formData).subscribe({
            next: () => {
                this.router.navigate(['/login']);
            },
            error: (err) => {
                if (err.status === 409 || err.status === 422) {
                    this.errorMessage = 'This email address is already registered.';
                } else {
                    this.errorMessage = 'An error occurred while registering.';
                }
            }
        });
    }
}
