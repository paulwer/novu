<template>
  <div ref="mounterRef" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

interface Props {
  mount: (element: HTMLElement) => (() => void) | void;
}

const props = defineProps<Props>();
const mounterRef = ref<HTMLElement | null>(null);
let unmount: (() => void) | void = undefined;

onMounted(() => {
  if (mounterRef.value) {
    unmount = props.mount(mounterRef.value);
  }
});

onBeforeUnmount(() => {
  if (unmount) {
    unmount();
  }
});
</script>
