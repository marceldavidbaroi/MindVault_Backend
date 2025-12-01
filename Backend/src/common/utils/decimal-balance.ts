import Decimal from 'decimal.js';
import { BadRequestException } from '@nestjs/common';

/**
 * Safely adds amount to current balance.
 * @param current Current balance as string
 * @param amount Amount to add as string
 * @returns New balance as string
 */
export function safeAdd(current: string, amount: string): string {
  const newBalance = new Decimal(current).plus(new Decimal(amount));
  return newBalance.toFixed(2); // always two decimal places
}

/**
 * Safely subtracts amount from current balance.
 * Throws BadRequestException if result would be negative.
 * @param current Current balance as string
 * @param amount Amount to subtract as string
 * @returns New balance as string
 */
export function safeSubtract(current: string, amount: string): string {
  const newBalance = new Decimal(current).minus(new Decimal(amount));
  if (newBalance.isNegative()) {
    throw new BadRequestException('Balance cannot be negative');
  }
  return newBalance.toFixed(2);
}
