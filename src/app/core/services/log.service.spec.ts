import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LogService } from './log.service';
import { environment } from '../../../environments/environment';

describe('LogService', () => {
  let service: LogService;
  let httpMock: HttpTestingController;

  const mockLog = {
    id: 1,
    messageId: 7,
    userId: 1,
    userName: 'Alice',
    channelType: 'EMAIL' as const,
    status: 'SENT' as const,
    attempts: 1,
    errorMessage: null,
    sentAt: '2026-01-01T00:00:01',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(LogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all logs successfully', () => {
    service.getLogs().subscribe(logs => {
      expect(logs).toEqual([mockLog]);
      expect(logs.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/logs`);
    expect(req.request.method).toBe('GET');
    req.flush([mockLog]);
  });

  it('should get logs by messageId successfully', () => {
    service.getLogsByMessageId(7).subscribe(logs => {
      expect(logs).toEqual([mockLog]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/logs/7`);
    expect(req.request.method).toBe('GET');
    req.flush([mockLog]);
  });

  it('should return empty array when no logs for messageId', () => {
    service.getLogsByMessageId(999).subscribe(logs => {
      expect(logs).toEqual([]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/logs/999`);
    req.flush([]);
  });

  it('should handle 400 error on getLogs', () => {
    service.getLogs().subscribe({
      error: err => expect(err.status).toBe(400),
    });
    httpMock
      .expectOne(`${environment.apiUrl}/logs`)
      .flush({}, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle 500 error on getLogs', () => {
    service.getLogs().subscribe({
      error: err => expect(err.status).toBe(500),
    });
    httpMock
      .expectOne(`${environment.apiUrl}/logs`)
      .flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('should handle 500 error on getLogsByMessageId', () => {
    service.getLogsByMessageId(1).subscribe({
      error: err => expect(err.status).toBe(500),
    });
    httpMock
      .expectOne(`${environment.apiUrl}/logs/1`)
      .flush({}, { status: 500, statusText: 'Server Error' });
  });
});
