import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Sidebar, Title, errorMessage } from '@novu/design-system';
import { Group } from '@mantine/core';
import { Control, FormProvider, useForm } from 'react-hook-form';
import { slugify } from '@novu/shared';
import { useEnvironment } from '../../../hooks';
import { api } from '../../../api';
import { useGetDefaultLocale } from '../hooks/useGetDefaultLocale';

import { TranslationFolderIconSmall } from '../icons';

import { GroupFormCommonFields } from './GroupFormCommonFields';
import { ICreateGroup } from './shared';

function defaultValues(defaultLocale = '') {
  return {
    name: '',
    identifier: '',
    locales: [defaultLocale],
  };
}

export const CreateGroupSidebar = ({
  open,
  onClose,
  onGroupCreated,
}: {
  open: boolean;
  onClose: () => void;
  onGroupCreated: (id: string) => void;
}) => {
  const queryClient = useQueryClient();
  const { readonly } = useEnvironment();
  const { defaultLocale } = useGetDefaultLocale();

  const { mutateAsync: createTranslationGroup, isLoading: isSaving } = useMutation<
    any,
    { error: string; message: string; statusCode: number },
    ICreateGroup
  >((data) => api.post('/v1/translations/groups', data), {
    onSuccess: (data) => {
      onGroupCreated(data.identifier);
      queryClient.refetchQueries(['changesCount']);
      queryClient.refetchQueries(['translationGroups']);
    },
    onError: (e: any) => {
      errorMessage(e.message || 'Unexpected error');
    },
  });

  const methods = useForm({
    mode: 'onChange',
    defaultValues: defaultValues(defaultLocale),
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid, isDirty },
    reset,
  } = methods;

  const name = watch('name');
  const identifier = watch('identifier');
  const localesForm = watch('locales');

  useEffect(() => {
    if (defaultLocale) {
      reset(defaultValues(defaultLocale));
    }
  }, [defaultLocale, reset]);

  useEffect(() => {
    if (defaultLocale && localesForm.length === 0) {
      setValue('locales', [defaultLocale]);
    }
  }, [defaultLocale, localesForm, setValue]);

  useEffect(() => {
    const newIdentifier = slugify(name);

    if (newIdentifier === identifier) {
      return;
    }

    setValue('identifier', newIdentifier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const onSubmit = async (data: any) => {
    await createTranslationGroup(data);
  };

  return (
    <Sidebar
      isOpened={open}
      onSubmit={handleSubmit(onSubmit)}
      onClose={onClose}
      onBack={onClose}
      customHeader={
        <Group>
          <TranslationFolderIconSmall />
          <Title size={2}>Add a group </Title>
        </Group>
      }
      customFooter={
        <Group ml="auto">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            submit
            loading={isSaving}
            disabled={readonly || !isDirty || !isValid}
            data-test-id="add-group-submit-btn"
          >
            Add group
          </Button>
        </Group>
      }
    >
      <FormProvider {...methods}>
        <GroupFormCommonFields control={control as Control<ICreateGroup>} readonly={readonly} />
      </FormProvider>
    </Sidebar>
  );
};
