import { ReactNode, useMemo, useCallback, useRef, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
// eslint-disable-next-line
// @ts-ignore
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { WorkflowEditorContext } from './workflow-editor-context';
import { StepTypeEnum } from '@/utils/enums';
import { Form } from '../primitives/form/form';
import { buildRoute, ROUTES } from '@/utils/routes';
import { useEnvironment } from '@/context/environment/hooks';
import { workflowSchema } from './schema';
import { useFetchWorkflow, useUpdateWorkflow, useFormAutoSave } from '@/hooks';
import { Step } from '@/utils/types';
import { showToast } from '../primitives/sonner-helpers';
import { ToastIcon } from '../primitives/sonner';
import { handleValidationIssues } from '@/utils/handleValidationIssues';
import { WorkflowOriginEnum } from '@novu/shared';

const STEP_NAME_BY_TYPE: Record<StepTypeEnum, string> = {
  email: 'Email Step',
  chat: 'Chat Step',
  in_app: 'In-App Step',
  sms: 'SMS Step',
  push: 'Push Step',
  digest: 'Digest Step',
  delay: 'Delay Step',
  trigger: 'Trigger Step',
  custom: 'Custom Step',
};

const createStep = (type: StepTypeEnum): Step => ({
  name: STEP_NAME_BY_TYPE[type],
  stepId: '',
  type,
  _id: crypto.randomUUID(),
});

export const WorkflowEditorProvider = ({ children }: { children: ReactNode }) => {
  const changesSavedToastIdRef = useRef<string | number>();
  const { currentEnvironment } = useEnvironment();
  const { workflowSlug } = useParams<{ workflowSlug?: string }>();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof workflowSchema>>({ mode: 'onSubmit', resolver: zodResolver(workflowSchema) });
  const { reset, setError } = form;
  const steps = useFieldArray({
    control: form.control,
    name: 'steps',
  });

  const { workflow, error } = useFetchWorkflow({
    workflowSlug,
  });
  const isReadOnly = workflow?.origin === WorkflowOriginEnum.EXTERNAL;

  useLayoutEffect(() => {
    if (error) {
      navigate(buildRoute(ROUTES.WORKFLOWS, { environmentId: currentEnvironment?._id ?? '' }));
    }

    if (!workflow) {
      return;
    }

    reset({ ...workflow, steps: workflow.steps.map((step) => ({ ...step })) });
  }, [workflow, error, navigate, reset, currentEnvironment]);

  const { updateWorkflow } = useUpdateWorkflow({
    onSuccess: (data) => {
      reset({ ...data, steps: data.steps.map((step) => ({ ...step })) });

      if (data.issues) {
        // TODO: remove the as any cast when BE issues are typed
        handleValidationIssues({ fields: form.getValues(), issues: data.issues as any, setError });
      }

      if (changesSavedToastIdRef.current) {
        return;
      }

      const id = showToast({
        children: () => (
          <>
            <ToastIcon />
            <span className="text-sm">Saved</span>
          </>
        ),
        options: {
          position: 'bottom-left',
          classNames: {
            toast: 'ml-10',
          },
          onAutoClose: () => {
            changesSavedToastIdRef.current = undefined;
          },
        },
      });
      changesSavedToastIdRef.current = id;
    },
  });

  useFormAutoSave({
    form,
    onSubmit: async (data: z.infer<typeof workflowSchema>) => {
      if (!workflow) {
        return;
      }

      updateWorkflow({ id: workflow._id, workflow: { ...workflow, ...data } as any });
    },
    enabled: !isReadOnly,
  });

  const addStep = useCallback(
    (channelType: StepTypeEnum, stepIndex?: number) => {
      const newStep = createStep(channelType);
      if (stepIndex != null) {
        steps.insert(stepIndex, newStep);
      } else {
        steps.append(newStep);
      }
    },
    [steps]
  );

  const value = useMemo(
    () => ({
      isReadOnly,
      addStep,
    }),
    [addStep, isReadOnly]
  );

  return (
    <WorkflowEditorContext.Provider value={value}>
      <Form {...form}>
        <form className="h-full">{children}</form>
      </Form>
    </WorkflowEditorContext.Provider>
  );
};
