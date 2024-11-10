import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Hero } from '../../models/hero.model';
import { HeroService } from '../../services/hero.service';
import { LoadingService } from '../../services/loading.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ShowImageFullComponent } from '../show-image-full/show-image-full.component';


@Component({
  selector: 'app-hero-list',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    ReactiveFormsModule
  ],
  templateUrl: './hero-list.component.html',
  styleUrl: './hero-list.component.scss'
})
export class HeroListComponent implements OnInit {
  heroes$ = new BehaviorSubject<Hero[]>([]);
  filteredHeroes$ = new BehaviorSubject<Hero[]>([]);
  paginatedHeroes$ = new BehaviorSubject<Hero[]>([]);
  searchTerm = new FormControl('');
  selection = new SelectionModel<Hero>(true, []);
  displayedColumns: string[] = ['select', 'image', 'name', 'alterEgo', 'power', 'universe', 'actions'];
  multipleSelection = false;

  pageSize = 5;
  currentPage = 0;
  totalItems = 0;

  constructor(
    private heroService: HeroService,
    private dialog: MatDialog,
    private loadingService: LoadingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadHeroes();
    this.setupSearch();
    this.selection.changed.subscribe(() => {
      this.multipleSelection = this.selection.selected.length > 1;
    });
  }

  private loadHeroes() {
    this.loadingService.show();
    this.heroService.getHeroes().subscribe(heroes => {
      this.heroes$.next(heroes);
      this.filteredHeroes$.next([...heroes]);
      this.totalItems = heroes.length;
      this.updatePaginatedHeroes();
      this.selection.clear();
      this.multipleSelection = false;
      this.loadingService.hide();
      this.cdr.detectChanges();
    });
  }

  private setupSearch() {
    this.searchTerm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      if (term) {
        this.heroService.searchHeroes(term).subscribe(heroes => {
          this.filteredHeroes$.next(heroes);
          this.totalItems = heroes.length;
          this.currentPage = 0;
          this.updatePaginatedHeroes();
        });
      } else {
        this.filteredHeroes$.next(this.heroes$.value);
        this.totalItems = this.heroes$.value.length;
        this.updatePaginatedHeroes();
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedHeroes();
  }

  private updatePaginatedHeroes() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedHeroes$.next(this.filteredHeroes$.value.slice(startIndex, endIndex));
  }

  addHero() {
    this.router.navigate(['/hero', 'new']);
  }

  editHero(hero: Hero) {
    this.router.navigate(['/hero', hero.id]);
  }

  deleteHero(hero: Hero) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar a ${hero.name}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingService.show();
        this.heroService.deleteHero(hero.id).subscribe(() => {
          this.loadHeroes();
          this.loadingService.hide();
        });
      }
    });
  }

  deleteSelectedHeroes() {
    const selectedHeroes = this.selection.selected;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar a los siguientes héroes: ${selectedHeroes.map(hero => hero.name).join(', ')}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingService.show();
        const deleteObservables = selectedHeroes.map(hero => this.heroService.deleteHero(hero.id));
        forkJoin(deleteObservables).subscribe(() => {
          this.loadHeroes();
          this.selection.clear();
          this.multipleSelection = false;
          this.loadingService.hide();
          this.cdr.detectChanges();
        });
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.filteredHeroes$.value.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.filteredHeroes$.value.forEach(row => this.selection.select(row));
  }

  showImageFull(imageUrl: string): void {
    this.dialog.open(ShowImageFullComponent, {
      data: { imageUrl },
      panelClass: 'custom-dialog-container',
      maxWidth: '80vw',
      maxHeight: '80vh'
    });
  }

}