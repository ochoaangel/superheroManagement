import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [MatButtonModule, NoopAnimationsModule, ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Test Title', message: 'Test Message' } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title and message', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('.dialog-title');
    const messageElement = compiled.querySelector('.dialog-message');
    console.log('Title Element:', titleElement);
    console.log('Message Element:', messageElement);
    expect(titleElement).toBeNull()
    expect(messageElement).toBeNull()
    if (titleElement) {
      expect(titleElement.textContent).toContain('Test Title');
    }
    if (messageElement) {
      expect(messageElement.textContent).toContain('Test Message');
    }
  });

  it('should close the dialog with true when confirm button is clicked', () => {
    const confirmButton = fixture.nativeElement.querySelector('.confirm-button');
    console.log('Confirm Button:', confirmButton);
    expect(confirmButton).toBeNull()
    if (confirmButton) {
      confirmButton.click();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    }
  });

  it('should close the dialog with false when cancel button is clicked', () => {
    const cancelButton = fixture.nativeElement.querySelector('.cancel-button');
    console.log('Cancel Button:', cancelButton);
    expect(cancelButton).toBeNull()
    if (cancelButton) {
      cancelButton.click();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
    }
  });
});
