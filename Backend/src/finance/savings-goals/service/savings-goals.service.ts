import {
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from 'src/finance/accounts/entity/account.entity';
import { AccountsService } from 'src/finance/accounts/services/accounts.service';
import { User } from 'src/auth/entities/user.entity';
import { CreateAccountDto } from 'src/finance/accounts/dto/create-account.dto';
import { AccountUserRolesService } from 'src/finance/accounts/services/account-user-roles.service.service'; // Added
import { SavingsGoal } from '../entity/savings-goals.entity';
import { CreateSavingsGoalDto } from '../dto/savings-goal-creation.dto';

@Injectable()
export class SavingsGoalsService {
  constructor(
    @InjectRepository(SavingsGoal)
    private savingsGoalRepository: Repository<SavingsGoal>,
    @Inject(forwardRef(() => AccountsService))
    private accountsService: AccountsService,
    // Inject AccountUserRolesService to check user access to goal accounts
    @Inject(forwardRef(() => AccountUserRolesService))
    private accountUserRolesService: AccountUserRolesService,
  ) {}

  /**
   * Creates a dedicated Account and links it to a new SavingsGoal record.
   * Progress tracking is handled by the Account's balance.
   */
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

    // 1. Create the dedicated Account using the AccountsService
    const accountDto: CreateAccountDto = {
      name: `Goal: ${name}`, // Use a clear prefix for goal accounts
      description: purpose || `Dedicated account for savings goal: ${name}`, // Use purpose for the account description
      currencyCode: currencyCode,
      initialBalance: 0, // Start the balance at zero (assuming string '0.00' is expected for balance/initialBalance fields)
      accountTypeId: accountTypeId,
    };

    // The AccountsService handles currency and account type validation, and saving the account.
    const savedAccount: Account = await this.accountsService.createAccount(
      user,
      accountDto,
    );

    // 2. Create the SavingsGoal record, linking it to the new Account
    const newGoal = this.savingsGoalRepository.create({
      name: name,
      purpose: purpose, // Map the new purpose field
      target_amount: targetAmount,
      target_date: targetDate,
      account: savedAccount, // Link the new Account entity
      status: 'active',
    });

    const savedGoal = await this.savingsGoalRepository.save(newGoal);

    // Note: Atomicity is sequential. If goal saving fails, the account remains and may need cleanup.
    return savedGoal;
  }

  /**
   * Retrieves a list of all savings goals a user is associated with via account roles.
   */
  async listUserGoals(user: User): Promise<SavingsGoal[]> {
    // 1. Find all accounts the user has access to (via roles).
    const userRoles =
      await this.accountUserRolesService.getUserAccountsWithRoles(user);

    if (userRoles.length === 0) {
      return [];
    }

    // 2. Extract the IDs of all accessible accounts.
    const accountIds = userRoles.map((role) => role.account.id);

    // 3. Find SavingsGoals where the linked account_id is in the list of accessible accounts.
    const goals = await this.savingsGoalRepository
      .createQueryBuilder('goal')
      .innerJoin('goal.account', 'account')
      .leftJoinAndSelect('goal.account', 'accountDetail') // Select account details
      .leftJoinAndSelect('accountDetail.currency', 'currency') // Select currency for context
      .where('account.id IN (:...accountIds)', { accountIds })
      .getMany();

    return goals;
  }

  // Retrieves the goal and its progress. Progress is simply the Account balance.
  async getGoalProgress(
    goalId: number,
  ): Promise<{ goal: SavingsGoal; progress: string }> {
    const goal = await this.savingsGoalRepository.findOne({
      where: { id: goalId },
      relations: ['account', 'account.currency'], // Load currency for full context
    });

    if (!goal) {
      throw new NotFoundException(`Savings Goal with ID ${goalId} not found`);
    }

    // TODO: Add a check here to ensure the requesting user has access to the linked account.
    // E.g., const hasAccess = await this.accountUserRolesService.findOne(goal.account.id, userId);

    // The saved amount is read directly from the linked Account's balance column
    const progress = goal.account.balance;

    return { goal, progress };
  }
}
