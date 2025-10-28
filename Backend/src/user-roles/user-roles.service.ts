import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { UserRole } from './user-roles.entity';
import { CreateUserRoleDto } from './dto/create-user-roles.dto';
import { UpdateUserRoleDto } from './dto/update-user-roles.dto';
import { FilterUserRoleDto } from './dto/filter-user-role.dto';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRolesRepository: Repository<UserRole>,
  ) {}

  /** CREATE */
  async create(createDto: CreateUserRoleDto): Promise<UserRole> {
    const existing = await this.userRolesRepository.findOne({
      where: { name: createDto.name },
    });
    if (existing) {
      throw new BadRequestException(`Role "${createDto.name}" already exists.`);
    }

    const role = this.userRolesRepository.create(createDto);
    return await this.userRolesRepository.save(role);
  }

  /** FIND ALL */
  async findAll(filterDto: FilterUserRoleDto): Promise<UserRole[]> {
    const { search } = filterDto;
    const where = search
      ? [{ name: ILike(`%${search}%`) }, { description: ILike(`%${search}%`) }]
      : undefined;

    return await this.userRolesRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /** FIND ONE */
  async findOne(id: number): Promise<UserRole> {
    const role = await this.userRolesRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`User role with ID ${id} not found`);
    return role;
  }

  /** UPDATE */
  async update(id: number, updateDto: UpdateUserRoleDto): Promise<UserRole> {
    const role = await this.findOne(id);
    Object.assign(role, updateDto);
    return await this.userRolesRepository.save(role);
  }

  /** DELETE */
  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.userRolesRepository.remove(role);
  }

  /** STATS */
  async getStats() {
    const total = await this.userRolesRepository.count();
    const roles = await this.userRolesRepository.find({
      select: ['id', 'name'],
    });

    return {
      total,
      roles: roles.map((r) => r.name),
    };
  }
}
