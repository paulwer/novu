import { ref, watch, onMounted } from 'vue';
import { Notification, NotificationFilter, NovuError, areTagsEqual } from '@novu/js';
import { useNovu } from './NovuProvider';
import { useWebSocketEvent } from './internal/useWebsocketEvent';

type Count = {
  count: number;
  filter: NotificationFilter;
};

type UseCountsProps = {
  filters: NotificationFilter[];
  onSuccess?: (data: Count[]) => void;
  onError?: (error: NovuError) => void;
};

export function useCounts(props: UseCountsProps) {
  const { filters, onSuccess, onError } = props;
  const { notifications } = useNovu();

  const counts = ref<Count[] | undefined>(undefined);
  const error = ref<NovuError | undefined>(undefined);
  const isLoading = ref(true);
  const isFetching = ref(false);

  const sync = async (notification?: Notification) => {
    const existingCounts = counts.value ?? (new Array(filters.length).fill(undefined) as (Count | undefined)[]);
    let countFiltersToFetch: NotificationFilter[] = [];

    if (notification) {
      countFiltersToFetch = filters.filter((filter) => areTagsEqual(filter.tags, notification.tags));
    } else {
      countFiltersToFetch = filters;
    }

    if (countFiltersToFetch.length === 0) return;

    isFetching.value = true;
    const countsRes = await notifications.count({ filters: countFiltersToFetch });
    isFetching.value = false;
    isLoading.value = false;

    if (countsRes.error) {
      error.value = countsRes.error;
      onError?.(countsRes.error);

      return;
    }

    const data = countsRes.data!;
    onSuccess?.(data.counts);

    counts.value = existingCounts.map((oldCount, i) => {
      const countReceived = data.counts.find((count) => areTagsEqual(count.filter.tags, filters[i].tags))!;

      return countReceived || oldCount;
    });
  };

  useWebSocketEvent('notifications.notification_received', (data) => {
    sync(data.result);
  });

  useWebSocketEvent('notifications.unread_count_changed', () => {
    sync();
  });

  watch(
    () => JSON.stringify(filters),
    () => {
      error.value = undefined;
      isLoading.value = true;
      isFetching.value = false;
      sync();
    }
  );

  onMounted(() => {
    sync();
  });

  const refetch = async () => {
    await sync();
  };

  return { counts, error, refetch, isLoading, isFetching };
}
