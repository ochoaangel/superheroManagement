import { Injectable } from '@angular/core';
import { Hero } from '../models/hero.model';
import { Observable, BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private heroes$ = new BehaviorSubject<Hero[]>([]);

  constructor() {
    this.loadInitialHeroes();
  }

  private loadInitialHeroes(): void {
    fetch('assets/json/heroes.json')
      .then(response => response.json())
      .then(heroes => this.heroes$.next(heroes))
      .catch(error => console.error('Error loading heroes:', error));
  }

  getHeroes(): Observable<Hero[]> {
    return this.heroes$.asObservable();
  }

  addHero(hero: Hero): Observable<void> {
    const heroes = this.heroes$.value;
    hero.id = heroes.length ? Math.max(...heroes.map(h => h.id)) + 1 : 1;
    this.heroes$.next([...heroes, hero]);
    return new BehaviorSubject<void>(undefined).asObservable();
  }

  updateHero(hero: Hero): Observable<void> {
    const heroes = this.heroes$.value.map(h => h.id === hero.id ? hero : h);
    this.heroes$.next(heroes);
    return new BehaviorSubject<void>(undefined).asObservable();
  }

  deleteHero(id: number): Observable<void> {
    const heroes = this.heroes$.value.filter(h => h.id !== id);
    this.heroes$.next(heroes);
    return new BehaviorSubject<void>(undefined).asObservable();
  }

  searchHeroes(term: string): Observable<Hero[]> {
    const lowerTerm = term.toLowerCase();
    const heroes = this.heroes$.value.filter(h =>
      h.name.toLowerCase().includes(lowerTerm) ||
      h.alterEgo.toLowerCase().includes(lowerTerm) ||
      h.power.toLowerCase().includes(lowerTerm) ||
      h.universe.toLowerCase().includes(lowerTerm)
    );
    return new BehaviorSubject<Hero[]>(heroes).asObservable();
  }
}