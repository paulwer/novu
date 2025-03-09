<template>
  <Mounter :mount="mount" />
</template>

<script setup lang="ts">
import { useNovuUI } from '../context/NovuUIContext';
import { useRenderer } from '../context/RendererContext';
import Mounter from './Mounter.vue';  // Assuming Mounter is a Vue component
import { InboxPage } from '@novu/js/ui';

interface Props {
  renderNotification?: (notification: any) => HTMLElement;
  onNotificationClick?: (notification: any) => void;
  onPrimaryActionClick?: () => void;
  onSecondaryActionClick?: () => void;
  initialPage?: InboxPage;
  hideNav?: boolean;
}

const props = defineProps<Props>();
const { novuUI } = useNovuUI();
const { mountElement } = useRenderer();

const mount = (element: HTMLElement) => {
  return novuUI.mountComponent({
    name: 'InboxContent',
    element,
    props: {
      renderNotification: props.renderNotification
        ? (el: HTMLElement, notification: any) => mountElement(el, props.renderNotification!(notification))
        : undefined,
      onNotificationClick: props.onNotificationClick,
      onPrimaryActionClick: props.onPrimaryActionClick,
      onSecondaryActionClick: props.onSecondaryActionClick,
      initialPage: props.initialPage,
      hideNav: props.hideNav
    },
  });
};
</script>
