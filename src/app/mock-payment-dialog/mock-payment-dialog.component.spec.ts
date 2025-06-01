import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockPaymentDialogComponent } from './mock-payment-dialog.component';

describe('MockPaymentDialogComponent', () => {
  let component: MockPaymentDialogComponent;
  let fixture: ComponentFixture<MockPaymentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockPaymentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MockPaymentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
