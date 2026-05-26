import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private readonly storageKey = 'mfe-basket';
  private readonly eventName = 'mfe-basket-changed';
  private items$ = new BehaviorSubject<Product[]>(this.loadFromStorage());

  constructor() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        this.emitIfChanged();
      }
    });

    window.addEventListener(this.eventName, () => {
      this.emitIfChanged();
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

  private emitIfChanged(): void {
    const items = this.loadFromStorage();
    const current = this.items$.value;
    if (items.length !== current.length || JSON.stringify(items) !== JSON.stringify(current)) {
      this.items$.next(items);
    }
  }

  private notify(): void {
    window.dispatchEvent(new CustomEvent(this.eventName));
  }

  public getBasketItems$(): Observable<Product[]> {
    return this.items$.asObservable();
  }

  public getBasketItems(): Product[] {
    return this.items$.value;
  }

  public addToBasket(product: Product): Product[] {
    const updated = [...this.items$.value, product];
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
    this.items$.next(updated);
    this.notify();
    return updated;
  }

  public clearBasket(): void {
    localStorage.removeItem(this.storageKey);
    this.items$.next([]);
    this.notify();
  }
}
