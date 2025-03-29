<script setup lang="ts">
import NovuUI from './NovuUI.vue';
import DefaultInbox from './DefaultInbox.vue';
import { NovuProvider, useUnsafeNovu } from '../hooks/NovuProvider';
import { BaseNovuProviderProps, InboxProps } from '@novu/js/ui';
import { NovuOptions } from '@novu/js';

const props = defineProps<Omit<NovuOptions & BaseNovuProviderProps & InboxProps, 'rendererBell' | 'rendererNotification'>>();

const novu = useUnsafeNovu();
</script>

<template>
  <NovuProvider v-if="!novu" :application-identifier="props.applicationIdentifier" :subscriber-id="props.subscriberId"
    :subscriber-hash="props.subscriberHash" :backend-url="props.backendUrl" :socket-url="props.socketUrl"
    user-agent-type="components">
    <NovuUI v-bind="$props">
      <DefaultInbox v-bind="{ ...$props, ...$slots }" />
    </NovuUI>
  </NovuProvider>

  <NovuUI v-else v-bind="$props">
    <DefaultInbox v-bind="{ ...$props, ...$slots }" />
  </NovuUI>
</template>
