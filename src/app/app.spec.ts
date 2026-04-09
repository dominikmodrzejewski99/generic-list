import {ComponentFixture, TestBed} from '@angular/core/testing';
import {App} from './app';
import {By} from '@angular/platform-browser';
import {GenericList} from './components/generic-list/generic-list';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let app: App;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('should have employees data', () => {
    expect(app.employees.length).toBe(2);
    expect(app.employees[0]).toEqual({id: 1, name: 'Jan Kowalski'});
    expect(app.employees[1]).toEqual({id: 2, name: 'Anna Nowak'});
  });

  it('should have idKey set to "id"', () => {
    expect(app.key()).toBe('id');
  });

  it('should have searchKeys set to ["name"]', () => {
    expect(app.searchKeys()).toEqual(['name']);
  });

  it('should format employee name', () => {
    const result = app.formatEmployee({id: 1, name: 'Test'});
    expect(result).toBe('Test');
  });

  it('should log selected employee', () => {
    const spy = vi.spyOn(console, 'log');
    const employee = {id: 1, name: 'Jan Kowalski'};

    app.onSelect(employee);

    expect(spy).toHaveBeenCalledWith('Wybrano:', employee);
  });

  it('should render generic-list component', () => {
    fixture.detectChanges();
    const list = fixture.debugElement.query(By.directive(GenericList));
    expect(list).toBeTruthy();
  });

  it('should pass employees to generic-list', () => {
    fixture.detectChanges();
    const list = fixture.debugElement.query(By.directive(GenericList));
    const component = list.componentInstance as GenericList<any>;
    expect(component.items()).toEqual(app.employees);
  });
});
