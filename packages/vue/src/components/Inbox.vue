<template>
  <NovuProvider v-if="!novu" :applicationIdentifier="applicationIdentifier" :subscriberId="subscriberId"
    :subscriberHash="subscriberHash" :backendUrl="backendUrl" :socketUrl="socketUrl" userAgentType="components">
    <slot></slot>
  </NovuProvider>

  <NovuUI v-else :options="options" :novu="novu">
    <slot>
      <DefaultInbox :open="open" :renderNotification="renderNotification" :renderBell="renderBell"
        :onNotificationClick="onNotificationClick" :onPrimaryActionClick="onPrimaryActionClick"
        :onSecondaryActionClick="onSecondaryActionClick" :placement="placement" :placementOffset="placementOffset" />
    </slot>
  </NovuUI>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNovuUI } from '../context/NovuUIContext';
import { useRenderer } from '../context/RendererContext';
import { NovuProvider, useNovu } from '../hooks/NovuProvider';
import NovuUI from './NovuUI.vue';

interface Props {
  applicationIdentifier: string;
  subscriberId: string;
  subscriberHash?: string;
  backendUrl?: string;
  socketUrl?: string;
  localization?: Record<string, any>;
  appearance?: Record<string, any>;
  tabs?: any[];
  preferencesFilter?: Record<string, any>;
  routerPush?: (route: string) => void;
  open?: boolean;
  renderNotification?: (notification: any) => HTMLElement;
  renderBell?: (unreadCount: number) => HTMLElement;
  onNotificationClick?: (notification: any) => void;
  onPrimaryActionClick?: () => void;
  onSecondaryActionClick?: () => void;
  placement?: string;
  placementOffset?: string;
}

const props = defineProps<Props>();

const { novuUI } = useNovuUI();
const { mountElement } = useRenderer();
const novu = useNovu();

const options = computed(() => ({
  localization: props.localization,
  appearance: props.appearance,
  tabs: props.tabs,
  preferencesFilter: props.preferencesFilter,
  routerPush: props.routerPush,
  options: {
    applicationIdentifier: props.applicationIdentifier,
    subscriberId: props.subscriberId,
    subscriberHash: props.subscriberHash,
    backendUrl: props.backendUrl,
    socketUrl: props.socketUrl
  }
}));
</script>
