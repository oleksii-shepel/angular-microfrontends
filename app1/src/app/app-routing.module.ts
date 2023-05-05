import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './products/products.component';
import { APP_BASE_HREF } from '@angular/common';

const routes: Routes = [
  { path: '**', component: ProductsComponent },
  //{ path: 'basket', loadChildren: () => import('mfeBasket/Module').then(m => m.BasketModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
  ],
})
export class AppRoutingModule { }
