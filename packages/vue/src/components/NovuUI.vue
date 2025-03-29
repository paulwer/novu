<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, provide } from 'vue';
import { BaseNovuProviderProps, NovuUI } from '@novu/js/ui';
import { NovuUIContextSymbol } from '../context/NovuUIContext';

// Define props with types
const props = defineProps<BaseNovuProviderProps>();

// Ref to hold the NovuUI instance
const novuUI = ref<NovuUI | undefined>();

// Initialize the novuUI instance when the component is mounted
onMounted(() => {
  const novuInstance = new NovuUI(props);
  novuUI.value = novuInstance;
});

// Watch for changes in options and update the novuUI instance accordingly
watch(
  () => props,
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
provide(NovuUIContextSymbol, novuUI);
</script>

<template>
  <slot />
</template>
