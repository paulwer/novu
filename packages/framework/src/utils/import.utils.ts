import { MissingDependencyError } from '../errors/import.errors';
import type { ImportRequirement } from '../types/import.types';

/**
 * Check if the required dependencies are installed and throw an error if not.
 *
 * @param dependencies - The list of dependencies to check
 * @param usageReason - The usage of the dependencies
 */
export const checkDependencies = async (
  dependencies: readonly ImportRequirement[],
  usageReason: string
): Promise<void> => {
  const missingDependencies = new Set<string>();
  for (const dep of dependencies) {
    try {
      const result = await dep.import;

      const hasAllExports = dep.exports.every((exportName) => result[exportName] !== undefined);

      /*
       * First way that a dependency isn't available is if the import succeeds
       * but the necessary exports are not available.
       */
      if (!hasAllExports) {
        missingDependencies.add(dep.name);
      }
    } catch (error) {
      // Second way that a dependency isn't available is if the import fails.
      missingDependencies.add(dep.name);
    }
  }

  if (missingDependencies.size > 0) {
    throw new MissingDependencyError(usageReason, Array.from(missingDependencies));
  }
};
