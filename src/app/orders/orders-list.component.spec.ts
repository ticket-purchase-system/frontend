import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { OrdersListComponent } from './orders-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { OrdersService } from '../order-service/order.service';
import { AuthService } from '../auth/auth.service';
import { Order } from '../order-service/order.service';
import { User } from '../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Review, ReviewService } from '../review-service.service';
import { HttpClient } from '@angular/common/http';

describe('OrdersListComponent', () => {
  let component: OrdersListComponent;
  let fixture: ComponentFixture<OrdersListComponent>;
  let mockOrdersService: jasmine.SpyObj<OrdersService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let mockReviewService: jasmine.SpyObj<ReviewService>;

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
  snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
  mockReviewService = jasmine.createSpyObj('ReviewService', ['addReview', 'deleteReview', 'updateReview']);

  await TestBed.configureTestingModule({
    imports: [OrdersListComponent, HttpClientTestingModule],
    providers: [
      { provide: OrdersService, useValue: mockOrdersService },
      { provide: AuthService, useValue: mockAuthService },
      { provide: MatDialog, useValue: mockDialog },
      { provide: MatSnackBar, useValue: snackBar },
      { provide: ReviewService, useValue: mockReviewService },
    ],
  }).compileComponents();

  fixture = TestBed.createComponent(OrdersListComponent);
  component = fixture.componentInstance;
});

afterEach(() => {
  localStorage.clear();
  mockOrdersService.getUserOrders.calls.reset();
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

    expect(component.error).toContain('An error occurred');
    expect(component.loading).toBeFalse();
  }));

  it('should show error if user is not logged in', fakeAsync(() => {
    mockAuthService.getCurrentUser.and.returnValue(of(null));

    fixture.detectChanges();
    tick();

    expect(component.currentUser).toBeNull();
    expect(component.error).toContain('Failed to load user data.');
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
  it('should download ticket PDF successfully', fakeAsync(() => {
    const blob = new Blob(['PDF content'], { type: 'application/pdf' });
    const httpGetSpy = spyOn(component['http'], 'get').and.returnValue(of(blob));
    spyOn(localStorage, 'getItem').and.returnValue('FAKE_TOKEN');

    const createElementSpy = spyOn(document, 'createElement').and.callThrough();

    component.downloadTicketPdf(mockOrders[0]);
    tick();

    expect(httpGetSpy).toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(snackBar.open).toHaveBeenCalledWith('PDF downloaded.', 'Close', { duration: 3000 });
  }));

  it('should handle error when downloading PDF fails', fakeAsync(() => {
    spyOn(component['http'], 'get').and.returnValue(throwError(() => new Error('Download error')));
    spyOn(localStorage, 'getItem').and.returnValue('FAKE_TOKEN');

    component.downloadTicketPdf(mockOrders[0]);
    tick();

    expect(snackBar.open).toHaveBeenCalledWith('Failed to download PDF.', 'Close', { duration: 3000 });
  }));

  it('should correctly generate star rating', () => {
    const review = { numberOfStars: '3' } as any;
    const rating = component.getStarRating(review);
    expect(rating).toBe('★★★☆☆');
  });

  it('should return empty string when review is null', () => {
    expect(component.getStarRating(null)).toBe('');
  });

  it('should open report issue dialog and send issue', fakeAsync(() => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of('Problem with order'), close: null });
    mockDialog.open.and.returnValue(dialogRefSpyObj);

    const httpPostSpy = spyOn(component['http'], 'post').and.returnValue(of({}));
    spyOn(component, 'loadOrderFlags');

    component.reportIssue(mockOrders[0]);
    tick();

    expect(httpPostSpy).toHaveBeenCalled();
    expect(component.loadOrderFlags).toHaveBeenCalledWith(mockOrders[0].id);
    expect(snackBar.open).toHaveBeenCalledWith('Issue reported successfully.', 'Close', { duration: 5000 });
  }));

  it('should open refund request dialog and send refund', fakeAsync(() => {
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of('Want refund'), close: null });
    mockDialog.open.and.returnValue(dialogRefSpyObj);

    const httpPostSpy = spyOn(component['http'], 'post').and.returnValue(of({}));
    spyOn(component, 'loadOrderFlags');

    component.requestRefund(mockOrders[0]);
    tick();

    expect(httpPostSpy).toHaveBeenCalled();
    expect(component.loadOrderFlags).toHaveBeenCalledWith(mockOrders[0].id);
    expect(snackBar.open).toHaveBeenCalledWith('Refund request submitted.', 'Close', { duration: 5000 });
  }));

it('should load order flags (hasIssue and hasRefund)', fakeAsync(() => {
  const orderId = mockOrders[0].id;
  const http = TestBed.inject(HttpClient);

const httpGetSpy = spyOn(http, 'get').and.callFake((url: string) => {
  if (url.includes('has-issue')) return of({ hasIssue: true } as { hasIssue: boolean });
  if (url.includes('has-refund')) return of({ hasRefund: true } as { hasRefund: boolean });
  return of({} as any);
});

  component.loadOrderFlags(orderId);
  tick();

  expect(httpGetSpy).toHaveBeenCalledTimes(2);
  expect(component.hasIssueMap[orderId]).toBeTrue();
  expect(component.hasRefundMap[orderId]).toBeTrue();
}));

it('should add a review if none exists', fakeAsync(() => {
  const mockReview: Review = {
    numberOfStars: '5', comment: 'Great!',
    rating: 0
  };
  const order = mockOrders[0];
  order.review = null;

  mockReviewService.addReview.and.returnValue(of(mockReview));

  const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(mockReview), close: null });
  mockDialog.open.and.returnValue(dialogRefSpyObj);

  component.submitReview(order);
  tick();

  expect(mockReviewService.addReview).toHaveBeenCalledWith(order.id, mockReview);
  expect(order.review).toEqual(jasmine.objectContaining(mockReview));
}));

it('should delete review after confirmation', fakeAsync(() => {
  mockReviewService.deleteReview.and.returnValue(of(void 0));

  const order = { ...mockOrders[0], review: { numberOfStars: '4', comment: 'OK' } as Review };
  spyOn(window, 'confirm').and.returnValue(true);

  component.deleteReview(order);
  tick();

  expect(mockReviewService.deleteReview).toHaveBeenCalledWith(order.id);
  expect(order.review).toBeNull();
}));


it('should call loadOrders on init', fakeAsync(() => {
  const loadOrdersSpy = spyOn(component, 'loadOrders');
  component.ngOnInit();
  expect(loadOrdersSpy).toHaveBeenCalled();
}));

});