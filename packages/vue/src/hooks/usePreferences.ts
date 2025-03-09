import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import type { NovuError, Preference } from '@novu/js';
import { useNovu } from './NovuProvider';

type UsePreferencesProps = {
  filter?: { tags?: string[] };
  onSuccess?: (data: Preference[]) => void;
  onError?: (error: NovuError) => void;
};

export function usePreferences(props?: UsePreferencesProps) {
  const { onSuccess, onError } = props || {};
  const { preferences, on } = useNovu();

  const data = ref<Preference[] | undefined>(undefined);
  const error = ref<NovuError | undefined>(undefined);
  const isLoading = ref(true);
  const isFetching = ref(false);

  const sync = (event: { data?: Preference[] }) => {
    if (event.data) {
      data.value = event.data;
    }
  };

  const fetchPreferences = async () => {
    isFetching.value = true;
    const response = await preferences.list(props?.filter);

    if (response.error) {
      error.value = response.error;
      onError?.(response.error);
    } else {
      data.value = response.data!;
      onSuccess?.(response.data!);
    }

    isLoading.value = false;
    isFetching.value = false;
  };

  const refetch = async () => {
    preferences.cache.clearAll();
    await fetchPreferences();
  };

  onMounted(() => {
    fetchPreferences();

    const listUpdatedCleanup = on('preferences.list.updated', sync);
    const listPendingCleanup = on('preferences.list.pending', sync);
    const listResolvedCleanup = on('preferences.list.resolved', sync);

    onUnmounted(() => {
      listUpdatedCleanup();
      listPendingCleanup();
      listResolvedCleanup();
    });
  });

  return {
    preferences: data,
    error,
    isLoading,
    isFetching,
    refetch,
  };
}
