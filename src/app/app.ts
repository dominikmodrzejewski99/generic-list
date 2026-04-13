import {ChangeDetectionStrategy, Component, signal, WritableSignal} from '@angular/core';
import {GenericList} from './components/generic-list/generic-list';
import {Employee} from './shared/models/employee.model';
import {StringKeys} from './shared/models/types';

@Component({
  selector: 'app-root',
  imports: [
    GenericList
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {

  public readonly key: keyof Employee & string = 'id';
  public readonly searchKeys: StringKeys<Employee>[] = ['name'];
  public formatEmployee: (item: Employee) => string = (item: Employee) => item.name;

  public employees: Employee[] = [
    {id: 1, name: 'Jan Kowalski'},
    {id: 2, name: 'Anna Nowak'}
  ];

  public onSelect(employee: Employee): void {
    console.log('Wybrano:', employee);
  }
}
