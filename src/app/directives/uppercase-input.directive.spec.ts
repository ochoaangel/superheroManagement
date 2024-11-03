import { UppercaseInputDirective } from './uppercase-input.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

@Component({
  template: `<input appUppercaseInput>`
})
class TestComponent { }

describe('UppercaseInputDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let inputEl: HTMLInputElement;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [UppercaseInputDirective],
      declarations: [TestComponent]
    }).createComponent(TestComponent);

    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector('input');
  });

  it('should convert input value to uppercase', () => {
    inputEl.value = 'test';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(inputEl.value).toBe('TEST');
  });
});
