import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './product';
import { MessageBusService } from './message-bus/message-bus.service';
import { BASKET_ITEM_ADDED, BASKET_UPDATED, BASKET_CLEARED } from './message-bus/message-types';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private products$ = new BehaviorSubject<Product[]>([]);

  constructor(private messageBus: MessageBusService) {
    this.messageBus.listen<Product>(BASKET_ITEM_ADDED).subscribe(product => {
      if (product) {
        const current = this.products$.value;
        current.push(product);
        this.products$.next(current);
        this.messageBus.publish(BASKET_UPDATED, current);
      }
    });

    this.messageBus.listen<void>(BASKET_CLEARED).subscribe(() => {
      this.products$.next([]);
      this.messageBus.publish(BASKET_UPDATED, []);
    });
  }

  public getBasketItems$(): Observable<Product[]> {
    return this.products$.asObservable();
  }

  public getBasketItems(): Product[] {
    return this.products$.value;
  }

  public addToBasket(product: Product): Product[] {
    this.messageBus.publish(BASKET_ITEM_ADDED, product);
    return this.products$.value;
  }

  public clearBasket(): void {
    this.messageBus.publish(BASKET_CLEARED);
  }
}
