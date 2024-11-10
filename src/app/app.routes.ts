import { Routes } from '@angular/router';
import { HeroListComponent } from './components/hero-list/hero-list.component';
import { HeroFormComponent } from './components/hero-form/hero-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'heroes', pathMatch: 'full' },
  { path: 'heroes', component: HeroListComponent },
  { path: 'hero/new', component: HeroFormComponent },
  { path: 'hero/:id', component: HeroFormComponent },
  { path: '**', redirectTo: 'heroes' }
];