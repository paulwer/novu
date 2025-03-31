<script setup lang="ts">
import { useSlots, h } from 'vue';
import { BellRenderer, InboxProps, NotificationRenderer } from '@novu/js/ui';
import Mounter from './Mounter.vue';
import { useNovuUI } from '../context/NovuUIProviderContext';

interface Slots {
  bell?: (props: { unreadCount: Parameters<BellRenderer>[1] }) => any;
  notification?: (props: { notification: Parameters<NotificationRenderer>[1] }) => any;
}

const props = defineProps<Omit<InboxProps, 'renderBell' | 'renderNotification'>>();

const slots = useSlots() as unknown as Slots; // Get access to the slot content

const novuUI = useNovuUI();

const mount = (element: HTMLElement, mountElement: (el: HTMLElement, mountedElement: any) => void) => novuUI.value.mountComponent({
  name: 'Inbox',
  props: {
    ...props,
    renderNotification: (slots.notification ? (el: Parameters<NotificationRenderer>[0], notification: Parameters<NotificationRenderer>[1]) => {
      const slotContent = slots.notification?.({ notification });

      if (slotContent) {
        const vnode = slotContent.length > 1 ? h("div", {}, slotContent) : slotContent[0];
        mountElement(el, vnode);
      }
    } : undefined) as NotificationRenderer | undefined,
    renderBell: (slots.bell ? (el: Parameters<BellRenderer>[0], unreadCount: Parameters<BellRenderer>[1]) => {
      const slotContent = slots.bell?.({ unreadCount });

      if (slotContent) {
        const vnode = slotContent.length > 1 ? h("div", {}, slotContent) : slotContent[0];
        mountElement(el, vnode);
      }
    } : undefined) as BellRenderer | undefined,
  },
  element,
});
</script>

<template>
  <Mounter :mount="mount" />
</template>
