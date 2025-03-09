import { provide, inject, defineComponent } from 'vue';
import { NovuUI } from '@novu/js/ui';

// Define types
export type NovuUIContextValue = {
  novuUI: NovuUI;
};

// Create context and hook
const NovuUIContextSymbol = Symbol('NovuUIContext');

const useNovuUIContext = () => {
  const context = inject(NovuUIContextSymbol);
  if (!context) {
    throw new Error('useNovuUIContext must be used within a NovuUIProvider');
  }

  return context as NovuUIContextValue;
};

const useUnsafeNovuUIContext = () => {
  return inject(NovuUIContextSymbol);
};

// Create NovuUIProvider component
const NovuUIProvider = defineComponent({
  name: 'NovuUIProvider',
  props: {
    value: {
      type: Object as () => NovuUIContextValue,
      required: true,
    },
  },
  setup(props, { slots }) {
    provide(NovuUIContextSymbol, props.value);

    return () => (slots.default ? slots.default() : null);
  },
});

export { useNovuUIContext as useNovuUI, useUnsafeNovuUIContext as useUnsafeNovuUI, NovuUIProvider };
