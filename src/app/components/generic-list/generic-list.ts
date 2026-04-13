import {ChangeDetectionStrategy, Component, computed, input, InputSignal, output, OutputEmitterRef, Signal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {StringKeys} from '../../shared/models/types';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-generic-list',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './generic-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericList<T> {

  protected searchControl = new FormControl<string>('', {nonNullable: true});

  public items = input.required<T[]>();
  public idKey = input.required<keyof T & string>();
  public displayWith = input.required<(item: T) => string>();
  public searchKeys = input.required<StringKeys<T>[]>();
  public itemSelected = output<T>();

  protected selectItem(item: T): void {
    this.itemSelected.emit(item);
  }

  private searchTerm: Signal<string> = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ),
    {initialValue: ''}
  );

  protected filteredItems: Signal<T[]> = computed(() => {
    const lowerTerm = this.searchTerm().toLowerCase().trim();

    if (!lowerTerm) return this.items();

    return this.items().filter(item =>
      this.searchKeys().some(key => {
        const value = item[key];
        return typeof value === 'string' && value.toLowerCase().includes(lowerTerm);
      })
    );

  });

}
