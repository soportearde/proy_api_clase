import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../admin.service';

@Component({
    selector: 'app-admin-edit-peticion',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './admin-edit-peticion.component.html'
})
export class AdminEditPeticionComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private adminService = inject(AdminService);

    readonly API_URL = 'http://localhost:8000/storage/';

    id = signal<number | null>(null);
    loading = signal(false);
    categorias = signal<any[]>([]);
    fileToUpload: File | null = null;
    peticion: any = null;

    itemForm = this.fb.group({
        titulo:        ['', [Validators.required]],
        descripcion:   ['', [Validators.required]],
        destinatario:  ['', [Validators.required]],
        categoria_id:  ['', [Validators.required]],
        estado:        ['', [Validators.required]]
    });

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.id.set(Number(idParam));
            this.cargarDatos(this.id()!);
            this.cargarCategorias();
        }
    }

    cargarCategorias() {
        this.adminService.getCategorias().subscribe({
            next: (res: any) => {
                const data = res.data ? res.data : res;
                this.categorias.set(data);
            }
        });
    }

    cargarDatos(id: number) {
        this.adminService.getPeticionAdmin(id).subscribe({
            next: (data: any) => {
                this.peticion = data;
                this.itemForm.patchValue({
                    titulo: data.titulo,
                    descripcion: data.descripcion,
                    destinatario: data.destinatario,
                    categoria_id: String(data.categoria_id),
                    estado: data.estado || 'pendiente'
                });
            },
            error: (err) => console.error('Error al cargar la petición (Admin):', err)
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.fileToUpload = file;
        }
    }

    onSubmit() {
        if (this.itemForm.invalid || !this.id()) return;

        this.loading.set(true);
        const formData = new FormData();
        formData.append('titulo',       this.itemForm.get('titulo')?.value || '');
        formData.append('descripcion',  this.itemForm.get('descripcion')?.value || '');
        formData.append('destinatario', this.itemForm.get('destinatario')?.value || '');
        formData.append('categoria_id', this.itemForm.get('categoria_id')?.value || '');
        formData.append('estado',       this.itemForm.get('estado')?.value || '');

        if (this.fileToUpload) {
            formData.append('file', this.fileToUpload);
        }

        this.adminService.updatePeticionAdmin(this.id()!, formData).subscribe({
            next: () => {
                // Solo actualizo el store local cuando el servidor me ha dicho ok
                const estadoCrudo = this.itemForm.get('estado')?.value || 'pendiente';
                const peticionEditada = {
                    id: this.id()!,
                    titulo:       this.itemForm.get('titulo')?.value,
                    descripcion:  this.itemForm.get('descripcion')?.value,
                    destinatario: this.itemForm.get('destinatario')?.value,
                    categoria_id: this.itemForm.get('categoria_id')?.value,
                    estado:       String(estadoCrudo).toLowerCase().trim()
                };
                this.adminService.actualizarPeticionLocal(peticionEditada);

                alert('Petición actualizada correctamente por el Administrador.');
                this.router.navigate(['/admin/peticiones']);
            },
            error: (err) => {
                console.error('Error al actualizar (Admin):', err);
                alert('Hubo un error al guardar los cambios.');
                this.loading.set(false);
            }
        });
    }

    getImagenUrl(): string {
        if (this.peticion && this.peticion.files && this.peticion.files.length > 0) {
            let path = this.peticion.files[0].file_path;
            path = path.replace('storage/', '');
            return `${this.API_URL}${path}`;
        }
        return 'assets/no-image.png';
    }
}
