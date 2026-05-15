import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PetitionService } from '../../petition.service';
import { Router, RouterLink } from '@angular/router';
import { Category } from '../../models/petition';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-create-component',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, CommonModule],
    templateUrl: './create-component.html',
    styleUrl: './create-component.css',
})
export class CreateComponent implements OnInit {
    private fb = inject(FormBuilder);
    private petitionService = inject(PetitionService);
    private router = inject(Router);

    loading = signal(false);
    errorMessage = signal<string | null>(null);
    filesToUpload: File[] = [];
    categories: Category[] = [];

    itemForm = this.fb.group({
        title: ['', [Validators.required]],
        description: ['', [Validators.required]],
        destinatary: ['', [Validators.required]],
        category: ['', [Validators.required]]
    });

    ngOnInit(): void {
        this.petitionService.getCategories().subscribe({
            next: (cats) => this.categories = cats,
            error: () => console.error('Error al cargar las categorias')
        });
    }

    onFileSelected(event: any) {
        this.filesToUpload = Array.from(event.target.files);
    }

    onSubmit() {
        if (this.itemForm.valid && this.filesToUpload.length > 0) {
            this.loading.set(true);
            const formData = new FormData();
            formData.append('title', this.itemForm.value.title!);
            formData.append('description', this.itemForm.value.description!);
            formData.append('destinatary', this.itemForm.value.destinatary!);
            formData.append('category', this.itemForm.value.category!);
            this.filesToUpload.forEach(file => formData.append('files[]', file));

            this.petitionService.create(formData).subscribe({
                next: () => this.router.navigate(['/petitions']),
                error: (err) => {
                    this.loading.set(false);
                    this.errorMessage.set(err.error?.message ?? 'Error al crear la petición. Inténtalo de nuevo.');
                }
            });
        } else {
            alert('Completa todos los campos y selecciona al menos una imagen');
        }
    }
}
