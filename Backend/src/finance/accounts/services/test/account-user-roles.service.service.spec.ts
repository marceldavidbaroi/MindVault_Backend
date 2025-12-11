import { Test, TestingModule } from '@nestjs/testing';
import { AccountUserRolesService } from '../account-user-roles.service.service';
import { Repository } from 'typeorm';
import { AccountUserRole } from '../../entity/account-user-role.entity';
import { AccountsService } from '../accounts.service';
import { RolesService } from 'src/roles/roles.service';
import { VerifyUserService } from 'src/auth/services/verify-user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/auth/entity/user.entity';
import { Account } from '../../entity/account.entity';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from 'src/roles/role.entity';

// ---------- MOCKS ----------
const mockRoleRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
});

const mockAccountsService = () => ({
  getAccount: jest.fn(),
});

const mockRolesService = () => ({
  findOne: jest.fn(),
});

const mockVerifyUserService = () => ({
  verify: jest.fn(),
});

// ---------- TEST SUITE ----------
describe('AccountUserRolesService', () => {
  let service: AccountUserRolesService;
  let roleRepo: jest.Mocked<Repository<AccountUserRole>>;
  let accountsService: jest.Mocked<AccountsService>;
  let rolesService: jest.Mocked<RolesService>;
  let verifyUserService: jest.Mocked<VerifyUserService>;

  const mockOwner = { id: 1, username: 'owner' } as User;
  const mockAdmin = { id: 2, username: 'admin' } as User;
  const mockEditor = { id: 3, username: 'editor' } as User;
  const mockAccount = { id: 100, ownerId: mockOwner.id } as Account;

  const ownerRole = {
    id: 1,
    name: 'Owner',
    displayName: 'Owner',
  } as Partial<Role> as Role;

  const adminRole = {
    id: 2,
    name: 'Admin',
    displayName: 'Admin',
  } as Partial<Role> as Role;

  const editorRole = {
    id: 3,
    name: 'Editor',
    displayName: 'Editor',
  } as Partial<Role> as Role;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountUserRolesService,
        {
          provide: getRepositoryToken(AccountUserRole),
          useFactory: mockRoleRepo,
        },
        { provide: AccountsService, useFactory: mockAccountsService },
        { provide: RolesService, useFactory: mockRolesService },
        { provide: VerifyUserService, useFactory: mockVerifyUserService },
      ],
    }).compile();

    service = module.get<AccountUserRolesService>(AccountUserRolesService);
    roleRepo = module.get(getRepositoryToken(AccountUserRole));
    accountsService = module.get(AccountsService);
    rolesService = module.get(RolesService);
    verifyUserService = module.get(VerifyUserService);

    jest.clearAllMocks();
  });

  // -----------------------------
  // ASSIGN OWNER ROLE
  // -----------------------------
  describe('assignOwnerRole', () => {
    it('should create a new owner role if none exists', async () => {
      roleRepo.findOne.mockResolvedValue(null as unknown as AccountUserRole);
      rolesService.findOne.mockResolvedValue(ownerRole);

      const mockCreatedRole = {
        id: 10,
        account: mockAccount,
        user: mockOwner,
        role: ownerRole,
      } as Partial<AccountUserRole> as AccountUserRole;

      roleRepo.create.mockReturnValue(mockCreatedRole);
      roleRepo.save.mockResolvedValue(mockCreatedRole);

      const result = await service.assignOwnerRole(mockOwner, mockAccount);

      expect(roleRepo.create).toHaveBeenCalled();
      expect(roleRepo.save).toHaveBeenCalledWith(mockCreatedRole);
      expect(result).toEqual(mockCreatedRole);
    });

    it('should update existing role to owner if exists', async () => {
      const existing = {
        id: 20,
        account: mockAccount,
        user: mockOwner,
        role: adminRole,
      } as Partial<AccountUserRole> as AccountUserRole;

      roleRepo.findOne.mockResolvedValue(existing);
      rolesService.findOne.mockResolvedValue(ownerRole);
      roleRepo.save.mockResolvedValue({ ...existing, role: ownerRole });

      const result = await service.assignOwnerRole(mockOwner, mockAccount);

      expect(result.role).toEqual(ownerRole);
      expect(roleRepo.save).toHaveBeenCalledWith(existing);
    });
  });

  // -----------------------------
  // ASSIGN ROLE
  // -----------------------------
  describe('assignRole', () => {
    const newUser = { id: 5, username: 'user5' } as User;
    const roleDto = { roleId: 2, username: 'user5' };

    it('should throw if roleId is Owner', async () => {
      await expect(
        service.assignRole(mockOwner, mockAccount.id, {
          ...roleDto,
          roleId: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user already has a role', async () => {
      roleRepo.findOne.mockResolvedValue({
        id: 11,
        role: adminRole,
      } as Partial<AccountUserRole> as AccountUserRole);
      rolesService.findOne.mockResolvedValue(adminRole);
      verifyUserService.verify.mockResolvedValue(newUser);
      accountsService.getAccount.mockResolvedValue(mockAccount);

      await expect(
        service.assignRole(mockOwner, mockAccount.id, roleDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should assign a new role', async () => {
      roleRepo.findOne.mockResolvedValue(null as unknown as AccountUserRole);
      rolesService.findOne.mockResolvedValue(adminRole);
      verifyUserService.verify.mockResolvedValue(newUser);
      accountsService.getAccount.mockResolvedValue(mockAccount);

      const createdRole = {
        id: 12,
        user: newUser,
        account: mockAccount,
        role: adminRole,
      } as Partial<AccountUserRole> as AccountUserRole;

      roleRepo.create.mockReturnValue(createdRole);
      roleRepo.save.mockResolvedValue(createdRole);

      const result = await service.assignRole(
        mockOwner,
        mockAccount.id,
        roleDto,
      );
      expect(result).toEqual(createdRole);
    });
  });

  // -----------------------------
  // REMOVE ROLE
  // -----------------------------
  describe('removeRole', () => {
    it('owner can remove any user if more than 1 role exists', async () => {
      roleRepo.findOne
        .mockResolvedValueOnce({
          id: 1,
          role: ownerRole,
          user: mockOwner,
          account: mockAccount,
        } as Partial<AccountUserRole> as AccountUserRole)
        .mockResolvedValueOnce({
          id: 2,
          role: editorRole,
          user: mockEditor,
          account: mockAccount,
        } as Partial<AccountUserRole> as AccountUserRole);

      roleRepo.count.mockResolvedValue(2);
      roleRepo.remove.mockResolvedValue(
        undefined as unknown as AccountUserRole,
      );

      await service.removeRole(mockOwner, mockAccount.id, mockEditor.id);
      expect(roleRepo.remove).toHaveBeenCalled();
    });

    it('owner cannot remove themselves if only 1 role exists', async () => {
      roleRepo.findOne.mockResolvedValue({
        id: 1,
        role: ownerRole,
        user: mockOwner,
        account: mockAccount,
      } as Partial<AccountUserRole> as AccountUserRole);
      roleRepo.count.mockResolvedValue(1);

      await expect(
        service.removeRole(mockOwner, mockAccount.id, mockOwner.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('admin can remove editor or viewer', async () => {
      const adminUserRole = {
        id: 2,
        role: adminRole,
        user: mockAdmin,
        account: mockAccount,
      } as Partial<AccountUserRole> as AccountUserRole;

      const editorUserRole = {
        id: 3,
        role: editorRole,
        user: mockEditor,
        account: mockAccount,
      } as Partial<AccountUserRole> as AccountUserRole;

      roleRepo.findOne
        .mockResolvedValueOnce(adminUserRole)
        .mockResolvedValueOnce(editorUserRole);

      roleRepo.remove.mockResolvedValue(
        undefined as unknown as AccountUserRole,
      );

      await service.removeRole(mockAdmin, mockAccount.id, mockEditor.id);
      expect(roleRepo.remove).toHaveBeenCalled();
    });

    it('admin cannot remove owner', async () => {
      const adminUserRole = {
        id: 2,
        role: adminRole,
        user: mockAdmin,
        account: mockAccount,
      } as Partial<AccountUserRole> as AccountUserRole;

      const ownerUserRole = {
        id: 1,
        role: ownerRole,
        user: mockOwner,
        account: mockAccount,
      } as Partial<AccountUserRole> as AccountUserRole;

      roleRepo.findOne
        .mockResolvedValueOnce(adminUserRole)
        .mockResolvedValueOnce(ownerUserRole);

      await expect(
        service.removeRole(mockAdmin, mockAccount.id, mockOwner.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // -----------------------------
  // TRANSFER OWNERSHIP
  // -----------------------------
  describe('transferOwnership', () => {
    it('should transfer owner role to new user and demote current owner', async () => {
      const currentOwnerRole = {
        id: 1,
        role: ownerRole,
        user: mockOwner,
        account: mockAccount,
      } as Partial<AccountUserRole> as AccountUserRole;

      const newOwnerRole = null as unknown as AccountUserRole;

      roleRepo.findOne
        .mockResolvedValueOnce(currentOwnerRole)
        .mockResolvedValueOnce(newOwnerRole);

      rolesService.findOne
        .mockResolvedValueOnce(ownerRole)
        .mockResolvedValueOnce(adminRole);

      verifyUserService.verify.mockResolvedValue(mockAdmin);
      accountsService.getAccount.mockResolvedValue(mockAccount);

      roleRepo.create.mockReturnValue({
        id: 10,
        role: ownerRole,
        user: mockAdmin,
        account: mockAccount,
      } as Partial<AccountUserRole> as AccountUserRole);

      roleRepo.save.mockResolvedValueOnce({
        ...currentOwnerRole,
        role: adminRole,
      });

      await service.transferOwnership(mockOwner, mockAccount.id, mockAdmin.id);

      expect(roleRepo.save).toHaveBeenCalled();
    });
  });
});
