import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; // Importamos RouterLink
import { CommonModule } from '@angular/common'; //  Importamos CommonModule
import { AuthService } from '../../auth/auth'; // Asegura la ruta de tu servicio

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink], // Añadimos los imports aquí
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {

  email = '';
  password = '';
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    // Limpiamos errores previos
    this.errorMessage = '';

    this.auth.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          // Cargamos los datos del usuario desde el servidor (/me)
          // para garantizar el saludo por nombre en navbar y perfil.
          this.auth.loadUserIfNeeded();

          // Si es admin, lo mandamos al panel VIP; si no, al listado normal
          if (this.auth.isAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/petitions']);
          }
        },
        error: (err: { status: number; }) => {
          console.error('LOGIN ERROR', err);
          if (err.status === 401) {
            this.errorMessage = 'The email or password is incorrect.';
            this.password = '';
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
          }
        }
      });
  }
}
