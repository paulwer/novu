import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { ListNotificationsResponse, Notification, NovuError, isSameFilter, NotificationFilter } from '@novu/js';
import { useNovu } from '../context/NovuProviderContext';

export type UseNotificationsProps = {
  tags?: string[];
  read?: boolean;
  archived?: boolean;
  limit?: number;
  onSuccess?: (data: Notification[]) => void;
  onError?: (error: NovuError) => void;
};

export function useNotifications(props?: UseNotificationsProps) {
  const { tags, read, archived = false, limit, onSuccess, onError } = props || {};
  const novu = useNovu();

  const data = ref<Notification[] | undefined>(undefined);
  const error = ref<NovuError | undefined>(undefined);
  const isLoading = ref(true);
  const isFetching = ref(false);
  const hasMore = ref(false);
  const filterRef = ref<NotificationFilter | undefined>(undefined);

  const length = computed(() => data.value?.length || 0);
  const after = computed(() => (length.value ? data.value![length.value - 1].id : undefined));

  const sync = (event: { data?: ListNotificationsResponse }) => {
    if (!event.data || (filterRef.value && !isSameFilter(filterRef.value, event.data.filter))) {
      return;
    }
    data.value = event.data.notifications;
    hasMore.value = event.data.hasMore;
  };

  const fetchNotifications = async (options?: { refetch: boolean }) => {
    if (options?.refetch) {
      error.value = undefined;
      isLoading.value = true;
      isFetching.value = false;
    }
    isFetching.value = true;

    const response = await novu.value.notifications.list({
      tags,
      read,
      archived,
      limit,
      after: options?.refetch ? undefined : after.value,
    });

    if (response.error) {
      error.value = response.error;
      onError?.(response.error);
    } else {
      data.value = response.data!.notifications;
      hasMore.value = response.data!.hasMore;
      onSuccess?.(response.data!.notifications);
    }

    isLoading.value = false;
    isFetching.value = false;
  };

  const refetch = async () => {
    novu.value.notifications.clearCache({ filter: { tags, read, archived } });
    await fetchNotifications({ refetch: true });
  };

  const fetchMore = async () => {
    if (!hasMore.value || isFetching.value) return;
    await fetchNotifications();
  };

  const readAll = async () => await novu.value.notifications.readAll({ tags });

  const archiveAll = async () => await novu.value.notifications.archiveAll({ tags });

  const archiveAllRead = async () => await novu.value.notifications.archiveAllRead({ tags });

  onMounted(() => {
    const cleanup = novu.value.on('notifications.list.updated', sync);
    fetchNotifications();

    onUnmounted(() => cleanup());
  });

  watch([() => props?.tags, () => props?.read, () => props?.archived], async () => {
    const newFilter = { tags, read, archived };
    if (filterRef.value && isSameFilter(filterRef.value, newFilter)) return;

    novu.value.notifications.clearCache({ filter: filterRef.value });
    filterRef.value = newFilter;

    await fetchNotifications({ refetch: true });
  });

  return {
    readAll,
    archiveAll,
    archiveAllRead,
    notifications: data,
    error,
    isLoading,
    isFetching,
    refetch,
    fetchMore,
    hasMore,
  };
}
