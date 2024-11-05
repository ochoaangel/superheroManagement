import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {  provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LoadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';
import { Injectable } from '@angular/core';

class MockLoadingService {
  show() { }
  hide() { }
}

@Injectable()
class LoadingInterceptorWithDeps extends LoadingInterceptor {
  constructor(loadingService: LoadingService) {
    super(loadingService);
  }
}

describe('LoadingInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let loadingService: MockLoadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: HTTP_INTERCEPTORS,
          useClass: LoadingInterceptorWithDeps,
          multi: true
        },
        { provide: LoadingService, useClass: MockLoadingService }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    loadingService = TestBed.inject(LoadingService);

    spyOn(loadingService, 'show').and.callThrough();
    spyOn(loadingService, 'hide').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call loadingService.show and loadingService.hide', () => {
    httpClient.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    expect(loadingService.show).toHaveBeenCalled();

    req.flush({}); // Simulate response

    expect(loadingService.hide).toHaveBeenCalled();
  });

  it('should handle multiple requests', () => {
    httpClient.get('/test1').subscribe();
    httpClient.get('/test2').subscribe();

    const req1 = httpMock.expectOne('/test1');
    const req2 = httpMock.expectOne('/test2');

    expect(loadingService.show).toHaveBeenCalledTimes(2);

    req1.flush({});
    req2.flush({});

    expect(loadingService.hide).toHaveBeenCalledTimes(2);
  });

  it('should handle request errors', () => {
    httpClient.get('/test').subscribe(
      () => fail('should have failed with the 500 error'),
      (error: any) => {
        expect(error.status).toEqual(500);
      }
    );

    const req = httpMock.expectOne('/test');
    expect(loadingService.show).toHaveBeenCalled();

    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(loadingService.hide).toHaveBeenCalled();
  });

  it('should call loadingService.hide if request is cancelled', () => {
    const subscription = httpClient.get('/test').subscribe(
      () => fail('should have been cancelled'),
      (error: any) => {
        expect(error.name).toEqual('HttpErrorResponse');
      }
    );

    const req = httpMock.expectOne('/test');
    expect(loadingService.show).toHaveBeenCalled();

    subscription.unsubscribe();
    expect(loadingService.hide).toHaveBeenCalled();
  });
});
