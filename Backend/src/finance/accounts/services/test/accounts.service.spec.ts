import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from '../accounts.service';
import { Account } from '../../entity/account.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CurrencyService } from 'src/finance/currency/services/currency.service';
import { AccountUserRolesService } from '../account-user-roles.service.service';
import { NotFoundException } from '@nestjs/common';
import { Currency } from 'src/finance/currency/entity/currency.entity';
import { AccountUserRole } from '../../entity/account-user-role.entity';

// ---------- MOCKS ----------
const mockAccountRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  })),
});

const mockCurrencyService = () => ({
  verifyCurrency: jest.fn(),
});

const mockAccountUserRolesService = () => ({
  assignOwnerRole: jest.fn(),
  findOne: jest.fn(),
  listRoles: jest.fn(),
});

describe('AccountsService', () => {
  let service: AccountsService;
  let repo: jest.Mocked<Repository<Account>>;
  let currencyService: jest.Mocked<CurrencyService>;
  let aurService: jest.Mocked<AccountUserRolesService>;

  const mockUser = { id: 1, username: 'john' } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useFactory: mockAccountRepo,
        },
        {
          provide: CurrencyService,
          useFactory: mockCurrencyService,
        },
        {
          provide: AccountUserRolesService,
          useFactory: mockAccountUserRolesService,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    repo = module.get(getRepositoryToken(Account));
    currencyService = module.get(CurrencyService);
    aurService = module.get(AccountUserRolesService);
  });

  // ---------------- CREATE ACCOUNT ----------------
  describe('createAccount', () => {
    it('should create account and assign owner role', async () => {
      const dto = {
        name: 'Main',
        description: 'desc',
        initialBalance: 100,
        currencyCode: 'USD',
        accountTypeId: 1,
      };
      const mockCurrency = {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        decimal: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Partial<Currency> as Currency;
      currencyService.verifyCurrency.mockResolvedValue(mockCurrency);

      const mockAccount = { id: 1, ...dto } as any;
      repo.create.mockReturnValue(mockAccount);
      repo.save.mockResolvedValue(mockAccount);

      const result = await service.createAccount(mockUser, dto);

      expect(currencyService.verifyCurrency).toHaveBeenCalledWith('USD');
      expect(repo.create).toHaveBeenCalledWith({
        name: 'Main',
        description: 'desc',
        currencyCode: mockCurrency,
        initialBalance: '100',
        balance: '100',
        type: { id: 1 },
        ownerId: mockUser.id,
      });
      expect(repo.save).toHaveBeenCalledWith(mockAccount);
      expect(aurService.assignOwnerRole).toHaveBeenCalledWith(
        mockUser,
        mockAccount,
      );
      expect(result).toEqual(mockAccount);
    });
  });

  // ---------------- UPDATE ACCOUNT ----------------
  describe('updateAccount', () => {
    it('should update account fields', async () => {
      const dto = { name: 'Updated', currencyCode: 'EUR' };
      const mockAccount = {
        id: 5,
        name: 'Old',
        description: 'Old desc',
        ownerId: mockUser.id,
        type: { id: 1 },
      } as any;
      const mockCurrency: Currency = {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        decimal: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Currency;
      repo.findOne.mockResolvedValue(mockAccount);
      currencyService.verifyCurrency.mockResolvedValue(mockCurrency);
      repo.save.mockResolvedValue({ ...mockAccount, ...dto });

      const result = await service.updateAccount(5, dto, mockUser);

      expect(result.name).toBe('Updated');
      expect(currencyService.verifyCurrency).toHaveBeenCalledWith('EUR');
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if account not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.updateAccount(999, {}, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------------- DELETE ACCOUNT ----------------
  describe('deleteAccount', () => {
    it('should delete account', async () => {
      const mockAccount = { id: 10, ownerId: mockUser.id } as any;
      repo.findOne.mockResolvedValue(mockAccount);
      repo.remove.mockResolvedValue(undefined as unknown as Account);

      await service.deleteAccount(10, mockUser);
      expect(repo.remove).toHaveBeenCalledWith(mockAccount);
    });

    it('should throw NotFoundException if account not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.deleteAccount(1234, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------------- GET ACCOUNT ----------------
  describe('getAccount', () => {
    it('should return account with users and roles', async () => {
      const mockAccount = {
        id: 1,
        name: 'Test',
        type: {},
        currencyCode: {},
      } as any;
      const mockUserRoles = [
        {
          id: 1,
          account: mockAccount,
          user: { id: 1, username: 'john', email: 'a@b.com' },
          role: { id: 1, name: 'Owner', displayName: 'Owner', description: '' },
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      ];

      repo.findOne.mockResolvedValue(mockAccount);
      aurService.findOne.mockResolvedValue(mockUserRoles[0]);
      aurService.listRoles.mockResolvedValue(mockUserRoles);

      const result = await service.getAccount(1, mockUser);

      expect(result.id).toBe(1);
      expect(result.users).toHaveLength(1);
      expect(result.users[0].role.name).toBe('Owner');
    });

    it('should throw NotFoundException if account not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.getAccount(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user has no access', async () => {
      const mockAccount = { id: 1 } as any;
      repo.findOne.mockResolvedValue(mockAccount);
      aurService.findOne.mockResolvedValue(
        undefined as unknown as AccountUserRole,
      );

      await expect(service.getAccount(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------------- GET BALANCE ----------------
  describe('getBalance', () => {
    it('should return balance', async () => {
      repo.findOne.mockResolvedValue({ id: 1, balance: '500' } as any);
      const balance = await service.getBalance(1);
      expect(balance).toBe('500');
    });

    it('should throw NotFoundException if account missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.getBalance(1)).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------- UPDATE BALANCE ----------------
  describe('updateBalance', () => {
    it('should update balance', async () => {
      const mockAccount = { id: 1, balance: '100' } as any;
      repo.findOne.mockResolvedValue(mockAccount);
      repo.save.mockResolvedValue({ ...mockAccount, balance: '200' });

      const result = await service.updateBalance(1, '200');
      expect(result.balance).toBe('200');
      expect(repo.save).toHaveBeenCalledWith({
        ...mockAccount,
        balance: '200',
      });
    });

    it('should throw NotFoundException if account missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.updateBalance(1, '100')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
