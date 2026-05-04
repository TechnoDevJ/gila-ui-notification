import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from './message.service';
import { environment } from '../../../environments/environment';

describe('MessageService', () => {
  let service: MessageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(MessageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a message successfully', () => {
    const request = { categoryName: 'Sports', body: 'Test message' };
    const response = { id: 1, categoryName: 'Sports', body: 'Test message', createdAt: '2026-01-01T00:00:00' };

    service.sendMessage(request).subscribe(r => {
      expect(r).toEqual(response);
      expect(r.id).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/messages`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(response, { status: 201, statusText: 'Created' });
  });

  it('should get messages successfully', () => {
    const response = [
      { id: 1, categoryName: 'Sports', body: 'Test', createdAt: '2026-01-01T00:00:00' },
    ];

    service.getMessages().subscribe(r => {
      expect(r).toEqual(response);
      expect(r.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/messages`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should handle 400 error on sendMessage', () => {
    service.sendMessage({ categoryName: '', body: '' }).subscribe({
      error: err => expect(err.status).toBe(400),
    });
    httpMock
      .expectOne(`${environment.apiUrl}/messages`)
      .flush({ message: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle 404 error on sendMessage', () => {
    service.sendMessage({ categoryName: 'Unknown', body: 'Test' }).subscribe({
      error: err => expect(err.status).toBe(404),
    });
    httpMock
      .expectOne(`${environment.apiUrl}/messages`)
      .flush({}, { status: 404, statusText: 'Not Found' });
  });

  it('should handle 500 error on getMessages', () => {
    service.getMessages().subscribe({
      error: err => expect(err.status).toBe(500),
    });
    httpMock
      .expectOne(`${environment.apiUrl}/messages`)
      .flush({}, { status: 500, statusText: 'Server Error' });
  });
});
