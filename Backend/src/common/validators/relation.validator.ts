// common/validators/relation.validator.ts
import { BadRequestException } from '@nestjs/common';

export class RelationValidator {
  /**
   * Validate a comma-separated string of relations against allowed relations.
   * @param relationsStr Comma-separated string of relations
   * @param allowedRelations Array of allowed relation names
   * @returns Array of valid relations
   * @throws BadRequestException if any invalid relation is found
   */
  static validate(
    relationsStr: string | undefined,
    allowedRelations: string[],
  ): string[] {
    if (!relationsStr) return [];

    const requestedRelations = relationsStr
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const invalidRelations = requestedRelations.filter(
      (r) => !allowedRelations.includes(r),
    );

    if (invalidRelations.length > 0) {
      throw new BadRequestException(
        `Invalid relations requested: ${invalidRelations.join(', ')}`,
      );
    }

    return requestedRelations;
  }
}
