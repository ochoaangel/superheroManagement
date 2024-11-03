import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-show-image-full',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatProgressSpinnerModule],
  templateUrl: './show-image-full.component.html',
  styleUrl: './show-image-full.component.scss'
})
export class ShowImageFullComponent implements OnInit {
  isLoading = true;

  constructor(
    public dialogRef: MatDialogRef<ShowImageFullComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string }
  ) { }

  ngOnInit(): void { }

  onImageLoad(): void {
    this.isLoading = false;
  }

  close(): void {
    this.dialogRef.close();
  }
}