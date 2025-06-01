import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmitReviewDialogComponent } from './submit-review-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('SubmitReviewDialogComponent', () => {
  let component: SubmitReviewDialogComponent;
  let fixture: ComponentFixture<SubmitReviewDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<SubmitReviewDialogComponent>>;

  const mockData = { stars: 4, comment: 'Pretty good' };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [SubmitReviewDialogComponent, BrowserAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitReviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with provided data', () => {
    expect(component.form.get('stars')?.value).toBe(4);
    expect(component.form.get('comment')?.value).toBe('Pretty good');
  });

  it('should close dialog with form data when submitted with valid input', () => {
    component.form.setValue({ stars: 5, comment: 'Awesome!' });
    component.onSubmit();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ stars: 5, comment: 'Awesome!' });
  });

  it('should not close dialog if form is invalid (stars empty)', () => {
    component.form.setValue({ stars: null, comment: 'No rating' });
    component.onSubmit();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should close dialog when cancel button is clicked', () => {
    const cancelButton = fixture.debugElement.query(By.css('button[type="button"]'));
    cancelButton.triggerEventHandler('click');
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
