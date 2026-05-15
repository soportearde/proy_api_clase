import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PetitionService } from '../../petition.service';
import { Petition } from '../../models/petition';

@Component({
    selector: 'app-my-signs',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './my-signs-component.html',
})
export class MySignsComponent {
    private petitionService = inject(PetitionService);

    petitions: Petition[] = [];
    loading = true;

    readonly API_STORAGE = 'http://localhost:8000/storage/';

    ngOnInit(): void {
        this.petitionService.getMySigns().subscribe({
            next: (data) => {
                this.petitions = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }
}
