import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req)
            .map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse && event.status === 302) {
                    console.log('HttpResponse::event =', event, ';');
                } else { console.log('event =', event, ';'); }
                return event;
            })
            .catch((err: any, caught) => {
                if (err.url && err.url.endsWith('/login.jsp')) {
                    window.location.href = '#/login';
                    return Promise.reject(err);
                }
                if (err instanceof HttpErrorResponse) {
                    if (err.status === 403) {
                        window.location.href = '#/login';
                        console.log('err.error =', err.error, ';');
                    }
                    return Observable.throw(err);
                }
            });
    }
}


