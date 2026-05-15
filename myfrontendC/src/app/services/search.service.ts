import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
    readonly term = signal<string>('');

    setTerm(value: string): void {
        this.term.set(value ?? '');
    }

    clear(): void {
        this.term.set('');
    }
}
