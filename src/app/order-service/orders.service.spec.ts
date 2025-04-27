import { TestBed } from '@angular/core/testing';
import { OrdersService, Order } from './order.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;

  const mockOrder: Order = {
    id: 1,
    products: [],
    date: new Date(),
    price: 100,
    rabatCode: '',
    review: null,
    phoneNumber: '123456789',
    email: 'test@example.com',
    city: 'Miasto',
    address: 'Ulica 123'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrdersService],
    });

    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get user orders', () => {
    service.getUserOrders(1).subscribe((orders) => {
      expect(orders.length).toBe(1);
      expect(orders[0].id).toEqual(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/user/1`);
    expect(req.request.method).toBe('GET');
    req.flush([mockOrder]);
  });

  it('should get order by ID', () => {
    service.getOrder(1).subscribe((order) => {
      expect(order.id).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrder);
  });

  it('should create an order', () => {
    service.createOrder(mockOrder).subscribe((order) => {
      expect(order.id).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders`);
    expect(req.request.method).toBe('POST');
    req.flush(mockOrder);
  });

  it('should update an order', () => {
    const changes = { city: 'Nowe Miasto' };
    service.updateOrder(1, changes).subscribe((order) => {
      expect(order.city).toBe('Nowe Miasto');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockOrder, ...changes });
  });

  it('should delete an order', () => {
    service.deleteOrder(1).subscribe((resp) => {
      expect(resp).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});
