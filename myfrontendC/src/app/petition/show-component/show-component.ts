import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { PetitionService } from '../../petition.service';
import { Petition } from '../../models/petition';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth';

@Component({
    selector: 'app-show-component',
    standalone: true,
    imports: [RouterLink, DatePipe, CommonModule],
    templateUrl: './show-component.html',
    styleUrl: './show-component.css'
})
export class ShowComponent implements OnInit {
    private petitionService = inject(PetitionService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private authService = inject(AuthService);

    petition = signal<Petition | null>(null);
    loading = signal(true);
    public isLoggedIn = this.authService.isLoggedIn;
    public currentUserId = computed(() => this.authService.currentUser()?.id ?? null);

    readonly API_STORAGE = 'http://localhost:8000/storage/';

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadPetition(Number(id));
        }
    }

    loadPetition(id: number) {
        this.petitionService.getById(id).subscribe({
            next: (res: any) => {
                this.petition.set(res.data ? res.data : res);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    getImageUrl(): string {
        const p = this.petition();
        if (p && p.files && p.files.length > 0) {
            return `${this.API_STORAGE}${p.files[0].file_path}`;
        }
        return 'assets/no-image.png';
    }

    sign() {
        const p = this.petition();
        if (!p?.id) return;
        this.petitionService.sign(p.id).subscribe({
            next: () => {
                this.petition.update(current => current
                    ? { ...current, signeds: (current.signeds ?? 0) + 1 }
                    : current
                );
                alert('¡Petición firmada correctamente!');
            },
            error: (err) => alert(err.error?.message ?? 'No puedes firmar esta petición')
        });
    }

    delete() {
        const p = this.petition();
        if (!p?.id) return;
        if (confirm('Delete this petition?')) {
            this.petitionService.delete(p.id).subscribe(() => {
                this.router.navigate(['/petitions']);
            });
        }
    }
}
