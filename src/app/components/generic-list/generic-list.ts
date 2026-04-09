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

  public searchControl = new FormControl<string>('', {nonNullable: true})

  public items: InputSignal<T[]> = input.required<T[]>();
  public idKey: InputSignal<keyof T & string> = input.required<keyof T & string>();
  public displayWith: InputSignal<(item: T) => string> = input.required<(item: T) => string>();
  public searchKeys: InputSignal<StringKeys<T>[]> = input.required<StringKeys<T>[]>();

  public itemSelected: OutputEmitterRef<T> = output<T>();
  public selectItem(item: T): void {
    this.itemSelected.emit(item);
  }

  private searchTerm: Signal<string> = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ),
    {initialValue: ''}
  );

  public filteredItems: Signal<T[]> = computed(() => {
    const lowerTerm = this.searchTerm().toLowerCase();
    return this.items().filter(item =>
      this.searchKeys().some(key => (item[key] as string).toLowerCase().includes(lowerTerm))
    );
  });

}
