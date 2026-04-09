import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {GenericList} from './generic-list';
import {By} from '@angular/platform-browser';

interface Employee {
  id: number;
  name: string;
  position: string;
}

const EMPLOYEES: Employee[] = [
  {id: 1, name: 'Jan Kowalski', position: 'Developer'},
  {id: 2, name: 'Anna Nowak', position: 'Designer'},
  {id: 3, name: 'Piotr Wiśniewski', position: 'Manager'},
];

@Component({
  imports: [GenericList],
  template: `
    <app-generic-list
      [items]="employees"
      [idKey]="'id'"
      [displayWith]="displayFn"
      [searchKeys]="['name', 'position']"
      (itemSelected)="selected = $event"
    />
  `,
})
class TestHostComponent {
  employees = EMPLOYEES;
  displayFn = (emp: Employee) => `${emp.name} (${emp.position})`;
  selected: Employee | null = null;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getItems(fixture: ComponentFixture<TestHostComponent>) {
  return fixture.debugElement.queryAll(By.css('div'));
}

function getInput(fixture: ComponentFixture<TestHostComponent>) {
  return fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
}

function initAndSettle(fixture: ComponentFixture<TestHostComponent>) {
  fixture.detectChanges();
}

async function typeInSearch(fixture: ComponentFixture<TestHostComponent>, value: string) {
  const input = getInput(fixture);
  input.value = value;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
  await delay(350);
  fixture.detectChanges();
}

describe('GenericList', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    const list = fixture.debugElement.query(By.directive(GenericList));
    expect(list).toBeTruthy();
  });

  it('should display all items initially', async () => {
    initAndSettle(fixture);
    expect(getItems(fixture).length).toBe(3);
  });

  it('should render items using displayWith function', async () => {
    initAndSettle(fixture);

    const items = getItems(fixture);
    expect(items[0].nativeElement.textContent).toContain('Jan Kowalski (Developer)');
    expect(items[1].nativeElement.textContent).toContain('Anna Nowak (Designer)');
    expect(items[2].nativeElement.textContent).toContain('Piotr Wiśniewski (Manager)');
  });

  it('should emit itemSelected when an item is clicked', async () => {
    initAndSettle(fixture);

    const items = getItems(fixture);
    items[1].triggerEventHandler('click');
    fixture.detectChanges();

    expect(host.selected).toEqual({id: 2, name: 'Anna Nowak', position: 'Designer'});
  });

  it('should filter items by name search key', async () => {
    initAndSettle(fixture);
    await typeInSearch(fixture, 'anna');

    const items = getItems(fixture);
    expect(items.length).toBe(1);
    expect(items[0].nativeElement.textContent).toContain('Anna Nowak');
  });

  it('should filter items by position search key', async () => {
    initAndSettle(fixture);
    await typeInSearch(fixture, 'developer');

    const items = getItems(fixture);
    expect(items.length).toBe(1);
    expect(items[0].nativeElement.textContent).toContain('Jan Kowalski');
  });

  it('should be case-insensitive when filtering', async () => {
    initAndSettle(fixture);
    await typeInSearch(fixture, 'ANNA');

    const items = getItems(fixture);
    expect(items.length).toBe(1);
    expect(items[0].nativeElement.textContent).toContain('Anna Nowak');
  });

  it('should show no items when search matches nothing', async () => {
    initAndSettle(fixture);
    await typeInSearch(fixture, 'xyz');

    expect(getItems(fixture).length).toBe(0);
  });

  it('should debounce search input', async () => {
    initAndSettle(fixture);

    const input = getInput(fixture);
    input.value = 'anna';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    await delay(100);
    fixture.detectChanges();
    expect(getItems(fixture).length).toBe(3);

    await delay(250);
    fixture.detectChanges();
    expect(getItems(fixture).length).toBe(1);
  });

  it('should restore all items when search is cleared', async () => {
    initAndSettle(fixture);

    await typeInSearch(fixture, 'anna');
    expect(getItems(fixture).length).toBe(1);

    await typeInSearch(fixture, '');
    expect(getItems(fixture).length).toBe(3);
  });

  it('should search across multiple keys simultaneously', async () => {
    initAndSettle(fixture);

    await typeInSearch(fixture, 'an');

    const items = getItems(fixture);
    expect(items.length).toBe(3);
  });
});
