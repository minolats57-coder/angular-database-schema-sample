import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { LogService } from './log.service';

describe('AuthService', () => {
  let service: AuthService;
  let logService: jasmine.SpyObj<LogService>;

  beforeEach(() => {
    const logSpy = jasmine.createSpyObj('LogService', ['log']);
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: LogService, useValue: logSpy },
      ]
    });
    service = TestBed.inject(AuthService);
    logService = TestBed.inject(LogService) as jasmine.SpyObj<LogService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockUser = { username: 'testuser', password: 'password123' };
      const mockResponse = { id: 1, username: 'testuser' };
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(JSON.stringify(mockResponse))));

      const result = await service.register(mockUser);

      expect(window.fetch).toHaveBeenCalledWith('http://localhost:3000/register', jasmine.any(Object));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('login', () => {
    it('should log in a user and store tokens', async () => {
      const mockCredentials = { username: 'testuser', password: 'password123' };
      const mockResponse = { accessToken: 'mockAccessToken', refreshToken: 'mockRefreshToken' };
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 })));

      const result = await service.login(mockCredentials);

      expect(window.fetch).toHaveBeenCalledWith('http://localhost:3000/login', jasmine.any(Object));
      expect(result).toEqual(mockResponse);
      expect(service.getAccessToken()).toBe('mockAccessToken');
      expect(service.getRefreshToken()).toBe('mockRefreshToken');
    });
  });

  describe('refresh', () => {
    it('should refresh the access token', async () => {
      service.login({ username: 'testuser', password: 'password123' });
      const mockResponse = { accessToken: 'newMockAccessToken' };
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 })));

      const result = await service.refresh();

      expect(window.fetch).toHaveBeenCalledWith('http://localhost:3000/refresh', jasmine.any(Object));
      expect(result).toEqual(mockResponse);
      expect(service.getAccessToken()).toBe('newMockAccessToken');
    });
  });
});
