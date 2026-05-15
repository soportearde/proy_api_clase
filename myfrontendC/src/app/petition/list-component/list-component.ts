import { Component, computed, effect, inject, signal } from '@angular/core';
import { PetitionService } from '../../petition.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Category, Petition } from '../../models/petition';
import { AuthService } from '../../auth/auth';
import { SearchService } from '../../services/search.service';

@Component({
    selector: 'app-list-component',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './list-component.html',
    styleUrl: './list-component.css',
})
export class ListComponent {
    petitionService = inject(PetitionService);
    private authService = inject(AuthService);
    private route = inject(ActivatedRoute);
    private searchService = inject(SearchService);

    private allPetitions = signal<Petition[]>([]);
    public loading = signal<boolean>(true);
    public currentPage = signal<number>(1);
    readonly itemsPerPage = 6;

    public searchTerm = this.searchService.term;

    // Los dos desplegables de filtro
    public signedFilter = signal<string>('all');      // valores posibles: 'all', 'signed', 'unsigned'
    public categoryFilter = signal<number | null>(null);

    readonly API_STORAGE = 'http://localhost:8000/storage/';

    // Solo enseño en el desplegable de categorias las que aparecen tras aplicar el primer filtro
    public availableCategories = computed<Category[]>(() => {
        const base = this.afterSignedFilter();
        const seen = new Set<number>();
        const cats: Category[] = [];
        for (const p of base) {
            if (p.category && p.category.id && !seen.has(p.category.id)) {
                seen.add(p.category.id);
                cats.push(p.category);
            }
        }
        return cats;
    });

    // Primero filtro por el estado de firmas
    private afterSignedFilter = computed<Petition[]>(() => {
        const filter = this.signedFilter();
        const base = this.allPetitions();
        if (filter === 'signed')   return base.filter(p => (p.signeds ?? 0) > 0);
        if (filter === 'unsigned') return base.filter(p => (p.signeds ?? 0) === 0);
        return base;
    });

    // Y encima de eso filtro por categoria y por el texto del buscador
    public filteredPetitions = computed<Petition[]>(() => {
        const catId = this.categoryFilter();
        const term = this.searchTerm().trim().toLowerCase();
        let list = this.afterSignedFilter();
        if (catId !== null) list = list.filter(p => p.category_id === catId);
        if (term) list = list.filter(p => (p.title ?? '').toLowerCase().includes(term));
        return list;
    });

    public totalPages = computed(() =>
        Math.ceil(this.filteredPetitions().length / this.itemsPerPage)
    );

    public petitions = computed<Petition[]>(() => {
        const page = this.currentPage();
        const list = this.filteredPetitions();
        const start = (page - 1) * this.itemsPerPage;
        return list.slice(start, start + this.itemsPerPage);
    });

    constructor() {
        effect(() => {
            const params = this.route.snapshot.queryParams;
            if (params['q']) {
                this.searchService.setTerm(params['q']);
            }
        });

        // Cada vez que cambio algun filtro vuelvo a la pagina 1
        effect(() => {
            this.searchTerm();
            this.signedFilter();
            this.categoryFilter();
            this.currentPage.set(1);
        });
    }

    ngOnInit(): void {
        this.petitionService.fetchPetitions().subscribe({
            next: (petitions) => {
                this.allPetitions.set(petitions);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    onSignedFilterChange(event: Event): void {
        this.signedFilter.set((event.target as HTMLSelectElement).value);
        // Al cambiar el filtro de firmas reseteo la categoria por si ya no aparece en la nueva lista
        this.categoryFilter.set(null);
    }

    onCategoryFilterChange(event: Event): void {
        const val = (event.target as HTMLSelectElement).value;
        this.categoryFilter.set(val ? Number(val) : null);
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages()) return;
        this.currentPage.set(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    delete(id: number) {
        if (confirm('Are you sure?')) {
            this.petitionService.delete(id).subscribe({
                error: () => alert('You cannot delete this (you may not be the owner)'),
                next: () => this.allPetitions.update(list => list.filter(p => p.id !== id))
            });
        }
    }
}
