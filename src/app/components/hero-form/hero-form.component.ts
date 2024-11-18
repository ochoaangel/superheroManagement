import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeroService } from '../../services/hero.service';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ShowImageFullComponent } from '../show-image-full/show-image-full.component';
import { MatIconModule } from '@angular/material/icon';
import { UppercaseInputDirective } from '../../directives/uppercase-input.directive';

@Component({
  selector: 'app-hero-form',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, ReactiveFormsModule, MatIconModule, UppercaseInputDirective],
  templateUrl: './hero-form.component.html',
  styleUrls: ['./hero-form.component.scss']
})
export class HeroFormComponent implements OnInit {
  heroForm: FormGroup;
  mode: 'add' | 'edit' = 'add'
  heroId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private heroService: HeroService,
    private route: ActivatedRoute,
    public router: Router,
    private dialog: MatDialog
  ) {
    this.heroForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      alterEgo: ['', Validators.required],
      power: ['', Validators.required],
      universe: ['', Validators.required],
      image: ['']
    });
    this.mode = 'add';
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Route param id:', id); 
      if (id && id !== 'new') {
        this.heroId = +id;
        this.mode = 'edit';
        this.loadHero(this.heroId); 
      } else {
        this.mode = 'add';
      }
    });
  }
  
  loadHero(id: number): void {
    this.heroService.getHeroes().subscribe(heroes => {
      console.log('Heroes available before finding:', heroes); 
      const hero = heroes.find(h => h.id === id);
      console.log('Hero loaded:', hero); 
      if (hero) {
        this.heroForm.patchValue(hero);
      } else {
        this.router.navigate(['/heroes']);
      }
    });
  }

  onSubmit() {
    if (this.heroForm.valid) {
      const hero = this.heroForm.value;
      if (this.mode === 'add') {
        this.heroService.addHero(hero).subscribe(() => {
          this.router.navigate(['/heroes']);
        });
      } else if (this.mode === 'edit' && this.heroId !== null) {
        this.heroService.updateHero({ ...hero, id: this.heroId }).subscribe(() => {
          this.router.navigate(['/heroes']);
        });
      }
    }
  }

  onFileSelected(event: Event) {
    event.stopPropagation();
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.heroForm.patchValue({ image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(event: Event) {
    event.stopPropagation();
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.heroForm.patchValue({ image: null });
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