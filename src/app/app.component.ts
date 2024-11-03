import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './services/loading.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatToolbarModule, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isLoading$: Observable<boolean> = of(false);

  constructor(private loadingService: LoadingService, private titleService: Title) {
    this.titleService.setTitle('⚝ Superhéroes ⚝');
  }

  ngOnInit() {
    setTimeout(() => {
      this.isLoading$ = this.loadingService.isLoading$;
    });
  }
}
