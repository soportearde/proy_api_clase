import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminService } from '../../../admin.service';

@Component({
    selector: 'app-admin-show-peticion',
    imports: [CommonModule, RouterLink, DatePipe],
    templateUrl: './admin-show-peticion.component.html'
})
export class AdminShowPeticionComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private adminService = inject(AdminService);

    peticion = signal<any>(null);
    loading = signal(true);

    readonly API_STORAGE = 'http://localhost:8000/storage/';

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.adminService.getPeticionAdmin(Number(id)).subscribe({
                next: (data) => {
                    this.peticion.set(data);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
        }
    }
}
