import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { environment } from '../../../environments/environment';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch categories successfully', () => {
    const mockCategories = [
      { id: 1, name: 'Sports' },
      { id: 2, name: 'Finance' },
    ];
    service.getCategories().subscribe(cats => {
      expect(cats).toEqual(mockCategories);
      expect(cats.length).toBe(2);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);
  });

  it('should handle 400 error', () => {
    service.getCategories().subscribe({
      error: err => expect(err.status).toBe(400),
    });
    httpMock
      .expectOne(`${environment.apiUrl}/categories`)
      .flush({}, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle 500 error', () => {
    service.getCategories().subscribe({
      error: err => expect(err.status).toBe(500),
    });
    httpMock
      .expectOne(`${environment.apiUrl}/categories`)
      .flush({}, { status: 500, statusText: 'Server Error' });
  });
});
