import { TestBed } from '@angular/core/testing';
import { HeroService } from './hero.service';
import { Hero } from '../models/hero.model';
import { first } from 'rxjs';

describe('HeroService', () => {
  let service: HeroService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [HeroService]
    });
    service = TestBed.inject(HeroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load initial heroes', (done) => {
    spyOn(service as any, 'loadInitialHeroes').and.callFake(() => {
      (service as any).heroes$.next([{ id: 1, name: 'Hero 1', alterEgo: 'Alter Ego 1', power: 'Power 1', universe: 'Universe 1' }]);
    });
    (service as any).loadInitialHeroes();
    service.getHeroes().pipe(first()).subscribe(heroes => {
      expect(heroes.length).toBe(1);
      expect(heroes[0].name).toBe('Hero 1');
      done();
    });
  });

  it('should add a hero', (done) => {
    const newHero: Hero = { id: 0, name: 'New Hero', alterEgo: 'New Alter Ego', power: 'New Power', universe: 'New Universe' };
    (service as any).heroes$.next([]);
    service.addHero(newHero).subscribe(() => {
      service.getHeroes().pipe(first()).subscribe(heroes => {
        expect(heroes.length).toBe(1);
        expect(heroes[0].name).toBe('New Hero');
        done();
      });
    });
  });

  it('should update a hero', (done) => {
    const initialHeroes: Hero[] = [{ id: 1, name: 'Hero 1', alterEgo: 'Alter Ego 1', power: 'Power 1', universe: 'Universe 1' }];
    (service as any).heroes$.next(initialHeroes);

    const updatedHero: Hero = { id: 1, name: 'Updated Hero', alterEgo: 'Updated Alter Ego', power: 'Updated Power', universe: 'Updated Universe' };
    service.updateHero(updatedHero).subscribe(() => {
      service.getHeroes().pipe(first()).subscribe(heroes => {
        expect(heroes.length).toBe(1);
        expect(heroes[0].name).toBe('Updated Hero');
        done();
      });
    });
  });

  it('should delete a hero', (done) => {
    (service as any).heroes$.next([{ id: 1, name: 'Hero 1', alterEgo: 'Alter Ego 1', power: 'Power 1', universe: 'Universe 1' }]);
    service.deleteHero(1).subscribe(() => {
      service.getHeroes().pipe(first()).subscribe(heroes => {
        expect(heroes.length).toBe(0);
        done();
      });
    });
  });

  it('should search heroes', (done) => {
    (service as any).heroes$.next([
      { id: 1, name: 'Hero 1', alterEgo: 'Alter Ego 1', power: 'Power 1', universe: 'Universe 1' },
      { id: 2, name: 'Hero 2', alterEgo: 'Alter Ego 2', power: 'Power 2', universe: 'Universe 2' }
    ]);
    service.searchHeroes('Hero 1').pipe(first()).subscribe(heroes => {
      expect(heroes.length).toBe(1);
      expect(heroes[0].name).toBe('Hero 1');
      done();
    });
  });

  it('should handle error when loading initial heroes', (done) => {
    spyOn(console, 'error'); 
    spyOn(window, 'fetch').and.returnValue(Promise.reject('Error loading heroes'));
  
    (service as any).loadInitialHeroes();
  
    setTimeout(() => {
      expect(console.error).toHaveBeenCalledWith('Error loading heroes:', 'Error loading heroes');
      done();
    }, 0);
  });
  

  it('should assign id 1 to the new hero if there are no heroes', (done) => {
    const newHero: Hero = { id: 0, name: 'New Hero', alterEgo: 'New Alter Ego', power: 'New Power', universe: 'New Universe' };
    (service as any).heroes$.next([]);
    service.addHero(newHero).subscribe(() => {
      service.getHeroes().pipe(first()).subscribe(heroes => {
        expect(heroes.length).toBe(1);
        expect(heroes[0].id).toBe(1);
        done();
      });
    });
  });
  
  it('should assign the correct id to the new hero if there are existing heroes', (done) => {
    const existingHeroes: Hero[] = [
      { id: 1, name: 'Hero 1', alterEgo: 'Alter Ego 1', power: 'Power 1', universe: 'Universe 1' },
      { id: 2, name: 'Hero 2', alterEgo: 'Alter Ego 2', power: 'Power 2', universe: 'Universe 2' }
    ];
    const newHero: Hero = { id: 0, name: 'New Hero', alterEgo: 'New Alter Ego', power: 'New Power', universe: 'New Universe' };
    (service as any).heroes$.next(existingHeroes);
    service.addHero(newHero).subscribe(() => {
      service.getHeroes().pipe(first()).subscribe(heroes => {
        expect(heroes.length).toBe(3);
        expect(heroes[2].id).toBe(3);
        done();
      });
    });
  });
  

});
