import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarModule } from '@navbar';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'store' },
  { path: 'store',  loadChildren: () => import('store/StoreModule').then(m => m.StoreModule) },
  { path: 'basket', loadChildren: () => import('basket/BasketModule').then(m => m.BasketModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), NavbarModule],
  exports: [RouterModule],
})
export class AppRoutingModule { }
