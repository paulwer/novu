import { provide, inject, defineComponent, ref } from 'vue';

// Define types
export type MountedElement = any;
export type MountedElements = Map<HTMLElement, MountedElement>;

type RendererContextValue = {
  mountElement: (el: HTMLElement, mountedElement: MountedElement) => () => void;
};

// Create context and hook
const RendererContextSymbol = Symbol('RendererContext');

const useRendererContext = () => {
  const context = inject(RendererContextSymbol);
  if (!context) {
    throw new Error('useRendererContext must be used within a RendererProvider');
  }

  return context as RendererContextValue;
};

const useUnsafeRendererContext = () => {
  return inject(RendererContextSymbol);
};

// Create RendererProvider component
const RendererProvider = defineComponent({
  name: 'RendererProvider',
  props: {
    value: {
      type: Object as () => RendererContextValue,
      required: true,
    },
  },
  setup(props, { slots }) {
    provide(RendererContextSymbol, props.value);

    return () => (slots.default ? slots.default() : null);
  },
});

export { useRendererContext as useRenderer, useUnsafeRendererContext as useUnsafeRenderer, RendererProvider };
