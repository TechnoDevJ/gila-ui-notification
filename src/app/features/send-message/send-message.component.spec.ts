import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SendMessageComponent } from './send-message.component';
import { CategoryService } from '../../core/services/category.service';
import { MessageService } from '../../core/services/message.service';
import { LogService } from '../../core/services/log.service';

describe('SendMessageComponent', () => {
  let component: SendMessageComponent;
  let fixture: ComponentFixture<SendMessageComponent>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let logServiceSpy: jasmine.SpyObj<LogService>;

  const mockCategories = [
    { id: 1, name: 'Sports' },
    { id: 2, name: 'Finance' },
  ];

  const mockMessage = {
    id: 1,
    categoryName: 'Sports',
    body: 'Test',
    createdAt: '2026-01-01T00:00:00',
  };

  beforeEach(async () => {
    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategories']);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['sendMessage']);
    logServiceSpy = jasmine.createSpyObj('LogService', ['getLogsByMessageId']);

    categoryServiceSpy.getCategories.and.returnValue(of(mockCategories));
    messageServiceSpy.sendMessage.and.returnValue(of(mockMessage));
    logServiceSpy.getLogsByMessageId.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [SendMessageComponent, NoopAnimationsModule, ReactiveFormsModule],
      providers: [
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: LogService, useValue: logServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SendMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    expect(categoryServiceSpy.getCategories).toHaveBeenCalled();
    expect(component.categories).toEqual(mockCategories);
  });

  it('should have form invalid when empty', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('should have form valid when filled', () => {
    component.form.setValue({ categoryName: 'Sports', body: 'Hello world' });
    expect(component.form.valid).toBeTrue();
  });

  it('should invalidate body exceeding maxLength', () => {
    const longText = 'a'.repeat(501);
    component.form.setValue({ categoryName: 'Sports', body: longText });
    expect(component.form.get('body')?.errors?.['maxlength']).toBeTruthy();
  });

  it('should compute remainingChars correctly', () => {
    component.form.get('body')?.setValue('Hello');
    expect(component.remainingChars).toBe(495);
  });

  it('should call sendMessage on valid submit', () => {
    component.form.setValue({ categoryName: 'Sports', body: 'Test message' });
    component.onSubmit();
    expect(messageServiceSpy.sendMessage).toHaveBeenCalledWith({
      categoryName: 'Sports',
      body: 'Test message',
    });
  });

  it('should not submit when form is invalid', () => {
    component.form.setValue({ categoryName: '', body: '' });
    component.onSubmit();
    expect(messageServiceSpy.sendMessage).not.toHaveBeenCalled();
  });

  it('should set sentMessage and start polling on success', () => {
    component.form.setValue({ categoryName: 'Sports', body: 'Test' });
    component.onSubmit();
    expect(component.sentMessage).toEqual(mockMessage);
    expect(component.pollingActive).toBeTrue();
  });

  it('should show error message on send failure', () => {
    messageServiceSpy.sendMessage.and.returnValue(
      throwError(() => ({ message: 'Category not found', status: 404 }))
    );
    component.form.setValue({ categoryName: 'Unknown', body: 'Test' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Category not found');
  });

  it('should reset form after successful send', () => {
    component.form.setValue({ categoryName: 'Sports', body: 'Test' });
    component.onSubmit();
    expect(component.form.get('categoryName')?.value).toBeNull();
    expect(component.form.get('body')?.value).toBeNull();
  });

  it('should show error when categories fail to load', () => {
    categoryServiceSpy.getCategories.and.returnValue(
      throwError(() => ({ status: 500 }))
    );
    component.ngOnInit();
    expect(component.errorMessage).toBe('Failed to load categories.');
  });
});
