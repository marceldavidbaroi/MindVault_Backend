// account-number.util.ts

import { AccountScope } from '../entity/account-type.entity';

export const ACCOUNT_SCOPE_PREFIX: Record<AccountScope, string> = {
  [AccountScope.PERSONAL]: 'PER',
  [AccountScope.BUSINESS]: 'BUS',
  [AccountScope.FAMILY]: 'FAM',
  [AccountScope.SHARED]: 'SHR',
};
