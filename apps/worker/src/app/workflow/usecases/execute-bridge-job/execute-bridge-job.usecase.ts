import { Injectable, Logger } from '@nestjs/common';

import {
  ControlValuesRepository,
  NotificationTemplateEntity,
  EnvironmentRepository,
  JobRepository,
  NotificationTemplateRepository,
  MessageRepository,
  JobEntity,
} from '@novu/dal';
import {
  ControlValuesLevelEnum,
  ExecutionDetailsSourceEnum,
  ExecutionDetailsStatusEnum,
  ITriggerPayload,
  JobStatusEnum,
  WorkflowOriginEnum,
  WorkflowTypeEnum,
} from '@novu/shared';
import { Event, State, PostActionEnum, ExecuteOutput } from '@novu/framework/internal';

import {
  CreateExecutionDetails,
  CreateExecutionDetailsCommand,
  DetailEnum,
  ExecuteBridgeRequest,
  ExecuteBridgeRequestCommand,
} from '@novu/application-generic';
import { ExecuteBridgeJobCommand } from './execute-bridge-job.command';

const LOG_CONTEXT = 'ExecuteBridgeJob';

@Injectable()
export class ExecuteBridgeJob {
  constructor(
    private jobRepository: JobRepository,
    private notificationTemplateRepository: NotificationTemplateRepository,
    private messageRepository: MessageRepository,
    private environmentRepository: EnvironmentRepository,
    private controlValuesRepository: ControlValuesRepository,
    private createExecutionDetails: CreateExecutionDetails,
    private executeBridgeRequest: ExecuteBridgeRequest
  ) {}

  async execute(command: ExecuteBridgeJobCommand): Promise<ExecuteOutput | null> {
    const stepId = command.job.step.stepId || command.job.step.uuid;

    const isStateful = !command.job.step.bridgeUrl;

    let workflow: NotificationTemplateEntity | null = null;
    if (isStateful) {
      workflow = await this.notificationTemplateRepository.findOne(
        {
          _id: command.job._templateId,
          _environmentId: command.environmentId,
          type: {
            $in: [WorkflowTypeEnum.ECHO, WorkflowTypeEnum.BRIDGE],
          },
        },
        '_id triggers type origin'
      );
    }

    if (!workflow && isStateful) {
      return null;
    }

    if (!stepId) {
      throw new Error('Step id is not set');
    }

    const environment = await this.environmentRepository.findOne(
      {
        _id: command.environmentId,
        _organizationId: command.organizationId,
      },
      'echo apiKeys _id'
    );

    if (!environment) {
      throw new Error(`Environment id ${command.environmentId} is not found`);
    }

    if (!environment?.echo?.url && isStateful && workflow?.origin === WorkflowOriginEnum.EXTERNAL) {
      throw new Error(`Bridge URL is not set for environment id: ${environment._id}`);
    }

    const { subscriber, payload: originalPayload } = command.variables || {};
    const payload = this.normalizePayload(originalPayload);

    const state = await this.generateState(payload, command);

    const variablesStores = isStateful
      ? await this.findControlValues(command, workflow as NotificationTemplateEntity)
      : command.job.step.controlVariables;

    const bridgeEvent: Omit<Event, 'workflowId' | 'stepId' | 'action'> = {
      payload: payload ?? {},
      controls: variablesStores ?? {},
      state,
      subscriber: subscriber ?? {},
    };

    const workflowId = isStateful
      ? (workflow as NotificationTemplateEntity).triggers[0].identifier
      : command.identifier;

    const bridgeResponse = await this.sendBridgeRequest({
      environmentId: command.environmentId,
      /*
       * TODO: We fallback to external due to lack of backfilling origin for existing Workflows.
       * Once we backfill the origin field for existing Workflows, we should remove the fallback.
       */
      workflowOrigin: workflow?.origin || WorkflowOriginEnum.EXTERNAL,
      statelessBridgeUrl: command.job.step.bridgeUrl,
      event: bridgeEvent,
      job: command.job,
      searchParams: {
        workflowId,
        stepId,
      },
    });

    const createExecutionDetailsCommand: CreateExecutionDetailsCommand = {
      ...CreateExecutionDetailsCommand.getDetailsFromJob(command.job),
      detail: DetailEnum.SUCCESSFUL_BRIDGE_RESPONSE_RECEIVED,
      source: ExecutionDetailsSourceEnum.INTERNAL,
      status: ExecutionDetailsStatusEnum.PENDING,
      isTest: false,
      isRetry: false,
      raw: JSON.stringify(bridgeResponse.metadata),
    };

    await this.createExecutionDetails.execute(createExecutionDetailsCommand);

    return bridgeResponse;
  }

  private async findControlValues(command: ExecuteBridgeJobCommand, workflow: NotificationTemplateEntity) {
    const controls = await this.controlValuesRepository.findOne({
      _organizationId: command.organizationId,
      _workflowId: workflow._id,
      _stepId: command.job.step._id,
      level: ControlValuesLevelEnum.STEP_CONTROLS,
    });

    return controls?.controls;
  }

  private normalizePayload(originalPayload: ITriggerPayload = {}) {
    // Remove internal params
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { __source, ...payload } = originalPayload;

    return payload;
  }

