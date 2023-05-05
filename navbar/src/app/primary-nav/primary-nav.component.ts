import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'navbar-primary-nav',
  templateUrl: './primary-nav.component.html',
  styleUrls: ['./primary-nav.component.css']
})
export class PrimaryNavComponent {
  isAuthenticated$: Observable<boolean> = of(false);
  name$: Observable<string> = of('');

  constructor() { }
}
