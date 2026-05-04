import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LogsComponent } from './logs.component';
import { LogService } from '../../core/services/log.service';

describe('LogsComponent', () => {
  let component: LogsComponent;
  let fixture: ComponentFixture<LogsComponent>;
  let logServiceSpy: jasmine.SpyObj<LogService>;

  const mockLogs = [
    {
      id: 1,
      messageId: 7,
      userId: 1,
      userName: 'Alice',
      channelType: 'EMAIL' as const,
      status: 'SENT' as const,
      attempts: 1,
      errorMessage: null,
      sentAt: '2026-01-01T00:00:01',
    },
  ];

  function createComponent(queryParams: Record<string, string> = {}) {
    return TestBed.configureTestingModule({
      imports: [LogsComponent, NoopAnimationsModule, RouterTestingModule],
      providers: [
        { provide: LogService, useValue: logServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of(queryParams) },
        },
      ],
    }).compileComponents();
  }

  beforeEach(async () => {
    logServiceSpy = jasmine.createSpyObj('LogService', ['getLogs', 'getLogsByMessageId']);
    logServiceSpy.getLogs.and.returnValue(of(mockLogs));
    logServiceSpy.getLogsByMessageId.and.returnValue(of(mockLogs));

    await createComponent();
    fixture = TestBed.createComponent(LogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getLogs when no messageId param', () => {
    expect(logServiceSpy.getLogs).toHaveBeenCalled();
    expect(component.messageId).toBeNull();
  });

  it('should show title "All Notification Logs" with no messageId', () => {
    expect(component.pageTitle).toBe('All Notification Logs');
  });

  it('should load logs on init', () => {
    expect(component.logs).toEqual(mockLogs);
  });

  it('should show error when logs fail to load', () => {
    logServiceSpy.getLogs.and.returnValue(
      throwError(() => ({ status: 500 }))
    );
    component.loadLogs();
    expect(component.errorMessage).toBe('Failed to load logs.');
  });

  it('should set loading to false after success', () => {
    expect(component.loading).toBeFalse();
  });
});

describe('LogsComponent with messageId', () => {
  let component: LogsComponent;
  let fixture: ComponentFixture<LogsComponent>;
  let logServiceSpy: jasmine.SpyObj<LogService>;

  const mockLogs = [
    {
      id: 1,
      messageId: 5,
      userId: 1,
      userName: 'Bob',
      channelType: 'PUSH' as const,
      status: 'FAILED' as const,
      attempts: 3,
      errorMessage: 'Push service unavailable',
      sentAt: null,
    },
  ];

  beforeEach(async () => {
    logServiceSpy = jasmine.createSpyObj('LogService', ['getLogs', 'getLogsByMessageId']);
    logServiceSpy.getLogsByMessageId.and.returnValue(of(mockLogs));

    await TestBed.configureTestingModule({
      imports: [LogsComponent, NoopAnimationsModule, RouterTestingModule],
      providers: [
        { provide: LogService, useValue: logServiceSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({ messageId: '5' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call getLogsByMessageId when messageId param present', () => {
    expect(logServiceSpy.getLogsByMessageId).toHaveBeenCalledWith(5);
    expect(component.messageId).toBe(5);
  });

  it('should show title with messageId', () => {
    expect(component.pageTitle).toBe('Logs for Message #5');
  });

  it('should load filtered logs', () => {
    expect(component.logs).toEqual(mockLogs);
  });
});
