import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringTransactionSchedule } from '../entities/recurring-transaction-schedule.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from 'src/auth/entity/user.entity';

@Injectable()
export class RecurringTransactionService {
  constructor(
    @InjectRepository(RecurringTransactionSchedule)
    private readonly scheduleRepo: Repository<RecurringTransactionSchedule>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  async createScheduleForTransaction(
    transactionId: number,
    ownerUserId: number,
    interval: string,
    startDate: string,
  ) {
    const tx = await this.txRepo.findOne({ where: { id: transactionId } });
    if (!tx) throw new Error('Transaction not found for scheduling');

    const owner = { id: ownerUserId } as User;
    // compute nextRunDate based on startDate + interval
    const nextRunDate = this._incrementDate(startDate, interval);

    const schedule = this.scheduleRepo.create({
      transaction: tx,
      owner,
      nextRunDate,
      interval,
      active: true,
    });

    return this.scheduleRepo.save(schedule);
  }

  async scheduleNextRun(scheduleId: number) {
    const sched = await this.scheduleRepo.findOne({
      where: { id: scheduleId },
      relations: ['transaction'],
    });
    if (!sched) throw new Error('Schedule not found');

    sched.nextRunDate = this._incrementDate(sched.nextRunDate, sched.interval);
    return this.scheduleRepo.save(sched);
  }

  private _incrementDate(dateStr: string, interval: string) {
    const dt = new Date(dateStr);
    switch (interval) {
      case 'daily':
        dt.setDate(dt.getDate() + 1);
        break;
      case 'weekly':
        dt.setDate(dt.getDate() + 7);
        break;
      case 'monthly':
        dt.setMonth(dt.getMonth() + 1);
        break;
      case 'yearly':
        dt.setFullYear(dt.getFullYear() + 1);
        break;
      default:
        throw new Error('Invalid interval');
    }
    return dt.toISOString().slice(0, 10);
  }
}
