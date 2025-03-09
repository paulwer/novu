<template>
  <Mounter :mount="mount" />
</template>

<script setup lang="ts">
import { useNovuUI } from '../context/NovuUIContext';
import { useRenderer } from '../context/RendererContext';
import Mounter from './Mounter.vue';  // Assuming Mounter is a Vue component

interface Props {
  renderBell?: (unreadCount: number) => HTMLElement;
}

const props = defineProps<Props>();
const { novuUI } = useNovuUI();
const { mountElement } = useRenderer();

const mount = (element: HTMLElement) => {
  return novuUI.mountComponent({
    name: 'Bell',
    element,
    props: props.renderBell
      ? { renderBell: (el: HTMLElement, unreadCount: number) => mountElement(el, props.renderBell!(unreadCount)) }
      : undefined,
  });
};
</script>
