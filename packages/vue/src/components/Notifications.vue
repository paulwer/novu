<template>
  <Mounter :mount="mount" />
</template>

<script setup lang="ts">
import Mounter from './Mounter.vue';  // Assuming Mounter is a Vue component
import { useNovuUI } from '../context/NovuUIContext';
import { useRenderer } from '../context/RendererContext';

// Define the props with their types
interface Props {
  renderNotification?: (notification: any) => any;
  onNotificationClick?: () => void;
  onPrimaryActionClick?: () => void;
  onSecondaryActionClick?: () => void;
}

// Accept props in the setup function
const props = defineProps<Props>();

// Destructure the context values
const { novuUI } = useNovuUI();
const { mountElement } = useRenderer();

// Define the mount function
const mount = (element: HTMLElement) => {
  return novuUI.mountComponent({
    name: 'Notifications',
    element,
    props: {
      renderNotification: props.renderNotification
        ? (el: HTMLElement, notification: any) => mountElement(el, props.renderNotification!(notification))
        : undefined,
      onNotificationClick: props.onNotificationClick,
      onPrimaryActionClick: props.onPrimaryActionClick,
      onSecondaryActionClick: props.onSecondaryActionClick,
    },
  });
};
</script>
