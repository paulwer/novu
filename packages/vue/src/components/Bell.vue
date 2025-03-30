<script setup lang="ts">
import { useSlots, h } from "vue";
import { BellRenderer } from "@novu/js/ui";
import Mounter from "./Mounter.vue"; // Assuming Mounter is a Vue component
import { useNovuUI } from '../context/NovuUIProviderContext';
import { useRenderer } from "../context/RendererContext";

interface Slots {
  bell?: (props: { unreadCount: Parameters<BellRenderer>[1] }) => any;
}

const slots = useSlots() as unknown as Slots; // Get access to the slot content

const novuUI = useNovuUI();
const { mountElement } = useRenderer();

const mount = (element: HTMLElement) => novuUI.value.mountComponent({
  name: "Bell",
  element,
  props: {
    renderBell: (slots.bell ? (el: Parameters<BellRenderer>[0], unreadCount: Parameters<BellRenderer>[1]) => {
      const slotContent = slots.bell?.({ unreadCount });

      if (slotContent) {
        const vnode = slotContent.length > 1 ? h("div", {}, slotContent) : slotContent[0];
        mountElement(el, vnode);
      }
    } : undefined) as BellRenderer | undefined,
  },
});
</script>

<template>
  <Mounter :mount="mount" />
</template>
