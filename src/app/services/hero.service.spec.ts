import { TestBed } from '@angular/core/testing';
import { HeroService } from './hero.service';
import { Hero } from '../models/hero.model';
import { firstValueFrom } from 'rxjs';

describe('HeroService', () => {
  let service: HeroService;
  let mockHeroes: Hero[];

  beforeEach(() => {
    localStorage.clear();

    mockHeroes = [
      { id: 1, name: 'Superman', alterEgo: 'Clark Kent', power: 'Flight', universe: 'DC' },
      { id: 2, name: 'Spider-Man', alterEgo: 'Peter Parker', power: 'Web-slinging', universe: 'Marvel' }
    ];

    TestBed.configureTestingModule({
      providers: [HeroService]
    });

    service = TestBed.inject(HeroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadInitialHeroes', () => {
    it('should load heroes from localStorage if available', async () => {
      localStorage.setItem('heroes', JSON.stringify(mockHeroes));
      await service['loadInitialHeroes']();
      const heroes = await firstValueFrom(service.getHeroes());
      expect(heroes).toEqual(mockHeroes);
    });

    it('should load heroes from json file if localStorage is empty', async () => {
      const fetchSpy = spyOn(window, 'fetch').and.returnValue(
        Promise.resolve(new Response(JSON.stringify(mockHeroes)))
      );

      await service['loadInitialHeroes']();
      const heroes = await firstValueFrom(service.getHeroes());

      expect(heroes).toEqual(mockHeroes);
      expect(fetchSpy).toHaveBeenCalledWith('assets/json/heroes.json');
      expect(localStorage.getItem('heroes')).toBe(JSON.stringify(mockHeroes));
    });

    it('should handle errors when loading from json file', async () => {
      const consoleSpy = spyOn(console, 'error');
      spyOn(window, 'fetch').and.returnValue(Promise.reject('Network error'));

      await service['loadInitialHeroes']();

      expect(consoleSpy).toHaveBeenCalledWith('Error loading heroes:', 'Network error');
    });
  });

  describe('getHeroes', () => {
    it('should return an observable of all heroes', async () => {
      service['heroes$'].next(mockHeroes);
      const heroes = await firstValueFrom(service.getHeroes());
      expect(heroes).toEqual(mockHeroes);
    });
  });

  describe('getHero', () => {
    it('should return the hero with the specified id', async () => {
      service['heroes$'].next(mockHeroes);
      const hero = await firstValueFrom(service.getHero(1));
      expect(hero).toEqual(mockHeroes[0]);
    });

    it('should return undefined if hero is not found', async () => {
      service['heroes$'].next(mockHeroes);
      const hero = await firstValueFrom(service.getHero(999));
      expect(hero).toBeUndefined();
    });
  });

  describe('addHero', () => {
    it('should add a new hero with an incremented id', async () => {
      service['heroes$'].next(mockHeroes);

      const newHero: Hero = {
        id: 0,
        name: 'Batman',
        alterEgo: 'Bruce Wayne',
        power: 'Intelligence',
        universe: 'DC'
      };

      await firstValueFrom(service.addHero(newHero));
      const heroes = await firstValueFrom(service.getHeroes());

      expect(heroes.length).toBe(3);
      expect(heroes[2].id).toBe(3);
      expect(localStorage.getItem('heroes')).toBe(JSON.stringify(heroes));
    });

    it('should set id to 1 if heroes array is empty', async () => {
      service['heroes$'].next([]);

      const newHero: Hero = {
        id: 0,
        name: 'Batman',
        alterEgo: 'Bruce Wayne',
        power: 'Intelligence',
        universe: 'DC'
      };

      await firstValueFrom(service.addHero(newHero));
      const heroes = await firstValueFrom(service.getHeroes());

      expect(heroes[0].id).toBe(1);
    });
  });

  describe('updateHero', () => {
    it('should update an existing hero', async () => {
      service['heroes$'].next(mockHeroes);

      const updatedHero = { ...mockHeroes[0], name: 'Updated Superman' };
      await firstValueFrom(service.updateHero(updatedHero));

      const heroes = await firstValueFrom(service.getHeroes());
      expect(heroes[0].name).toBe('Updated Superman');
      expect(localStorage.getItem('heroes')).toBe(JSON.stringify(heroes));
    });
  });

  describe('deleteHero', () => {
    it('should delete the hero with the specified id', async () => {
      service['heroes$'].next(mockHeroes);

      await firstValueFrom(service.deleteHero(1));
      const heroes = await firstValueFrom(service.getHeroes());

      expect(heroes.length).toBe(1);
      expect(heroes[0].id).toBe(2);
      expect(localStorage.getItem('heroes')).toBe(JSON.stringify(heroes));
    });
  });

  describe('searchHeroes', () => {
    it('should return heroes matching the search term in name', async () => {
      service['heroes$'].next(mockHeroes);
      const results = await firstValueFrom(service.searchHeroes('super'));
      expect(results).toEqual([mockHeroes[0]]);
    });

    it('should return heroes matching the search term in alterEgo', async () => {
      service['heroes$'].next(mockHeroes);
      const results = await firstValueFrom(service.searchHeroes('parker'));
      expect(results).toEqual([mockHeroes[1]]);
    });

    it('should return heroes matching the search term in power', async () => {
      service['heroes$'].next(mockHeroes);
      const results = await firstValueFrom(service.searchHeroes('flight'));
      expect(results).toEqual([mockHeroes[0]]);
    });

    it('should return heroes matching the search term in universe', async () => {
      service['heroes$'].next(mockHeroes);
      const results = await firstValueFrom(service.searchHeroes('dc'));
      expect(results).toEqual([mockHeroes[0]]);
    });

    it('should return empty array when no matches found', async () => {
      service['heroes$'].next(mockHeroes);
      const results = await firstValueFrom(service.searchHeroes('xyz'));
      expect(results).toEqual([]);
    });
  });
});