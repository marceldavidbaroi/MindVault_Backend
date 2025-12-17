import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './services/accounts.service';
import { AccountTypesService } from './services/account-types.service';
import { AccountUserRolesService } from './services/account-user-roles.service.service';
import { User } from 'src/auth/entities/user.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Account } from './entity/account.entity';
import { AccountType } from './entity/account-type.entity';
import { AccountUserRole } from './entity/account-user-role.entity';

const mockAccountsService = () => ({
  createAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn(),
  listAccounts: jest.fn(),
  getAccount: jest.fn(),
});

const mockAccountTypesService = () => ({
  listAccountTypes: jest.fn(),
});

const mockAccountUserRolesService = () => ({
  assignRole: jest.fn(),
  updateRole: jest.fn(),
  removeRole: jest.fn(),
  listRoles: jest.fn(),
  getUserAccountsWithRoles: jest.fn(),
  transferOwnership: jest.fn(),
});

describe('AccountsController', () => {
  let controller: AccountsController;
  let accountsService: jest.Mocked<AccountsService>;
  let accountTypesService: jest.Mocked<AccountTypesService>;
  let accountUserRolesService: jest.Mocked<AccountUserRolesService>;

  const mockUser = { id: 1, username: 'owner' } as User;
  const mockAccount = { id: 100, name: 'Test Account' } as Account;
  const mockAccountType = { id: 1, name: 'Savings' } as AccountType;
  const mockRole = { id: 2, role: { id: 2, name: 'Admin' } } as AccountUserRole;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        { provide: AccountsService, useFactory: mockAccountsService },
        { provide: AccountTypesService, useFactory: mockAccountTypesService },
        {
          provide: AccountUserRolesService,
          useFactory: mockAccountUserRolesService,
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    accountsService = module.get(AccountsService);
    accountTypesService = module.get(AccountTypesService);
    accountUserRolesService = module.get(AccountUserRolesService);

    jest.clearAllMocks();
  });

  // -----------------------------
  // CREATE ACCOUNT
  // -----------------------------
  it('should create an account', async () => {
    const dto: CreateAccountDto = {
      name: 'Test',
      accountTypeId: 1,
      currencyCode: 'USD',
      initialBalance: 100,
    };
    accountsService.createAccount.mockResolvedValue(mockAccount);

    const result = await controller.createAccount(mockUser, dto);

    expect(accountsService.createAccount).toHaveBeenCalledWith(mockUser, dto);
    expect(result.data).toEqual(mockAccount);
    expect(result.success).toBe(true);
  });

  // -----------------------------
  // LIST ACCOUNTS
  // -----------------------------
  it('should list accounts', async () => {
    accountsService.listAccounts.mockResolvedValue([mockAccount]);

    const result = await controller.listAccounts(mockUser);

    expect(accountsService.listAccounts).toHaveBeenCalledWith(mockUser);
    expect(result.data).toEqual([mockAccount]);
  });

  it('should list accounts with roles', async () => {
    accountUserRolesService.getUserAccountsWithRoles.mockResolvedValue([
      mockRole,
    ]);

    const result = await controller.getUserAccountsWithRoles(mockUser);

    expect(
      accountUserRolesService.getUserAccountsWithRoles,
    ).toHaveBeenCalledWith(mockUser);
    expect(result.data).toEqual([mockRole]);
  });

  // -----------------------------
  // GET SINGLE ACCOUNT
  // -----------------------------
  it('should get a single account', async () => {
    accountsService.getAccount.mockResolvedValue(mockAccount);

    const result = await controller.getAccount(100, mockUser);

    expect(accountsService.getAccount).toHaveBeenCalledWith(100, mockUser);
    expect(result.data).toEqual(mockAccount);
  });

  // -----------------------------
  // UPDATE ACCOUNT
  // -----------------------------
  it('should update account', async () => {
    const dto: UpdateAccountDto = { name: 'Updated' };
    accountsService.updateAccount.mockResolvedValue({
      ...mockAccount,
      name: 'Updated',
    });

    const result = await controller.updateAccount(100, mockUser, dto);

    expect(accountsService.updateAccount).toHaveBeenCalledWith(
      100,
      dto,
      mockUser,
    );
    expect(result.data?.name).toBe('Updated');
  });

  // -----------------------------
  // DELETE ACCOUNT
  // -----------------------------
  it('should delete account', async () => {
    accountsService.deleteAccount.mockResolvedValue(undefined);

    const result = await controller.deleteAccount(100, mockUser);

    expect(accountsService.deleteAccount).toHaveBeenCalledWith(100, mockUser);
    expect(result.data).toBeNull();
  });

  // -----------------------------
  // ACCOUNT TYPES
  // -----------------------------
  it('should list account types', async () => {
    accountTypesService.listAccountTypes.mockResolvedValue([mockAccountType]);

    const result = await controller.listAccountTypes();

    expect(accountTypesService.listAccountTypes).toHaveBeenCalled();
    expect(result.data).toEqual([mockAccountType]);
  });

  // -----------------------------
  // ASSIGN ROLE
  // -----------------------------
  it('should assign role', async () => {
    const dto: AssignRoleDto = { username: 'user2', roleId: 2 };
    accountUserRolesService.assignRole.mockResolvedValue(mockRole);

    const result = await controller.assignRole(mockUser, 100, dto);

    expect(accountUserRolesService.assignRole).toHaveBeenCalledWith(
      mockUser,
      100,
      dto,
    );
    expect(result.data).toEqual(mockRole);
  });

  // -----------------------------
  // UPDATE ROLE
  // -----------------------------
  it('should update role', async () => {
    const dto: UpdateRoleDto = { roleId: 3 };
    accountUserRolesService.updateRole.mockResolvedValue(mockRole);

    const result = await controller.updateRole(mockUser, 100, 2, dto);

    expect(accountUserRolesService.updateRole).toHaveBeenCalledWith(
      mockUser,
      100,
      2,
      dto,
    );
    expect(result.data).toEqual(mockRole);
  });

  // -----------------------------
  // REMOVE ROLE
  // -----------------------------
  it('should remove role', async () => {
    accountUserRolesService.removeRole.mockResolvedValue(undefined);

    const result = await controller.removeRole(mockUser, 100, 2);

    expect(accountUserRolesService.removeRole).toHaveBeenCalledWith(
      mockUser,
      100,
      2,
    );
    expect(result.data).toBeNull();
  });

  // -----------------------------
  // LIST ROLES
  // -----------------------------
  it('should list roles for account', async () => {
    accountUserRolesService.listRoles.mockResolvedValue([mockRole]);

    const result = await controller.listRoles(100);

    expect(accountUserRolesService.listRoles).toHaveBeenCalledWith(100);
    expect(result.data).toEqual([mockRole]);
  });

  // -----------------------------
  // TRANSFER OWNERSHIP
  // -----------------------------
  it('should transfer ownership', async () => {
    accountUserRolesService.transferOwnership.mockResolvedValue(undefined);

    const result = await controller.transferOwnership(mockUser, 100, 2);

    expect(accountUserRolesService.transferOwnership).toHaveBeenCalledWith(
      mockUser,
      100,
      2,
    );
    expect(result.data).toBeNull();
  });
});
