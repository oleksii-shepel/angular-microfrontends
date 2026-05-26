import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BasketService, Product } from '@shared';

interface BasketProduct {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styles: [
  ]
})
export class BasketComponent implements OnInit, OnDestroy {

  public items: BasketProduct[] = [];
  public totalItems = 0;

  private destroy$ = new Subject<void>();

  constructor(private basketService: BasketService) { }

  ngOnInit(): void {
    this.basketService.getBasketItems$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(basketItems => {
        this.items = basketItems
          .reduce((acc, cur) => {
            const idx = acc.findIndex(p => p.product.id === cur.id);
            idx !== -1 ? acc[idx].quantity++ : acc.push({ product: cur, quantity: 1 });
            return acc;
          }, [] as BasketProduct[]);

        this.totalItems = basketItems.length;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
