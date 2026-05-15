import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Petition, Category } from './models/petition';
import { tap, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PetitionService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8000/api/petitions';

    // State (Signals)
    #petitions = signal<Petition[]>([]);
    loading = signal<boolean>(false);

    // Expose petitions as readonly
    allPetitions = this.#petitions.asReadonly();

    fetchPetitions() {
        this.loading.set(true);
        return this.http.get<any>(this.API_URL).pipe(
            map(res => res.data as Petition[]),
            tap(petitions => {
                this.#petitions.set(petitions);
                this.loading.set(false);
            })
        );
    }

    getById(id: number) {
        return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
            map(res => res.data as Petition)
        );
    }

    create(formData: FormData) {
        return this.http.post<any>(this.API_URL, formData).pipe(
            tap(res => {
                this.#petitions.update(list => [res.data, ...list]);
            })
        );
    }

    update(id: number, formData: FormData) {
        // Trick so Laravel accepts files on update
        formData.append('_method', 'PUT');
        return this.http.post<any>(`${this.API_URL}/${id}`, formData).pipe(
            tap(res => {
                this.#petitions.update(list =>
                    list.map(p => p.id === id ? res.data : p)
                );
            })
        );
    }

    delete(id: number) {
        return this.http.delete(`${this.API_URL}/${id}`).pipe(
            tap(() => {
                this.#petitions.update(list => list.filter(p => p.id !== id));
            })
        );
    }

    sign(id: number) {
        return this.http.put<{ success: boolean, message: string }>(
            `${this.API_URL}/sign/${id}`,
            {}
        );
    }

    getMyPetitions() {
        return this.http.get<any>('http://localhost:8000/api/mypetitions').pipe(
            map(res => res.data.data as Petition[])
        );
    }

    getMySigns() {
        return this.http.get<any>('http://localhost:8000/api/mysigns').pipe(
            map(res => res.data.data as Petition[])
        );
    }

    getCategories() {
        return this.http.get<Category[]>('http://localhost:8000/api/categories');
    }

    deleteFile(fileId: number) {
        return this.http.delete(`http://localhost:8000/api/petition-files/${fileId}`);
    }
}
