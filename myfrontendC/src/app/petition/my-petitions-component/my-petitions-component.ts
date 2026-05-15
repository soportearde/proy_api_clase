import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PetitionService } from '../../petition.service';
import { Petition } from '../../models/petition';

@Component({
    selector: 'app-my-petitions',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './my-petitions-component.html',
})
export class MyPetitionsComponent {
    private petitionService = inject(PetitionService);

    petitions: Petition[] = [];
    loading = true;

    readonly API_STORAGE = 'http://localhost:8000/storage/';

    ngOnInit(): void {
        this.petitionService.getMyPetitions().subscribe({
            next: (data) => {
                this.petitions = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    delete(id: number) {
        if (confirm('¿Seguro que quieres eliminar esta petición?')) {
            this.petitionService.delete(id).subscribe({
                next: () => this.petitions = this.petitions.filter(p => p.id !== id),
                error: () => alert('No se pudo eliminar la petición.')
            });
        }
    } 
}
