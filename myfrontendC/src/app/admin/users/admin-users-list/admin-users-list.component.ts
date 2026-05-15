import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../admin.service';

@Component({
    selector: 'app-admin-users-list',
    imports: [CommonModule, RouterLink],
    templateUrl: './admin-users-list.component.html'
})
export class AdminUsersListComponent {
    public adminService = inject(AdminService);

    usuarios = this.adminService.usuarios;
    cargando = this.adminService.cargandoUsuarios;

    constructor() {
        this.adminService.cargarUsuariosStore();
    }

    eliminarUsuario(id: number) {
        if (confirm('¿Estás seguro? Esta acción eliminará al usuario permanentemente.')) {
            this.adminService.deleteUserAdmin(id).subscribe({
                next: () => {
                    this.adminService.removerUsuarioLocal(id);
                    alert('Usuario eliminado con éxito.');
                },
                error: (err) => {
                    if (err.error && err.error.message) {
                        alert(err.error.message);
                    } else {
                        alert('Hubo un error al intentar eliminar el usuario.');
                    }
                }
            });
        }
    }
}
