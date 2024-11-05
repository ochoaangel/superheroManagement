import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { LoadingService } from './services/loading.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let titleServiceSpy: jasmine.SpyObj<Title>;

  beforeEach(async () => {
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['isLoading$']);
    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, MatToolbarModule, MatProgressSpinnerModule, AppComponent],
      providers: [
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: Title, useValue: titleServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    loadingServiceSpy.isLoading$ = of(false);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should set the title to "⚝ Superhéroes ⚝"', () => {
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('⚝ Superhéroes ⚝');
  });

  it('should initialize isLoading$ with false', (done) => {
    component.ngOnInit();
    component.isLoading$.subscribe(value => {
      expect(value).toBe(false);
      done();
    });
  });
});
