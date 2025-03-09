import { Novu, type NovuOptions } from '@novu/js';
import { defineComponent, provide, inject, computed, type PropType, ref, onMounted } from 'vue';

// @ts-ignore
const version = PACKAGE_VERSION;
// @ts-ignore
const name = PACKAGE_NAME;
const baseUserAgent = `${name}@${version}`;

const NovuKey = Symbol('Novu');

export type NovuProviderProps = NovuOptions & { userAgentType: 'components' | 'hooks' };

export const NovuProvider = defineComponent({
  props: {
    applicationIdentifier: { type: String, required: true },
    subscriberId: { type: String, required: true },
    subscriberHash: { type: String, required: false },
    backendUrl: { type: String, required: false },
    socketUrl: { type: String, required: false },
    useCache: { type: Boolean, required: false, default: true },
    userAgentType: { type: String as PropType<'components' | 'hooks'>, required: true },
  },
  setup(props, { slots }) {
    const novu = computed(
      () =>
        new Novu({
          applicationIdentifier: props.applicationIdentifier,
          subscriberId: props.subscriberId,
          subscriberHash: props.subscriberHash,
          backendUrl: props.backendUrl,
          socketUrl: props.socketUrl,
          useCache: props.useCache,
          __userAgent: `${baseUserAgent} ${props.userAgentType}`,
        })
    );

    provide(NovuKey, novu);

    return () => (slots.default ? slots.default() : null);
  },
});

/**
 * **useNovu** - Provides access to the Novu instance
 */
export function useNovu(): Novu {
  const novu = inject<Novu | undefined>(NovuKey);
  if (!novu) {
    throw new Error('useNovu must be used within a <NovuProvider />');
  }

  return novu;
}

/**
 * **useUnsafeNovu** - Provides access to the Novu instance without throwing an error if undefined
 */
export function useUnsafeNovu(): Novu | undefined {
  return inject<Novu | undefined>(NovuKey);
}
