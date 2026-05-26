import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private readonly storageKey = 'mfe-basket';
  private items$ = new BehaviorSubject<Product[]>(this.loadFromStorage());

  constructor() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        this.items$.next(this.loadFromStorage());
      }
    });
  }

  private loadFromStorage(): Product[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: Product[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  public getBasketItems$(): Observable<Product[]> {
    return this.items$.asObservable();
  }

  public getBasketItems(): Product[] {
    return this.items$.value;
  }

  public addToBasket(product: Product): Product[] {
    const updated = [...this.items$.value, product];
    this.saveToStorage(updated);
    this.items$.next(updated);
    return updated;
  }

  public clearBasket(): void {
    localStorage.removeItem(this.storageKey);
    this.items$.next([]);
  }
}
