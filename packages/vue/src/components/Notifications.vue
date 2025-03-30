<script setup lang="ts">
import Mounter from "./Mounter.vue"; // Assuming Mounter is a Vue component
import { useSlots, h } from "vue";
import { NotificationRenderer } from "@novu/js/ui";
import { useNovuUI } from '../context/NovuUIProviderContext';
import { useRenderer } from "../context/RendererContext";

interface Slots {
  notification?: (props: { notification: Parameters<NotificationRenderer>[1] }) => any;
}

interface Props {
  onNotificationClick?: () => void;
  onPrimaryActionClick?: () => void;
  onSecondaryActionClick?: () => void;
}

const props = defineProps<Props>();
const slots = useSlots() as unknown as Slots; // Get access to the slot content

const novuUI = useNovuUI();
const { mountElement } = useRenderer();

const mount = (element: HTMLElement) => novuUI.value.mountComponent({
  name: "Notifications",
  element,
  props: {
    renderNotification: (slots.notification ? (el: Parameters<NotificationRenderer>[0], notification: Parameters<NotificationRenderer>[1]) => {
      const slotContent = slots.notification?.({ notification });

      if (slotContent) {
        const vnode = slotContent.length > 1 ? h("div", {}, slotContent) : slotContent[0];
        mountElement(el, vnode);
      }
    } : undefined) as NotificationRenderer | undefined,
    onNotificationClick: props.onNotificationClick,
    onPrimaryActionClick: props.onPrimaryActionClick,
    onSecondaryActionClick: props.onSecondaryActionClick,
  },
});
</script>

<template>
  <Mounter :mount="mount" />
</template>
