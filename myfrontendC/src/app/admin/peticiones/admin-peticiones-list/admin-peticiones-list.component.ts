import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../admin.service';

@Component({
    selector: 'app-admin-peticiones-list',
    imports: [CommonModule, RouterLink],
    templateUrl: './admin-peticiones-list.component.html'
})
export class AdminPeticionesListComponent {
    public adminService = inject(AdminService);

    // Me apunto a las señales del servicio, asi no tengo que duplicar el estado
    peticiones = this.adminService.peticiones;
    cargando = this.adminService.cargandoPeticiones;

    constructor() {
        // Si ya estaban cargadas no vuelve a llamar a la api, lo decide el propio servicio
        this.adminService.cargarPeticionesStore();
    }

    eliminarPeticion(id: number) {
        if (confirm('¿Estás seguro de que deseas eliminar esta petición?')) {
            this.adminService.deletePeticionAdmin(id).subscribe({
                next: () => {
                    this.adminService.removerPeticionLocal(id);
                    alert('Petición eliminada con éxito.');
                },
                error: (err) => {
                    console.error('Error al eliminar', err);
                    alert('Hubo un error al eliminar la petición.');
                }
            });
        }
    }
}