  private async generateState(payload, command: ExecuteBridgeJobCommand): Promise<State[]> {
    const previousJobs: State[] = [];
    let theJob = (await this.jobRepository.findOne({
      _id: command.job._parentId,
      _environmentId: command.environmentId,
    })) as JobEntity;

    if (theJob) {
      const jobState = await this.mapState(theJob, payload);
      previousJobs.push(jobState);
    }

    while (theJob) {
      theJob = (await this.jobRepository.findOne({
        _id: theJob._parentId,
        _environmentId: command.environmentId,
      })) as JobEntity;

      if (theJob) {
        const jobState = await this.mapState(theJob, payload);
        previousJobs.push(jobState);
      }
    }

    return previousJobs;
  }

  private async sendBridgeRequest({
    statelessBridgeUrl,
    event,
    job,
    searchParams,
    workflowOrigin,
    environmentId,
  }: Omit<ExecuteBridgeRequestCommand, 'afterResponse' | 'action' | 'retriesLimit'> & {
    job: JobEntity;
  }): Promise<ExecuteOutput> {
    try {
      return this.executeBridgeRequest.execute({
        statelessBridgeUrl,
        event,
        action: PostActionEnum.EXECUTE,
        searchParams,
        afterResponse: async (response) => {
          const body = response?.body as string;

          if (response.statusCode >= 400) {
            let rawMessage: Record<string, unknown>;
            try {
              rawMessage = JSON.parse(body);
            } catch {
              Logger.error(`Unexpected body received from Bridge: ${body}`, LOG_CONTEXT);
              rawMessage = {
                error: `Unexpected body received from Bridge: ${body}`,
              };
            }
            const createExecutionDetailsCommand: CreateExecutionDetailsCommand = {
              ...CreateExecutionDetailsCommand.getDetailsFromJob(job),
              detail: DetailEnum.FAILED_BRIDGE_RETRY,
              source: ExecutionDetailsSourceEnum.INTERNAL,
              status: ExecutionDetailsStatusEnum.WARNING,
              isTest: false,
              isRetry: false,
              raw: JSON.stringify({
                url: statelessBridgeUrl,
                statusCode: response.statusCode,
                retryCount: response.retryCount,
                message: response.statusMessage,
                ...(body && body?.length > 0 ? { raw: rawMessage } : {}),
              }),
            };

            await this.createExecutionDetails.execute(createExecutionDetailsCommand);
          }

          return response;
        },
        workflowOrigin,
        environmentId,
      }) as Promise<ExecuteOutput>;
    } catch (error: any) {
      Logger.error(error, 'Error sending Bridge request:', LOG_CONTEXT);

      let raw: { retryCount?: number; statusCode?: number; message: string; url?: string };

      if (error.response) {
        let rawMessage: Record<string, unknown>;
        const errorResponseBody = error?.response?.body;
        try {
          rawMessage = JSON.parse(errorResponseBody);
        } catch {
          Logger.error(`Unexpected body received from Bridge: ${errorResponseBody}`, LOG_CONTEXT);
          rawMessage = {
            error: `Unexpected body received from Bridge: ${errorResponseBody}`,
          };
        }

        raw = {
          url: statelessBridgeUrl,
          statusCode: error.response?.statusCode,
          message: error.response?.statusMessage,
          ...(error.response?.retryCount ? { retryCount: error.response?.retryCount } : {}),
          ...(error?.response?.body?.length > 0 ? { raw: rawMessage } : {}),
        };
      } else if (error.message) {
        raw = {
          url: statelessBridgeUrl,
          message: error.message,
        };
      } else {
        raw = {
          url: statelessBridgeUrl,
          message: 'An Unexpected Error Occurred',
        };
      }

      const createExecutionDetailsCommand: CreateExecutionDetailsCommand = {
        ...CreateExecutionDetailsCommand.getDetailsFromJob(job),
        detail: DetailEnum.FAILED_BRIDGE_EXECUTION,
        source: ExecutionDetailsSourceEnum.INTERNAL,
        status: ExecutionDetailsStatusEnum.FAILED,
        isTest: false,
        isRetry: false,
        raw: JSON.stringify(raw),
      };

      await this.createExecutionDetails.execute(createExecutionDetailsCommand);

      throw error;
    }
  }

  private async mapState(job: JobEntity, payload: Record<string, unknown>) {
    let output = {};

    switch (job.type) {
      case 'delay': {
        output = {
          duration: Date.now() - new Date(job.createdAt).getTime(),
        };
        break;
      }
      case 'digest': {
        const digestJobs = await this.jobRepository.find(
          {
            _mergedDigestId: job._id,
            type: 'digest',
            status: JobStatusEnum.MERGED,
            _environmentId: job._environmentId,
          },
          {
            payload: 1,
            createdAt: 1,
            _id: 1,
            transactionId: 1,
          }
        );
        output = {
          events: [...digestJobs, job]
            .map((digestJob) => ({
              id: digestJob._id,
              time: digestJob.createdAt,
              payload: digestJob.payload ?? {},
            }))
            .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
        };
        break;
      }
      case 'custom': {
        output = job.stepOutput || {};
        break;
      }
      case 'in_app': {
        const message = await this.messageRepository.findOne(
          { _environmentId: job._environmentId, _jobId: job._id },
          'seen read lastSeenDate lastReadDate'
        );
        if (message) {
          output = {
            seen: message.seen,
            read: message.read,
            lastSeenDate: message.lastSeenDate || null,
            lastReadDate: message.lastReadDate || null,
          };
        }
        break;
      }
      default: {
        break;
      }
    }

    return {
      stepId: job?.step.stepId || job?.step.uuid || '',
      outputs: output ?? {},
      state: {
        status: job?.status,
        error: job?.error,
      },
    };
  }
}
