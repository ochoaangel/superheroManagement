import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { HeroService } from '../../services/hero.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { Hero } from '../../models/hero.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ShowImageFullComponent } from '../show-image-full/show-image-full.component';

@Component({
  selector: 'app-hero-form',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './hero-form.component.html',
  styleUrls: ['./hero-form.component.scss']
})
export class HeroFormComponent implements OnInit {
  heroForm: FormGroup;
  mode: 'add' | 'edit';

  constructor(
    private fb: FormBuilder,
    private heroService: HeroService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<HeroFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; hero?: Hero }
  ) {
    this.mode = data.mode;
    this.heroForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      alterEgo: ['', Validators.required],
      power: ['', Validators.required],
      universe: ['', Validators.required],
      image: [data.hero?.image || '']
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    if (this.mode === 'edit' && this.data.hero) {
      this.heroForm.patchValue(this.data.hero);
    }
  }

  onSubmit() {
    if (this.heroForm.valid) {
      const hero = this.heroForm.value;
      const operation = this.mode === 'add'
        ? this.heroService.addHero(hero)
        : this.heroService.updateHero({ ...hero, id: this.data.hero!.id });

      operation.subscribe(() => {
        this.dialogRef.close(true);
      });
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
