<template>
  <Mounter :mount="mount" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useNovuUI } from '../context/NovuUIContext';  // Adjust according to your context provider setup
import Mounter from './Mounter.vue';  // Assuming Mounter is a Vue component

// Initialize the context
const { novuUI } = useNovuUI();

// Declare a ref for the mount function
const mount = ref<(element: HTMLElement) => void | undefined>();

// Mounting the component when the element is ready
const mountComponent = (element: HTMLElement) => {
  return novuUI.mountComponent({
    name: 'Preferences',
    element,
  });
};

// Assigning the mount function to ref
mount.value = (element: HTMLElement) => {
  return mountComponent(element);
};
</script>
