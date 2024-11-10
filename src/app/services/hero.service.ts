import { Injectable } from '@angular/core';
import { Hero } from '../models/hero.model';
import { Observable, BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private heroes$ = new BehaviorSubject<Hero[]>([]);

  constructor() {
    this.loadInitialHeroes();
  }

  private async loadInitialHeroes(): Promise<void> {
    const storedHeroes = localStorage.getItem('heroes');
    if (storedHeroes && storedHeroes !== '[]') {
      this.heroes$.next(JSON.parse(storedHeroes));
    } else {
      try {
        const response = await fetch('assets/json/heroes.json');
        const heroes = await response.json();
        this.heroes$.next(heroes);
        localStorage.setItem('heroes', JSON.stringify(heroes));
      } catch (error) {
        console.error('Error loading heroes:', error);
      }
    }
  }

  getHeroes(): Observable<Hero[]> {
    return this.heroes$.asObservable();
  }

  getHero(id: number): Observable<Hero | undefined> {
    const hero = this.heroes$.value.find(h => h.id === id);
    return of(hero);
  }

  addHero(hero: Hero): Observable<void> {
    const heroes = this.heroes$.value;
    hero.id = heroes.length ? Math.max(...heroes.map(h => h.id)) + 1 : 1;
    const updatedHeroes = [...heroes, hero];
    this.heroes$.next(updatedHeroes);
    localStorage.setItem('heroes', JSON.stringify(updatedHeroes));
    return of(undefined);
  }

  updateHero(hero: Hero): Observable<void> {
    const heroes = this.heroes$.value.map(h => h.id === hero.id ? hero : h);
    this.heroes$.next(heroes);
    localStorage.setItem('heroes', JSON.stringify(heroes));
    return of(undefined);
  }

  deleteHero(id: number): Observable<void> {
    const heroes = this.heroes$.value.filter(h => h.id !== id);
    this.heroes$.next(heroes);
    localStorage.setItem('heroes', JSON.stringify(heroes));
    return of(undefined);
  }

  searchHeroes(term: string): Observable<Hero[]> {
    const lowerTerm = term.toLowerCase();
    const heroes = this.heroes$.value.filter(h =>
      h.name.toLowerCase().includes(lowerTerm) ||
      h.alterEgo.toLowerCase().includes(lowerTerm) ||
      h.power.toLowerCase().includes(lowerTerm) ||
      h.universe.toLowerCase().includes(lowerTerm)
    );
    return of(heroes);
  }
}
