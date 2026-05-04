import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { MessagesComponent } from './messages.component';
import { MessageService } from '../../core/services/message.service';

describe('MessagesComponent', () => {
  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const mockMessages = [
    { id: 1, categoryName: 'Sports', body: 'Test message', createdAt: '2026-01-01T00:00:00' },
    { id: 2, categoryName: 'Finance', body: 'Another message', createdAt: '2026-01-02T00:00:00' },
  ];

  beforeEach(async () => {
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['getMessages']);
    messageServiceSpy.getMessages.and.returnValue(of(mockMessages));

    await TestBed.configureTestingModule({
      imports: [MessagesComponent, NoopAnimationsModule, RouterTestingModule],
      providers: [{ provide: MessageService, useValue: messageServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load messages on init', () => {
    expect(messageServiceSpy.getMessages).toHaveBeenCalled();
    expect(component.messages).toEqual(mockMessages);
  });

  it('should display correct number of messages', () => {
    expect(component.messages.length).toBe(2);
  });

  it('should truncate long body text', () => {
    const longText = 'a'.repeat(100);
    const result = component.truncate(longText);
    expect(result.length).toBeLessThanOrEqual(83);
    expect(result.endsWith('...')).toBeTrue();
  });

  it('should not truncate short body text', () => {
    const shortText = 'Short text';
    expect(component.truncate(shortText)).toBe(shortText);
  });

  it('should show error when messages fail to load', () => {
    messageServiceSpy.getMessages.and.returnValue(
      throwError(() => ({ status: 500 }))
    );
    component.loadMessages();
    expect(component.errorMessage).toBe('Failed to load messages.');
  });

  it('should set loading to false after success', () => {
    expect(component.loading).toBeFalse();
  });

  it('should set loading to false after error', () => {
    messageServiceSpy.getMessages.and.returnValue(
      throwError(() => ({ status: 500 }))
    );
    component.loadMessages();
    expect(component.loading).toBeFalse();
  });
});
