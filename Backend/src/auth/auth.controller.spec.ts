import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = () => ({
  signup: jest.fn(),
  signin: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
});

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useFactory: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('signup calls authService.signup', async () => {
    const dto = { username: 'test', password: 'pass' };
    await authController.signUp(dto);
    expect(authService.signup).toHaveBeenCalledWith(dto);
  });

  it('signin calls authService.signin', async () => {
    const dto = { username: 'test', password: 'pass' };
    await authController.signIn(dto);
    expect(authService.signin).toHaveBeenCalledWith(dto);
  });
});
