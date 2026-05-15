import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private API_URL = 'http://localhost:8000/api';

    // Aqui guardo el estado global del panel admin (mi "store")

    // Usuarios
    usuarios = signal<any[]>([]);
    cargandoUsuarios = signal<boolean>(false);
    private usuariosCargados = false;

    // Peticiones
    peticiones = signal<any[]>([]);
    cargandoPeticiones = signal<boolean>(false);
    private peticionesCargadas = false;

    // Carga con cache: si ya los tengo no vuelvo a pedirlos al servidor

    cargarUsuariosStore() {
        if (this.usuariosCargados) return;

        this.cargandoUsuarios.set(true);
        this.http.get(`${this.API_URL}/admin/users`).subscribe({
            next: (res: any) => {
                this.usuarios.set(res.data ? res.data : res);
                this.usuariosCargados = true;
                this.cargandoUsuarios.set(false);
            },
            error: (err) => {
                console.error('Error Store Usuarios:', err);
                this.cargandoUsuarios.set(false);
            }
        });
    }

    cargarPeticionesStore() {
        if (this.peticionesCargadas) return;

        this.cargandoPeticiones.set(true);
        this.http.get(`${this.API_URL}/admin/peticiones`).subscribe({
            next: (res: any) => {
                this.peticiones.set(res.data ? res.data : res);
                this.peticionesCargadas = true;
                this.cargandoPeticiones.set(false);
            },
            error: (err) => {
                console.error('Error Store Peticiones:', err);
                this.cargandoPeticiones.set(false);
            }
        });
    }

    // Estos metodos cambian el estado local sin volver a llamar a la api

    deleteUserAdmin(id: number): Observable<any> {
        return this.http.delete(`${this.API_URL}/admin/users/${id}`);
    }

    deletePeticionAdmin(id: number): Observable<any> {
        return this.http.delete(`${this.API_URL}/admin/peticiones/${id}`);
    }

    removerUsuarioLocal(id: number) {
        this.usuarios.update(users => users.filter(u => u.id !== id));
    }

    removerPeticionLocal(id: number) {
        this.peticiones.update(peticiones => peticiones.filter(p => p.id !== id));
    }

    // Esto lo llamo despues de que el servidor me devuelva ok (actualizacion pesimista)
    actualizarUsuarioLocal(usuarioActualizado: any) {
        this.usuarios.update(users =>
            users.map(u => u.id === usuarioActualizado.id ? { ...u, ...usuarioActualizado } : u)
        );
    }

    actualizarPeticionLocal(peticionActualizada: any) {
        this.peticiones.update(peticiones =>
            peticiones.map(p => p.id === peticionActualizada.id ? { ...p, ...peticionActualizada } : p)
        );
    }

    // Peticiones (endpoints sueltos que uso desde los componentes)

    getPeticionAdmin(id: number) {
        return this.http.get<any>(`${this.API_URL}/admin/peticiones/${id}`).pipe(
            map(res => res.data ?? res)
        );
    }

    updatePeticionAdmin(id: number, formData: FormData) {
        // Truco para que laravel acepte archivos en el update: mando POST y le pongo _method=PUT
        formData.append('_method', 'PUT');
        return this.http.post<any>(`${this.API_URL}/admin/peticiones/${id}`, formData);
    }

    // Usuarios

    getUsersAdmin() {
        return this.http.get(`${this.API_URL}/admin/users`);
    }

    getUserAdmin(id: number) {
        return this.http.get(`${this.API_URL}/admin/users/${id}`);
    }

    updateUserAdmin(id: number, data: any) {
        return this.http.put(`${this.API_URL}/admin/users/${id}`, data);
    }

    // Lo necesito para el select de categorias del editor de peticiones
    getCategorias() {
        return this.http.get<any>(`${this.API_URL}/categories`);
    }
}
