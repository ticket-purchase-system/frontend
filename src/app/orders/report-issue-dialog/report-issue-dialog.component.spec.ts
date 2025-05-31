import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportIssueDialogComponent } from './report-issue-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';

describe('ReportIssueDialogComponent', () => {
  let component: ReportIssueDialogComponent;
  let fixture: ComponentFixture<ReportIssueDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ReportIssueDialogComponent>>;

  const mockData = { description: 'Initial description' };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        ReportIssueDialogComponent,
        BrowserAnimationsModule 
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportIssueDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the dialog component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with provided data', () => {
    expect(component.form.get('description')?.value).toBe('Initial description');
  });

  it('should close dialog with description on valid submit', () => {
    component.form.setValue({ description: 'Something went wrong' });
    component.onSubmit();
    expect(mockDialogRef.close).toHaveBeenCalledWith('Something went wrong');
  });

  it('should not close dialog if form is invalid (empty)', () => {
    component.form.setValue({ description: '' });
    component.onSubmit();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog when cancel button is clicked', () => {
    const cancelBtn = fixture.debugElement.query(By.css('button[type="button"]'));
    cancelBtn.triggerEventHandler('click', null);
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should mark form as invalid if initial description is empty', () => {
    component = new ReportIssueDialogComponent(new FormBuilder(), mockDialogRef, { description: '' });
    expect(component.form.valid).toBeFalse();
  });
  
  it('should bind textarea to formControlName "description"', () => {
    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
    expect(textarea.getAttribute('formcontrolname')).toBe('description');
  });

});
