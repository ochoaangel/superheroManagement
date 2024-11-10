import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HeroFormComponent } from './hero-form.component';
import { HeroService } from '../../services/hero.service';
import { BehaviorSubject, of } from 'rxjs';
import { Hero } from '../../models/hero.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('HeroFormComponent', () => {
  let component: HeroFormComponent;
  let fixture: ComponentFixture<HeroFormComponent>;
  let heroService: jasmine.SpyObj<HeroService>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let paramMap: BehaviorSubject<ParamMap>;
  
  const mockHero: Hero = {
    id: 1,
    name: 'Superman',
    alterEgo: 'Clark Kent',
    power: 'Flight',
    universe: 'DC',
    image: 'test-image.jpg'
  };

  beforeEach(async () => {
    heroService = jasmine.createSpyObj('HeroService', ['getHeroes', 'addHero', 'updateHero']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    paramMap = new BehaviorSubject<ParamMap>(convertToParamMap({}));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule,
        HeroFormComponent
      ],
      providers: [
        FormBuilder,
        { provide: HeroService, useValue: heroService },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap.asObservable() }
        }
      ]
    }).compileComponents();

    heroService.getHeroes.and.returnValue(of([mockHero]));
    heroService.addHero.and.returnValue(of(void 0));
    heroService.updateHero.and.returnValue(of(void 0));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize in add mode by default', () => {
      expect(component.mode).toBe('add');
      expect(component.heroId).toBeNull();
    });

    it('should initialize form with empty values', () => {
      expect(component.heroForm.value).toEqual({
        name: '',
        alterEgo: '',
        power: '',
        universe: '',
        image: ''
      });
    });

    it('should switch to edit mode and load hero when id is provided', () => {
      paramMap.next(convertToParamMap({ id: '1' }));
      fixture.detectChanges();

      expect(component.mode).toBe('edit');
      expect(component.heroId).toBe(1);
      expect(heroService.getHeroes).toHaveBeenCalled();
    });

    it('should remain in add mode when "new" is provided as id', () => {
      paramMap.next(convertToParamMap({ id: 'new' }));
      fixture.detectChanges();

      expect(component.mode).toBe('add');
      expect(component.heroId).toBeNull();
    });
  });

  describe('loadHero', () => {
    it('should load hero data into form', () => {
      component.loadHero(1);
      expect(component.heroForm.value).toEqual({
        name: mockHero.name,
        alterEgo: mockHero.alterEgo,
        power: mockHero.power,
        universe: mockHero.universe,
        image: mockHero.image
      });
    });

    it('should navigate to heroes list if hero is not found', () => {
      heroService.getHeroes.and.returnValue(of([]));
      component.loadHero(999);
      expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.heroForm.patchValue({
        name: 'Batman',
        alterEgo: 'Bruce Wayne',
        power: 'Intelligence',
        universe: 'DC'
      });
    });

    it('should add hero in add mode', () => {
      component.mode = 'add';
      component.onSubmit();
      
      expect(heroService.addHero).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
    });

    it('should update hero in edit mode', () => {
      component.mode = 'edit';
      component.heroId = 1;
      component.onSubmit();
      
      expect(heroService.updateHero).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
    });

    it('should not submit if form is invalid', () => {
      component.heroForm.controls['name'].setErrors({ required: true });
      component.onSubmit();
      
      expect(heroService.addHero).not.toHaveBeenCalled();
      expect(heroService.updateHero).not.toHaveBeenCalled();
    });
  });

  describe('image handling', () => {
    it('should trigger file input click', () => {
      const event = { stopPropagation: () => {} } as unknown as Event;
      const fileInput = document.createElement('input');
      fileInput.id = 'fileInput';
      document.body.appendChild(fileInput);
      
      spyOn(event, 'stopPropagation');
      spyOn(fileInput, 'click');
      spyOn(document, 'getElementById').and.returnValue(fileInput);
      
      component.triggerFileInput(event);
      
      expect(event.stopPropagation).toHaveBeenCalled(); 
      expect(fileInput.click).toHaveBeenCalled();
      
      document.body.removeChild(fileInput);
    });

    it('should remove image', () => {
      const event = { stopPropagation: () => {} } as unknown as Event;
      spyOn(event, 'stopPropagation');
      
      component.heroForm.patchValue({ image: 'test-image.jpg' });
      component.removeImage(event);
      
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.heroForm.get('image')?.value).toBeNull();
    });

    it('should show image in full screen dialog', () => {
      const imageUrl = 'test-image.jpg';
      component.showImageFull(imageUrl);
      
      expect(dialog.open).toHaveBeenCalledWith(
        jasmine.any(Function), 
        {
          data: { imageUrl },
          panelClass: 'custom-dialog-container',
          maxWidth: '80vw',
          maxHeight: '80vh'
        }
      );
    });
  });

  describe('form validation', () => {
    it('should validate required fields', () => {
      const form = component.heroForm;
      
      // Initially form should be invalid
      expect(form.valid).toBeFalsy();

      // Name validation
      const nameControl = form.get('name');
      expect(nameControl?.errors?.['required']).toBeTruthy();
      nameControl?.setValue('Batman');
      expect(nameControl?.errors?.['required']).toBeFalsy();

      // Name length validation
      nameControl?.setValue('Ba');
      expect(nameControl?.errors?.['minlength']).toBeTruthy();
      nameControl?.setValue('Batman');
      expect(nameControl?.errors?.['minlength']).toBeFalsy();

      // AlterEgo validation
      const alterEgoControl = form.get('alterEgo');
      expect(alterEgoControl?.errors?.['required']).toBeTruthy();
      alterEgoControl?.setValue('Bruce Wayne');
      expect(alterEgoControl?.errors?.['required']).toBeFalsy();

      // Power validation
      const powerControl = form.get('power');
      expect(powerControl?.errors?.['required']).toBeTruthy();
      powerControl?.setValue('Intelligence');
      expect(powerControl?.errors?.['required']).toBeFalsy();

      // Universe validation
      const universeControl = form.get('universe');
      expect(universeControl?.errors?.['required']).toBeTruthy();
      universeControl?.setValue('DC');
      expect(universeControl?.errors?.['required']).toBeFalsy();

      // Form should be valid when all required fields are filled
      expect(form.valid).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined file in onFileSelected', () => {
      const event = { 
        target: { files: undefined },
        stopPropagation: () => {}
      } as unknown as Event;
      
      spyOn(event, 'stopPropagation');
      component.onFileSelected(event);
      
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should handle edit mode without heroId', () => {
      component.mode = 'edit';
      component.heroId = null;
      component.onSubmit();
      
      expect(heroService.updateHero).not.toHaveBeenCalled();
      expect(heroService.addHero).not.toHaveBeenCalled();
    });
  });

  describe('component interaction', () => {
    it('should call loadHero when route params change to valid id', () => {
      spyOn(component, 'loadHero');
      paramMap.next(convertToParamMap({ id: '1' }));
      
      expect(component.loadHero).toHaveBeenCalledWith(1);
    });

    it('should update form controls on hero load', () => {
      const testHero: Hero = {
        id: 2,
        name: 'Wonder Woman',
        alterEgo: 'Diana Prince',
        power: 'Super Strength',
        universe: 'DC',
        image: 'wonder-woman.jpg'
      };

      heroService.getHeroes.and.returnValue(of([testHero]));
      component.loadHero(2);

      expect(component.heroForm.get('name')?.value).toBe(testHero.name);
      expect(component.heroForm.get('alterEgo')?.value).toBe(testHero.alterEgo);
      expect(component.heroForm.get('power')?.value).toBe(testHero.power);
      expect(component.heroForm.get('universe')?.value).toBe(testHero.universe);
      expect(component.heroForm.get('image')?.value).toBe(testHero.image);
    });
  });

  describe('form submission handling', () => {
    it('should handle successful hero addition', () => {
      component.mode = 'add';
      component.heroForm.patchValue({
        name: 'New Hero',
        alterEgo: 'Secret Identity',
        power: 'Unknown',
        universe: 'Marvel'
      });

      component.onSubmit();

      expect(heroService.addHero).toHaveBeenCalledWith(jasmine.objectContaining({
        name: 'New Hero',
        alterEgo: 'Secret Identity',
        power: 'Unknown',
        universe: 'Marvel'
      }));
      expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
    });

    it('should handle successful hero update', () => {
      component.mode = 'edit';
      component.heroId = 1;
      component.heroForm.patchValue({
        name: 'Updated Hero',
        alterEgo: 'New Identity',
        power: 'Enhanced',
        universe: 'DC'
      });

      component.onSubmit();

      expect(heroService.updateHero).toHaveBeenCalledWith(jasmine.objectContaining({
        id: 1,
        name: 'Updated Hero',
        alterEgo: 'New Identity',
        power: 'Enhanced',
        universe: 'DC'
      }));
      expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });
  
});