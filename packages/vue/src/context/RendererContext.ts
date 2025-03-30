import { inject, reactive } from 'vue';

// Create context and hook
export const RendererContextSymbol = Symbol('RendererContext');

// Define type
export type RendererContextValue = {
  mountElement: (el: HTMLElement, mountedElement: MountedElement) => () => void;
};

// Define types
type MountedElement = any;
type MountedElements = Map<HTMLElement, MountedElement>;

// get the Renderer Context variable
const useRendererContext = () => {
  const context = inject(RendererContextSymbol);
  if (!context) {
    throw new Error('useRendererContext must be used within a RendererProvider');
  }

  return context as RendererContextValue;
};

const useUnsafeRendererContext = () => {
  return inject(RendererContextSymbol) as RendererContextValue | undefined;
};

export { useRendererContext as useRenderer, useUnsafeRendererContext as useUnsafeRenderer };
