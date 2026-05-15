import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../admin.service';

@Component({
    selector: 'app-admin-edit-user',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './admin-edit-user.component.html'
})
export class AdminEditUserComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private fb = inject(FormBuilder);
    private adminService = inject(AdminService);

    id = signal<number | null>(null);
    loading = signal(false);

    userForm = this.fb.group({
        name:     ['', [Validators.required]],
        email:    ['', [Validators.required, Validators.email]],
        role:     ['', [Validators.required]],
        password: ['']
    });

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.id.set(Number(idParam));
            this.cargarDatos(this.id()!);
        }
    }

    cargarDatos(id: number) {
        this.adminService.getUserAdmin(id).subscribe({
            next: (res: any) => {
                const data = res.data ? res.data : res;
                this.userForm.patchValue({
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    password: ''
                });
            },
            error: (err) => console.error('Error al cargar datos del usuario', err)
        });
    }

    onSubmit() {
        if (this.userForm.invalid || !this.id()) return;

        this.loading.set(true);
        const formValues = this.userForm.value;

        const payload: any = {
            name: formValues.name,
            email: formValues.email,
            role: formValues.role
        };

        if (formValues.password && formValues.password.trim() !== '') {
            payload.password = formValues.password;
        }

        this.adminService.updateUserAdmin(this.id()!, payload).subscribe({
            next: () => {
                // Refresco el store solo despues de que el servidor responda ok
                const usuarioEditado = { id: this.id()!, ...payload };
                this.adminService.actualizarUsuarioLocal(usuarioEditado);

                alert('Usuario actualizado con éxito.');
                this.router.navigate(['/admin/users']);
            },
            error: (err) => {
                console.error('Error actualizando usuario', err);
                alert('Hubo un error al guardar los cambios.');
                this.loading.set(false);
            }
        });
    }
}
