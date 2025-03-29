<template>
  <RendererProvider :value="{ mountElement }">
    <template v-for="(mountedElement, element) in mountedElements">
      <teleport :to="element.toString()">
        <component :is="mountedElement" />
      </teleport>
    </template>
    <slot />
  </RendererProvider>
</template>

<script setup lang="ts">
import { reactive, provide } from 'vue';
import { RendererContextSymbol, RendererContextValue } from '../context/RendererContext';

// Type for the mountedElements map to ensure correct types
type MountedElementsMap = Map<HTMLElement, any>;

// Declare a reactive map to hold the mounted elements
const mountedElements = reactive<MountedElementsMap>(new Map());

// Mount element function with type annotations
const mountElement = (el: HTMLElement, mountedElement: any) => {
  // Add the mounted element to the map
  mountedElements.set(el, mountedElement);

  // Cleanup function that deletes the element from the map
  return () => {
    mountedElements.delete(el);
  };
};

// Provide the mountElement function to child components
provide(RendererContextSymbol, { mountElement } as RendererContextValue);
</script>
