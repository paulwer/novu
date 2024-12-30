import { PostActionEnum } from '../constants';
import { WithPassthrough } from './provider.types';
import type { Subscriber } from './subscriber.types';

export type Event = {
  payload: Record<string, unknown>;
  workflowId: string;
  stepId: string;
  controls: Record<string, unknown>;
  state: State[];
  action: Exclude<PostActionEnum, PostActionEnum.TRIGGER>;
  subscriber: Subscriber;
};

export type State = {
  stepId: string;
  outputs: Record<string, unknown>;
  state: { status: string; error?: string };
};

export type ExecuteOutputMetadata = {
  status: string;
  error: boolean;
  /**
   * The duration of the step execution in milliseconds
   */
  duration: number;
};

export type ExecuteOutputOptions = {
  skip: boolean;
};

export type ExecuteOutput = {
  outputs: Record<string, unknown>;
  providers?: Record<string, WithPassthrough<Record<string, unknown>>>;
  options: ExecuteOutputOptions;
  metadata: ExecuteOutputMetadata;
};
