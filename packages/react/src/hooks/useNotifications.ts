import { useState, useEffect, useCallback } from 'react';
import { useNovu } from '../components/NovuProvider';
import { Notification, NovuError, isSameFilter } from '@novu/js';
import { ListNotificationsResponse } from '@novu/js';

export type UseNotificationsResult = {
  readAll: () => Promise<void>;
  archiveAll: () => Promise<void>;
  archiveAllRead: () => Promise<void>;
  data?: Array<Notification>;
  error?: NovuError;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
  fetchMore: () => void;
  hasMore: boolean;
};

export type UseNotificationsProps = {
  tags?: string[];
  read?: boolean;
  archived?: boolean;
  limit?: number;
  onSuccess?: (data: Notification[]) => void;
  onError?: (error: NovuError) => void;
};

export const useNotifications = (props?: UseNotificationsProps): UseNotificationsResult => {
  const { tags, read, archived, limit, onSuccess, onError } = props || {};
  const { notifications, on } = useNovu();
  const [data, setData] = useState<Array<Notification>>();
  const [error, setError] = useState<NovuError>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [after, setAfter] = useState<string>();

  const sync = (event: { data?: ListNotificationsResponse }) => {
    if (!event.data) {
      return;
    }
    if (!isSameFilter(event.data.filter, { tags, read, archived })) {
      return;
    }
    setData(event.data.notifications);
    setAfter(event.data.notifications[event.data.notifications.length - 1].id);
    setHasMore(event.data.hasMore);
  };

  useEffect(() => {
    on('notifications.list.updated', sync);
    on('notifications.list.pending', sync);
    on('notifications.list.resolved', sync);
  }, [tags, read, archived]);

  const resetState = () => {
    setAfter(undefined);
    setHasMore(false);
    setData(undefined);
  };

  const fetchNotifications = async () => {
    setIsFetching(true);
    const response = await notifications.list({
      tags,
      read,
      archived,
      limit,
      after: after,
    });
    if (response.error) {
      setError(response.error as NovuError);
      onError?.(response.error as NovuError);
    } else {
      onSuccess?.(response.data!.notifications);
    }
    setIsLoading(false);
    setIsFetching(false);
  };

  useEffect(() => {
    setAfter(undefined);
    setHasMore(false);
    fetchNotifications();
  }, [tags, read, archived]);

  const refetch = () => {
    resetState();
    notifications.clearCache();
    return fetchNotifications();
  };

  const fetchMore = () => {
    if (!hasMore || isFetching) return;
    fetchNotifications();
  };

  const readAll = async () => {
    try {
      await notifications.readAll({ tags });
    } catch (err) {
      setError(err as NovuError);
    }
  };

  const archiveAll = async () => {
    try {
      await notifications.archiveAll({ tags });
    } catch (err) {
      setError(err as NovuError);
    }
  };

  const archiveAllRead = async () => {
    try {
      await notifications.archiveAllRead({ tags });
    } catch (err) {
      setError(err as NovuError);
    }
  };

  return {
    readAll,
    archiveAll,
    archiveAllRead,
    data,
    error,
    isLoading,
    isFetching,
    refetch,
    fetchMore,
    hasMore,
  };
};
