import { Routes } from '@angular/router';
import { HeroListComponent } from './components/hero-list/hero-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'heroes', pathMatch: 'full' },
  { path: 'heroes', component: HeroListComponent },
  { path: '**', redirectTo: 'heroes' }
];