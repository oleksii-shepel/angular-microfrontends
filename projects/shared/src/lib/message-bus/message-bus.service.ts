import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject, filter, map } from 'rxjs';

export interface Message<T = unknown> {
  type: string;
  payload?: T;
}

@Injectable({
  providedIn: 'root'
})
export class MessageBusService {
  private bus$ = new Subject<Message>();
  private readonly eventNamespace = 'mfe-bus';

  constructor(private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener(
        this.eventNamespace,
        (event: Event) => {
          const detail = (event as CustomEvent).detail as Message;
          if (detail?.type) {
            this.ngZone.run(() => this.bus$.next(detail));
          }
        }
      );
    });
  }

  public publish<T>(type: string, payload?: T): void {
    const message: Message<T> = { type, payload };

    window.dispatchEvent(
      new CustomEvent(this.eventNamespace, { detail: message })
    );
  }

  public listen<T>(type: string): Observable<T | undefined> {
    return this.bus$.pipe(
      filter((message) => message.type === type),
      map((message) => message.payload as T | undefined)
    );
  }

  public listenAll(): Observable<Message> {
    return this.bus$.asObservable();
  }
}
