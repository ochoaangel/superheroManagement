import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set isLoading$ to true when show is called', (done) => {
    service.show();
    service.isLoading$.subscribe(isLoading => {
      expect(isLoading).toBeTrue();
      done();
    });
  });

  it('should set isLoading$ to false when hide is called', (done) => {
    service.show(); 
    service.hide();
    service.isLoading$.subscribe(isLoading => {
      expect(isLoading).toBeFalse();
      done();
    });
  });

});
