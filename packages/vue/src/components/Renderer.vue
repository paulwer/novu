<template>
  <div>
    <template v-for="(mountedElement, element) in mountedElements">
      <teleport :to="element.toString()">
        <component :is="mountedElement" />
      </teleport>
    </template>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, reactive } from 'vue';
import { RendererContextSymbol, RendererContextValue } from '../context/RendererContext';

// Define types
type MountedElement = any;
type MountedElements = Map<HTMLElement, MountedElement>;

// Shared reactive state
const mountedElements = reactive<MountedElements>(new Map());
const mountedElementsComputed = computed(() => mountedElements);

const mountElement = (el: HTMLElement, mountedElement: MountedElement) => {
  mountedElementsComputed.value.set(el, mountedElement);

  return () => {
    mountedElementsComputed.value.delete(el);
  };
};

// Provide the mountElement function to child components
provide(RendererContextSymbol, { mountElement } as RendererContextValue);
</script>
