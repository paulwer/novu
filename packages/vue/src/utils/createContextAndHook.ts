import { inject, provide, reactive, readonly, InjectionKey } from 'vue';

export function assertContextExists<T>(contextVal: T | undefined, msg: string): asserts contextVal {
  if (!contextVal) {
    throw new Error(msg);
  }
}

type Options = { assertCtxFn?: (v: unknown, msg: string) => void };

export function createContextAndHook<T>(key: InjectionKey<T>, displayName: string, options?: Options) {
  const { assertCtxFn = assertContextExists } = options || {};

  const provideContext = (value: T) => {
    provide(key, reactive(value));
  };

  const useContext = (): T => {
    const ctx = inject(key);
    assertCtxFn(ctx, `Component must be wrapped with a provider for ${displayName}`);

    return readonly(ctx!) as T;
  };

  const useContextWithoutGuarantee = (): T | Partial<T> => {
    return inject(key, {} as Partial<T>);
  };

  return { provideContext, useContext, useContextWithoutGuarantee };
}
