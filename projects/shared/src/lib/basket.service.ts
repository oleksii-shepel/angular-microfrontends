import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './product';

function getWorkerScript(): string {
  return `
    const state = {
      basket: [],
      ports: []
    };

    function broadcast() {
      state.ports.forEach(port => {
        try {
          port.postMessage({ type: 'state', payload: state.basket });
        } catch (e) {
          // Port may be closed
        }
      });
    }

    self.onconnect = function(event) {
      const port = event.ports[0];
      state.ports.push(port);
      port.start();

      port.postMessage({ type: 'state', payload: state.basket });

      port.onmessage = function(e) {
        const msg = e.data;
        if (msg.type === 'add') {
          state.basket = [...state.basket, msg.payload];
        } else if (msg.type === 'clear') {
          state.basket = [];
        }
        broadcast();
      };
    };
  `;
}

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private items$ = new BehaviorSubject<Product[]>([]);
  private worker: SharedWorker | null = null;

  constructor() {
    if (typeof SharedWorker !== 'undefined') {
      try {
        const script = getWorkerScript();
        const url = 'data:application/javascript;base64,' + btoa(script);
        this.worker = new SharedWorker(url);
        this.worker.port.start();
        this.worker.port.onmessage = (event) => {
          if (event.data?.type === 'state') {
            this.items$.next(event.data.payload);
          }
        };
      } catch {
        // SharedWorker not available — use in-memory fallback
      }
    }
  }

  public getBasketItems$(): Observable<Product[]> {
    return this.items$.asObservable();
  }

  public getBasketItems(): Product[] {
    return this.items$.value;
  }

  public addToBasket(product: Product): Product[] {
    if (this.worker) {
      this.worker.port.postMessage({ type: 'add', payload: product });
    } else {
      this.items$.next([...this.items$.value, product]);
    }
    return this.items$.value;
  }

  public clearBasket(): void {
    if (this.worker) {
      this.worker.port.postMessage({ type: 'clear' });
    } else {
      this.items$.next([]);
    }
  }
}
