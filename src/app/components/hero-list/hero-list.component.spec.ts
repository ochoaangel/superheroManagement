import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HeroListComponent } from './hero-list.component';
import { HeroService } from '../../services/hero.service';
import { LoadingService } from '../../services/loading.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { Hero } from '../../models/hero.model';
import { Router } from '@angular/router';
import { ShowImageFullComponent } from '../show-image-full/show-image-full.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

describe('HeroListComponent', () => {
  let component: HeroListComponent;
  let fixture: ComponentFixture<HeroListComponent>;
  let heroService: jasmine.SpyObj<HeroService>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const heroServiceSpy = jasmine.createSpyObj('HeroService', ['getHeroes', 'searchHeroes', 'deleteHero']);
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        HeroListComponent,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: HeroService, useValue: heroServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    heroService = TestBed.inject(HeroService) as jasmine.SpyObj<HeroService>;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroListComponent);
    component = fixture.componentInstance;
    const heroes: Hero[] = [
      { id: 1, name: 'Hero 1', alterEgo: 'Alter Ego 1', power: 'Power 1', universe: 'Universe 1' },
      { id: 2, name: 'Hero 2', alterEgo: 'Alter Ego 2', power: 'Power 2', universe: 'Universe 2' }
    ];
    heroService.getHeroes.and.returnValue(of(heroes));
    heroService.searchHeroes.and.returnValue(of(heroes));
    heroService.deleteHero.and.returnValue(of(void 0));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load heroes on init', () => {
    expect(heroService.getHeroes).toHaveBeenCalled();
  });

  it('should set isLoading to false after loading heroes', () => {
    expect(loadingService.hide).toHaveBeenCalled();
  });

  it('should filter heroes based on search term', fakeAsync(() => {
    const heroes: Hero[] = [
      { id: 1, name: 'Hero 1', alterEgo: 'Alter Ego 1', power: 'Power 1', universe: 'Universe 1' },
      { id: 2, name: 'Hero 2', alterEgo: 'Alter Ego 2', power: 'Power 2', universe: 'Universe 2' }
    ];
    heroService.searchHeroes.and.returnValue(of(heroes));
    component.searchTerm.setValue('Hero');
    tick(300);
    fixture.detectChanges();
    expect(heroService.searchHeroes).toHaveBeenCalledWith('Hero');
    expect(component.filteredHeroes$.value).toEqual(heroes);
    expect(component.totalItems).toBe(heroes.length);
    expect(component.currentPage).toBe(0);
  }));

  it('should handle empty search term', fakeAsync(() => {
    const heroes: Hero[] = [
      { id: 1, name: 'Hero 1', alterEgo: 'Alter Ego 1', power: 'Power 1', universe: 'Universe 1' },
      { id: 2, name: 'Hero 2', alterEgo: 'Alter Ego 2', power: 'Power 2', universe: 'Universe 2' }
    ];
    component.heroes$.next(heroes);
    component.searchTerm.setValue('');
    tick(300);
    fixture.detectChanges();
    expect(component.filteredHeroes$.value).toEqual(heroes);
    expect(component.totalItems).toBe(heroes.length);
  }));

  it('should navigate to add hero page', () => {
    component.addHero();
    expect(router.navigate).toHaveBeenCalledWith(['/hero', 'new']);
  });

  it('should navigate to edit hero page', () => {
    const hero: Hero = { id: 1, name: 'Hero 1', alterEgo: 'Alter Ego 1', power: 'Power 1', universe: 'Universe 1' };
    component.editHero(hero);
    expect(router.navigate).toHaveBeenCalledWith(['/hero', hero.id]);
  });

  it('should open the dialog to confirm hero deletion', () => {
    const hero: Hero = { id: 1, name: 'Hero 1', alterEgo: 'Alter Ego 1', power: 'Power 1', universe: 'Universe 1' };
    const dialogRefSpy = jasmine.createSpyObj({ afterClosed: of(true) });
    dialog.open.and.returnValue(dialogRefSpy);
    component.deleteHero(hero);
    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, jasmine.any(Object));
  });

  it('should handle deleteSelectedHeroes correctly', () => {
    const selectedHeroes: Hero[] = [
      { id: 1, name: 'Hero 1', alterEgo: 'Alter Ego 1', power: 'Power 1', universe: 'Universe 1' },
      { id: 2, name: 'Hero 2', alterEgo: 'Alter Ego 2', power: 'Power 2', universe: 'Universe 2' }
    ];
    component.selection.select(...selectedHeroes);
    const dialogRefSpy = jasmine.createSpyObj({ afterClosed: of(true) });
    dialog.open.and.returnValue(dialogRefSpy);
    component.deleteSelectedHeroes();
    expect(dialog.open).toHaveBeenCalled();
    expect(heroService.deleteHero).toHaveBeenCalledTimes(selectedHeroes.length);
  });

  it('should handle page changes', () => {
    const event: PageEvent = { pageIndex: 1, pageSize: 10, length: 20 };
    spyOn<any>(component, 'updatePaginatedHeroes');
    component.onPageChange(event);
    expect(component.currentPage).toBe(1);
    expect(component.pageSize).toBe(10);
    expect(component['updatePaginatedHeroes']).toHaveBeenCalled();
  });

  it('should clear selection if all rows are selected', () => {
    const heroes: Hero[] = [
      { id: 1, name: 'Hero 1', alterEgo: 'Alter Ego 1', power: 'Power 1', universe: 'Universe 1' },
      { id: 2, name: 'Hero 2', alterEgo: 'Alter Ego 2', power: 'Power 2', universe: 'Universe 2' }
    ];
    component.filteredHeroes$.next(heroes);
    component.selection.select(...heroes);
    component.masterToggle();
    expect(component.selection.selected.length).toBe(0);
  });

  it('should select all rows if not all are selected', () => {
    const heroes: Hero[] = [
      { id: 1, name: 'Hero 1', alterEgo: 'Alter Ego 1', power: 'Power 1', universe: 'Universe 1' },
      { id: 2, name: 'Hero 2', alterEgo: 'Alter Ego 2', power: 'Power 2', universe: 'Universe 2' }
    ];
    component.filteredHeroes$.next(heroes);
    component.selection.clear();
    component.masterToggle();
    expect(component.selection.selected.length).toBe(heroes.length);
  });

  it('should open the dialog to show image full', () => {
    const imageUrl = 'http://example.com/image.jpg';
    component.showImageFull(imageUrl);
    expect(dialog.open).toHaveBeenCalledWith(ShowImageFullComponent, {
      data: { imageUrl },
      panelClass: 'custom-dialog-container',
      maxWidth: '80vw',
      maxHeight: '80vh'
    });
  });
});
