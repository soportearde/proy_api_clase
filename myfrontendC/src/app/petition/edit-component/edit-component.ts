import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PetitionService } from '../../petition.service';
import { Petition, Category } from '../../models/petition';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-petition-edit',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, CommonModule],
    templateUrl: './edit-component.html',
    styleUrl: './edit-component.css'
})
export class EditComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private petitionService = inject(PetitionService);

    readonly API_STORAGE = 'http://localhost:8000/storage/';

    id = signal<number | null>(null);
    loading = signal(false);
    errorMessage = signal<string | null>(null);
    fileToUpload: File | null = null;
    petition: Petition | null = null;
    categories: Category[] = [];

    itemForm = this.fb.group({
        title: ['', [Validators.required]],
        description: ['', [Validators.required]],
        destinatary: ['', [Validators.required]],
        category: ['', [Validators.required]]
    });

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.id.set(Number(idParam));
            this.loadData(this.id()!);
        }

        this.petitionService.getCategories().subscribe({
            next: (cats) => this.categories = cats,
            error: () => console.error('Error loading categories')
        });
    }
    removeImage(file: { id: number }) {
        this.petitionService.deleteFile(file.id).subscribe({
            next: () => {
                this.petition!.files = this.petition!.files!.filter(f => f.id !== file.id);
            },
            error: () => this.errorMessage.set('Error al eliminar la imagen.')
        });
    }
    loadData(id: number) {
        this.petitionService.getById(id).subscribe({
            next: (res: any) => {
                const data = res.data ? res.data : res;
                this.petition = data as Petition;
                this.itemForm.patchValue({
                    title: data.title,
                    description: data.description,
                    destinatary: data.destinatary,
                    category: String(data.category_id)
                });
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) this.fileToUpload = file;
    }

    onSubmit() {
        if (this.itemForm.invalid || !this.id()) return;
        this.loading.set(true);

        const formData = new FormData();
        formData.append('title', this.itemForm.get('title')?.value || '');
        formData.append('description', this.itemForm.get('description')?.value || '');
        formData.append('destinatary', this.itemForm.get('destinatary')?.value || '');
        formData.append('category', this.itemForm.get('category')?.value || '');

        if (this.fileToUpload) {
            formData.append('file', this.fileToUpload);
        }

        this.petitionService.update(this.id()!, formData).subscribe({
            next: () => this.router.navigate(['/petitions']),
            error: (err) => {
                this.loading.set(false);
                this.errorMessage.set(err.error?.message ?? 'Error al guardar la petición. Inténtalo de nuevo.');
            }
        });
    }

    getImageUrl(file?: { file_path: string }): string {
        if (file) return `${this.API_STORAGE}${file.file_path}`;
        if (this.petition?.files?.length) return `${this.API_STORAGE}${this.petition.files[0].file_path}`;
        return 'assets/no-image.png';
    }
}
