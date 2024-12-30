import { ClassSerializerInterceptor, Controller, Get, Query, UseInterceptors } from '@nestjs/common';

import { ExternalApiAccessible, UserSession } from '@novu/application-generic';
import { type StepType } from '@novu/framework/internal';

import { UserSessionData } from '@novu/shared';
import { createGetStepSchemaCommand } from './usecases/get-step-schema/get-step-schema.command';
import { UserAuthentication } from '../shared/framework/swagger/api.key.security';
import { GetStepSchemaUseCase } from './usecases/get-step-schema/get-step-schema.usecase';
import { StepSchemaDto } from './dtos/step-schema.dto';
import { ParseSlugIdPipe } from '../workflows-v2/pipes/parse-slug-id.pipe';

@Controller('/steps')
@UserAuthentication()
@UseInterceptors(ClassSerializerInterceptor)
export class StepSchemasController {
  constructor(private getStepDefaultSchemaUsecase: GetStepSchemaUseCase) {}

  @Get()
  @ExternalApiAccessible()
  async getWorkflowStepSchema(
    @UserSession() user: UserSessionData,
    @Query('stepType') stepType?: StepType,
    @Query('workflowId', ParseSlugIdPipe) workflowId?: string,
    @Query('stepId', ParseSlugIdPipe) stepId?: string
  ): Promise<StepSchemaDto> {
    return await this.getStepDefaultSchemaUsecase.execute(
      createGetStepSchemaCommand(user, stepType, workflowId, stepId)
    );
  }
}
