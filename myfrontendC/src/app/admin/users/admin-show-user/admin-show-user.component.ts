import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../admin.service';

@Component({
    selector: 'app-admin-show-user',
    imports: [CommonModule, RouterLink],
    templateUrl: './admin-show-user.component.html'
})
export class AdminShowUserComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private adminService = inject(AdminService);

    user = signal<any>(null);
    loading = signal(true);

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.cargarUsuario(Number(id));
        }
    }

    cargarUsuario(id: number) {
        this.adminService.getUserAdmin(id).subscribe({
            next: (res: any) => {
                this.user.set(res.data ? res.data : res);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error al cargar el usuario:', err);
                this.loading.set(false);
            }
        });
    }
}
