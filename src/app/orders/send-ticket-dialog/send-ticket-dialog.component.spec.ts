import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SendTicketDialogComponent } from './send-ticket-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('SendTicketDialogComponent', () => {
  let component: SendTicketDialogComponent;
  let fixture: ComponentFixture<SendTicketDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<SendTicketDialogComponent>>;

  const mockDialogData = { email: 'test@example.com' };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        SendTicketDialogComponent,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SendTicketDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component and initialize form with provided email', () => {
    expect(component).toBeTruthy();
    expect(component.form.value.email).toBe('test@example.com');
  });

  it('should close dialog without data on cancel', () => {
    const cancelBtn = fixture.debugElement.queryAll(By.css('button'))[0];
    cancelBtn.triggerEventHandler('click');
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should close dialog with email value on submit when form is valid', () => {
    component.form.setValue({ email: 'sent@example.com' });
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', {});
    expect(dialogRefSpy.close).toHaveBeenCalledWith('sent@example.com');
  });

  it('should not close dialog if form is invalid', () => {
    component.form.setValue({ email: '' });
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', {});
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should mark form as invalid if email is empty', () => {
  component.form.setValue({ email: '' });
  expect(component.form.invalid).toBeTrue();
});
});
