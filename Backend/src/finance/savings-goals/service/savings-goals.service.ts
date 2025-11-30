import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavingsGoal } from '../entity/savings-goals.entity';
import { CreateSavingsGoalDto } from '../dto/savings-goal-creation.dto';
import { UpdateSavingsGoalDto } from '../dto/savings-goal-update.dto';
import { User } from 'src/auth/entities/user.entity';
import { AccountsService } from 'src/finance/accounts/services/accounts.service';
import { AccountUserRolesService } from 'src/finance/accounts/services/account-user-roles.service.service';

@Injectable()
export class SavingsGoalsService {
  constructor(
    @InjectRepository(SavingsGoal)
    private savingsGoalRepository: Repository<SavingsGoal>,

    @Inject(forwardRef(() => AccountsService))
    private accountsService: AccountsService,

    @Inject(forwardRef(() => AccountUserRolesService))
    private accountUserRolesService: AccountUserRolesService,
  ) {}

  // -------------------------------------------------
  // CREATE GOAL
  // -------------------------------------------------
  async createGoal(
    user: User,
    dto: CreateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    const {
      name,
      targetAmount,
      currencyCode,
      accountTypeId,
      targetDate,
      purpose,
    } = dto;

    // Create account for goal
    const account = await this.accountsService.createAccount(user, {
      name: `Goal: ${name}`,
      description: purpose || `Savings goal: ${name}`,
      currencyCode,
      initialBalance: 0,
      accountTypeId,
    });

    const newGoal = this.savingsGoalRepository.create({
      name,
      purpose,
      target_amount: targetAmount,
      target_date: targetDate,
      account,
      status: 'active',
    });

    return await this.savingsGoalRepository.save(newGoal);
  }

  // -------------------------------------------------
  // LIST GOALS FOR USER
  // -------------------------------------------------
  async listUserGoals(user: User): Promise<any[]> {
    const userRoles =
      await this.accountUserRolesService.getUserAccountsWithRoles(user);

    if (userRoles.length === 0) return [];

    const accountIds = userRoles.map((r) => r.account.id);

    const goals = await this.savingsGoalRepository
      .createQueryBuilder('goal')
      .innerJoin('goal.account', 'account')
      .leftJoinAndSelect('goal.account', 'acc')
      .leftJoinAndSelect('acc.currency', 'currency')
      .leftJoinAndSelect('acc.owner', 'owner')
      .leftJoinAndSelect('acc.type', 'type')
      .where('account.id IN (:...accountIds)', { accountIds })
      .getMany();

    // ---- CLEAN RESPONSE ----
    return goals.map((g) => ({
      id: g.id,
      name: g.name,
      purpose: g.purpose,
      target_amount: g.target_amount,
      target_date: g.target_date,
      status: g.status,

      account: {
        id: g.account.id,
        name: g.account.name,
        balance: g.account.balance,
        ownerId: g.account.ownerId,

        currency: {
          code: g.account.currency.code,
          symbol: g.account.currency.symbol,
        },
        type: {
          id: g.account.type.id,
          name: g.account.type.name,
        },

        owner: {
          id: g.account.owner.id,
          username: g.account.owner.username,
        },
      },
    }));
  }

  // -------------------------------------------------
  // GET PROGRESS
  // -------------------------------------------------
  async getGoalProgress(
    goalId: number,
  ): Promise<{ goal: SavingsGoal; progress: string }> {
    const goal = await this.savingsGoalRepository.findOne({
      where: { id: goalId },
      relations: ['account', 'account.currency'],
    });

    if (!goal) throw new NotFoundException('Goal not found');

    const progress = goal.account.balance;
    return { goal, progress };
  }

  // -------------------------------------------------
  // UPDATE GOAL
  // -------------------------------------------------
  async updateGoal(
    user: User,
    goalId: number,
    dto: UpdateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    const goal = await this.savingsGoalRepository.findOne({
      where: { id: goalId },
      relations: ['account'],
    });

    if (!goal) throw new NotFoundException('Goal not found');

    // --- Access check ---
    const hasAccess = await this.accountUserRolesService.findOne(
      goal.account.id,
      user.id,
    );
    if (!hasAccess) throw new ForbiddenException('No access to this goal');

    // Update goal fields
    if (dto.name) goal.name = dto.name;
    if (dto.purpose) goal.purpose = dto.purpose;
    if (dto.targetAmount !== undefined) goal.target_amount = dto.targetAmount;
    if (dto.targetDate) goal.target_date = dto.targetDate;

    // If name or purpose changed → update account metadata
    if (dto.name || dto.purpose) {
      await this.accountsService.updateAccount(
        goal.account.id,
        {
          name: `Goal: ${goal.name}`,
          description: goal.purpose,
        },
        user,
      );
    }

    return await this.savingsGoalRepository.save(goal);
  }

  // -------------------------------------------------
  // DELETE GOAL
  // -------------------------------------------------
  async deleteGoal(user: User, goalId: number): Promise<{ success: boolean }> {
    const goal = await this.savingsGoalRepository.findOne({
      where: { id: goalId },
      relations: ['account'],
    });

    if (!goal) throw new NotFoundException('Goal not found');

    // --- Access check ---
    const hasAccess = await this.accountUserRolesService.findOne(
      goal.account.id,
      user.id,
    );
    if (!hasAccess) throw new ForbiddenException('No access to this goal');

    // Remove goal record
    await this.savingsGoalRepository.remove(goal);

    // ALSO delete the linked account
    await this.accountsService.deleteAccount(goal.account.id, user);

    return { success: true };
  }
}
