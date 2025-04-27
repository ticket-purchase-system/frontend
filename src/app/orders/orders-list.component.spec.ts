import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { OrdersListComponent } from './orders-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { OrdersService } from '../order-service/order.service';
import { AuthService } from '../auth/auth.service';
import { Order } from '../order-service/order.service';
import { User } from '../auth/auth.service';

describe('OrdersListComponent', () => {
  let component: OrdersListComponent;
  let fixture: ComponentFixture<OrdersListComponent>;
  let mockOrdersService: jasmine.SpyObj<OrdersService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockUser: User = {
    id: 123,
    username: 'testUser',
    password: 'secret',
    role: 'user',
  };

  const mockOrders: Order[] = [
    {
      id: 1,
      products: [],
      date: new Date(),
      price: 99.99,
      rabatCode: 'ABC',
      review: null,
      phoneNumber: '123456789',
      email: 'test1@example.com',
      city: 'Warszawa',
      address: 'ul. Testowa 1',
    },
    {
      id: 2,
      products: [],
      date: new Date(),
      price: 49.50,
      rabatCode: '',
      review: null,
      phoneNumber: '987654321',
      email: 'test2@example.com',
      city: 'Kraków',
      address: 'ul. Przykładowa 5',
    },
  ];

  beforeEach(async () => {
    mockOrdersService = jasmine.createSpyObj('OrdersService', ['getUserOrders']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [OrdersListComponent, HttpClientTestingModule],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch orders for authenticated user', fakeAsync(() => {
    mockAuthService.getCurrentUser.and.returnValue(of(mockUser));
    mockOrdersService.getUserOrders.and.returnValue(of(mockOrders));

    fixture.detectChanges();
    tick();

    expect(component.currentUser).toEqual(mockUser);
    expect(component.orders.length).toBe(2);
    expect(component.loading).toBeFalse();
  }));

  it('should handle error if fetching orders fails', fakeAsync(() => {
    mockAuthService.getCurrentUser.and.returnValue(of(mockUser));
    mockOrdersService.getUserOrders.and.returnValue(throwError(() => new Error('fail')));

    fixture.detectChanges();
    tick();

    expect(component.error).toContain('Wystąpił błąd');
    expect(component.loading).toBeFalse();
  }));

  it('should show error if user is not logged in', fakeAsync(() => {
    mockAuthService.getCurrentUser.and.returnValue(of(null));

    fixture.detectChanges();
    tick();

    expect(component.currentUser).toBeNull();
    expect(component.error).toContain('Nie udało się załadować');
    expect(component.loading).toBeFalse();
  }));

  it('should select and clear selected order', () => {
    component.selectOrder(mockOrders[0]);
    expect(component.selectedOrder).toEqual(mockOrders[0]);

    component.clearSelection();
    expect(component.selectedOrder).toBeNull();
  });

  it('should open dialog and send email after dialog is closed with email', fakeAsync(() => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of('sent@example.com'), close: null });
    mockDialog.open.and.returnValue(dialogRefSpyObj);

    spyOn(localStorage, 'getItem').and.returnValue('FAKE_TOKEN');
    const httpSpy = spyOn(component['http'], 'post').and.returnValue(of({}));

    component.sendTicketByEmail(mockOrders[0]);
    tick();

    expect(mockDialog.open).toHaveBeenCalled();
    expect(httpSpy).toHaveBeenCalled();
  }));

  it('should not call API if no token is found', fakeAsync(() => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of('sent@example.com'), close: null });
    mockDialog.open.and.returnValue(dialogRefSpyObj);

    spyOn(localStorage, 'getItem').and.returnValue(null);
    const httpSpy = spyOn(component['http'], 'post');

    component.sendTicketByEmail(mockOrders[0]);
    tick();

    expect(httpSpy).not.toHaveBeenCalled();
  }));

  it('should do nothing if dialog result is falsy', fakeAsync(() => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(undefined), close: null });
    mockDialog.open.and.returnValue(dialogRefSpyObj);

    const httpSpy = spyOn(component['http'], 'post');

    component.sendTicketByEmail(mockOrders[0]);
    tick();

    expect(httpSpy).not.toHaveBeenCalled();
  }));
});
