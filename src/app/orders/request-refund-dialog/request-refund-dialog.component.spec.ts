import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestRefundDialogComponent } from './request-refund-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder, Validators } from '@angular/forms';

describe('RequestRefundDialogComponent', () => {
  let component: RequestRefundDialogComponent;
  let fixture: ComponentFixture<RequestRefundDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<RequestRefundDialogComponent>>;

  const mockData = { reason: 'Initial reason' };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        RequestRefundDialogComponent,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestRefundDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with provided data', () => {
    expect(component.form.get('reason')?.value).toBe('Initial reason');
  });

  it('should close dialog with reason on valid submit', () => {
    component.form.setValue({ reason: 'Refund because of an issue' });
    component.onSubmit();
    expect(mockDialogRef.close).toHaveBeenCalledWith('Refund because of an issue');
  });

  it('should not close dialog if form is invalid (empty)', () => {
    component.form.setValue({ reason: '' });
    component.onSubmit();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog when cancel button is clicked', () => {
    const cancelBtn = fixture.debugElement.query(By.css('button[type="button"]'));
    cancelBtn.triggerEventHandler('click', null);
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should mark form as invalid if initial reason is empty', () => {
    const newComponent = new RequestRefundDialogComponent(new FormBuilder(), mockDialogRef, { reason: '' });
    expect(newComponent.form.valid).toBeFalse();
  });
});
