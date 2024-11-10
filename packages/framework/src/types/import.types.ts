export type ImportRequirement = {
  /**
   * The name of the dependency.
   *
   * This is a necessary duplicate as ESM does not provide a consistent API for
   * reading the name of a dependency that can't be resolved.
   *
   * @example
   * ```typescript
   * 'my-dependency'
   * ```
   */
  name: string;
  /**
   * The import of the dependency. An explicit `import()` call is necessary to ensure
   * that the bundler will make the dependency available for usage during tree-shaking.
   *
   * @example
   * ```typescript
   * import('my-dependency')
   * ```
   */
  import: Promise<{ default: unknown } & Record<string, unknown>>;
  /**
   * The required exports of the dependency. The availability of these exports are
   * checked by the import validator to verify the dependency is installed.
   *
   * @example
   * ```typescript
   * ['my-export']
   * ```
   */
  exports: readonly string[];
};
