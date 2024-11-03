import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowImageFullComponent } from './show-image-full.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ShowImageFullComponent', () => {
  let component: ShowImageFullComponent;
  let fixture: ComponentFixture<ShowImageFullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ShowImageFullComponent, 
        MatIconModule,
        CommonModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule 
      ],
      providers: [
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MAT_DIALOG_DATA, useValue: { imageUrl: 'https://example.com/image.jpg' } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowImageFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isLoading to false when onImageLoad is called', () => {
    component.onImageLoad();
    expect(component.isLoading).toBeFalse();
  });

  it('should close the dialog when close is called', () => {
    component.close();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });

  it('should receive imageUrl from MAT_DIALOG_DATA', () => {
    expect(component.data.imageUrl).toBe('https://example.com/image.jpg');
  });
});
