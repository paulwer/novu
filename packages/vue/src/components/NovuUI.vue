<template>
  <slot />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, provide } from 'vue';
import { NovuUI as NovuUIClass, NovuUIOptions } from '@novu/js/ui';
import { Novu } from '@novu/js';

interface Props {
  options: NovuUIOptions;
  novu?: Novu;
}

// Define props with types
const props = defineProps<Props>();

// Ref to hold the NovuUI instance
const novuUI = ref<NovuUIClass | undefined>();

// Initialize the novuUI instance when the component is mounted
onMounted(() => {
  const novuInstance = new NovuUIClass(props.options);
  novuUI.value = novuInstance;
});

// Watch for changes in options and update the novuUI instance accordingly
watch(
  () => props.options,
  (newOptions) => {
    if (novuUI.value) {
      novuUI.value.updateAppearance(newOptions.appearance);
      novuUI.value.updateLocalization(newOptions.localization);
      novuUI.value.updateTabs(newOptions.tabs);
      novuUI.value.updateOptions(newOptions.options);
      novuUI.value.updateRouterPush(newOptions.routerPush);
    }
  },
  { immediate: true }
);

// Cleanup on unmount
onBeforeUnmount(() => {
  if (novuUI.value) {
    novuUI.value.unmount();
  }
});

// Provide the novuUI instance to child components
provide('novuUI', novuUI);
</script>
