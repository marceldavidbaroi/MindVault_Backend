import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountType } from './account_types.entity';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { FilterAccountTypeDto } from './dto/filter-account-type.dto';
import { User } from 'src/auth/user.entity';

@Injectable()
export class AccountTypesService {
  constructor(
    @InjectRepository(AccountType)
    private accountTypeRepository: Repository<AccountType>,
  ) {}

  /** ✅ Create a new account type */
  async create(dto: CreateAccountTypeDto, user?: User): Promise<AccountType> {
    const existing = await this.accountTypeRepository.findOne({
      where: [{ name: dto.name }, { slug: dto.slug }],
    });

    if (existing) {
      throw new BadRequestException(
        `Account type with name or slug already exists`,
      );
    }

    const newType = this.accountTypeRepository.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      is_group: dto.is_group ?? false,
      is_goal: dto.is_goal ?? false,
      is_active: dto.is_active ?? true,
      user: user ?? null, // System type if no user passed
    });

    return await this.accountTypeRepository.save(newType);
  }

  /** 📜 Find all account types (system + user-created) */
  async findAll(
    user?: User,
    filters?: FilterAccountTypeDto,
  ): Promise<AccountType[]> {
    const query = this.accountTypeRepository.createQueryBuilder('type');

    // Only show system types (user = null) + user-created types
    if (user) {
      query.where('type.user_id IS NULL OR type.user_id = :userId', {
        userId: user.id,
      });
    } else {
      query.where('type.user_id IS NULL');
    }

    if (filters?.search) {
      query.andWhere('type.name ILIKE :search OR type.slug ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    if (filters?.is_active !== undefined) {
      query.andWhere('type.is_active = :isActive', {
        isActive: filters.is_active,
      });
    }

    if (filters?.is_group !== undefined) {
      query.andWhere('type.is_group = :isGroup', { isGroup: filters.is_group });
    }

    if (filters?.is_goal !== undefined) {
      query.andWhere('type.is_goal = :isGoal', { isGoal: filters.is_goal });
    }

    // ✅ Order alphabetically by name
    return await query.orderBy('type.name', 'ASC').getMany();
  }

  /** 🔍 Find one account type by ID (only accessible if user is owner or system type) */
  async findOne(id: number, user?: User): Promise<AccountType> {
    const type = await this.accountTypeRepository.findOne({ where: { id } });
    if (!type) {
      throw new NotFoundException(`Account type with ID ${id} not found`);
    }

    if (type.user && user && type.user.id !== user.id) {
      throw new ForbiddenException('You cannot access this account type');
    }

    return type;
  }

  /** 🛠️ Update account type (only by creator) */
  async update(
    id: number,
    dto: UpdateAccountTypeDto,
    user?: User,
  ): Promise<AccountType> {
    const type = await this.findOne(id, user);
    Object.assign(type, dto);
    return await this.accountTypeRepository.save(type);
  }

  /** ❌ Soft delete (only by creator) */
  async remove(id: number, user?: User): Promise<void> {
    const type = await this.findOne(id, user);
    type.is_active = false;
    await this.accountTypeRepository.save(type);
  }
}
