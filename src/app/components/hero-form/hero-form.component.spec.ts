import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeroFormComponent } from './hero-form.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HeroService } from '../../services/hero.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';
import { Hero } from '../../models/hero.model';
import { ShowImageFullComponent } from '../show-image-full/show-image-full.component';

describe('HeroFormComponent', () => {
  let component: HeroFormComponent;
  let fixture: ComponentFixture<HeroFormComponent>;
  let heroService: jasmine.SpyObj<HeroService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<HeroFormComponent>>;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const heroServiceSpy = jasmine.createSpyObj('HeroService', ['addHero', 'updateHero']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        HeroFormComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [
        FormBuilder,
        { provide: HeroService, useValue: heroServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'add' } },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    heroService = TestBed.inject(HeroService) as jasmine.SpyObj<HeroService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<HeroFormComponent>>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should initialize form with hero data in edit mode', () => {
    const hero: Hero = {
      id: 1,
      name: 'Superman',
      alterEgo: 'Clark Kent',
      power: 'Flight',
      universe: 'DC',
      image: 'superman.jpg'
    };
    
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HeroFormComponent],
      providers: [
        FormBuilder,
        { provide: HeroService, useValue: jasmine.createSpyObj('HeroService', ['addHero', 'updateHero']) },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'edit', hero } },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) }
      ]
    });

    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    
    expect(component.heroForm.value).toEqual({
      name: 'Superman',
      alterEgo: 'Clark Kent',
      power: 'Flight',
      universe: 'DC',
      image: 'superman.jpg'
    });
  });

  // Pruebas para onSubmit
  it('should add hero when form is valid in add mode', fakeAsync(() => {
    const newHero: Partial<Hero> = {
      name: 'Batman',
      alterEgo: 'Bruce Wayne',
      power: 'Intelligence',
      universe: 'DC',
      image: 'batman.jpg'
    };
    
    component.heroForm.patchValue(newHero);
    heroService.addHero.and.returnValue(of(void 0)); // Retorna Observable<void>
    
    component.onSubmit();
    tick();
    
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  }));

  it('should update hero when form is valid in edit mode', fakeAsync(() => {
    const existingHero: Hero = {
      id: 1,
      name: 'Batman',
      alterEgo: 'Bruce Wayne',
      power: 'Intelligence',
      universe: 'DC',
      image: 'batman.jpg'
    };
    
    component.mode = 'edit';
    component.data = { mode: 'edit', hero: existingHero };
    component.heroForm.patchValue(existingHero);
    heroService.updateHero.and.returnValue(of(void 0)); // Retorna Observable<void>
    
    component.onSubmit();
    tick();
    
    expect(heroService.updateHero).toHaveBeenCalledWith(existingHero);
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  }));

  it('should not submit when form is invalid', () => {
    component.heroForm.controls['name'].setErrors({ required: true });
    component.onSubmit();
    
    expect(heroService.addHero).not.toHaveBeenCalled();
    expect(heroService.updateHero).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  // Pruebas para onFileSelected
  it('should handle file selection and update form', fakeAsync(() => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    const mockFileReader = {
      result: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      readAsDataURL: function(file: Blob) {
        setTimeout(() => {
          (this as any).onload?.call(this);
        }, 100);
      }
    } as FileReader;
    
    spyOn(window, 'FileReader').and.returnValue(mockFileReader);
    
    const event = {
      target: { files: [file] },
      stopPropagation: () => {}
    } as unknown as Event;
    
    spyOn(event, 'stopPropagation');
    
    component.onFileSelected(event);
    tick(100);
    
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.heroForm.get('image')?.value).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRg==');
  }));

  it('should handle file selection when no file is selected', () => {
    const event = {
      target: { files: [] },
      stopPropagation: () => {}
    } as unknown as Event;
    
    spyOn(event, 'stopPropagation');
    
    component.onFileSelected(event);
    
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.heroForm.get('image')?.value).not.toBe('data:image/jpeg;base64,/9j/4AAQSkZJRg==');
  });

  it('should trigger file input click', () => {
    const fileInput = fixture.nativeElement.querySelector('#fileInput');
    spyOn(fileInput, 'click');
  
    const event = new Event('click');
    spyOn(event, 'stopPropagation');
  
    component.triggerFileInput(event);
  
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(fileInput.click).toHaveBeenCalled();
  });
  

  it('should remove image from form', () => {
    component.heroForm.patchValue({ image: 'some-image-url' });
  
    const event = new Event('click');
    spyOn(event, 'stopPropagation');
  
    component.removeImage(event);
  
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.heroForm.get('image')?.value).toBeNull();
  });
  
  it('should open ShowImageFullComponent dialog with correct data', () => {
    const imageUrl = 'test-image-url.jpg';
    component.showImageFull(imageUrl);
  
    expect(dialog.open).toHaveBeenCalledWith(ShowImageFullComponent, {
      data: { imageUrl },
      panelClass: 'custom-dialog-container',
      maxWidth: '80vw',
      maxHeight: '80vh'
    });
  });
  
});