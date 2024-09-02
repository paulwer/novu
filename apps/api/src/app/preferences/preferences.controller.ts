import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FeatureFlagsKeysEnum, UserSessionData } from '@novu/shared';
import {
  GetFeatureFlag,
  GetFeatureFlagCommand,
  GetPreferences,
  GetPreferencesCommand,
  UpsertPreferences,
  UpsertPreferencesCommand,
  UserAuthGuard,
  UserSession,
} from '@novu/application-generic';

import { ApiExcludeController } from '@nestjs/swagger';
import { UpsertPreferencesDto } from './dtos/upsert-preferences.dto';
import { PreferencesActorEnum } from '@novu/dal';

@Controller('/preferences')
@UseInterceptors(ClassSerializerInterceptor)
@ApiExcludeController()
export class PreferencesController {
  constructor(
    private upsertPreferences: UpsertPreferences,
    private getPreferences: GetPreferences,
    private getFeatureFlag: GetFeatureFlag
  ) {}

  @Get('/')
  @UseGuards(UserAuthGuard)
  async get(@UserSession() user: UserSessionData, @Query('workflowId') workflowId: string) {
    await this.verifyPreferencesApiAvailability(user);

    return this.getPreferences.execute(
      GetPreferencesCommand.create({
        templateId: workflowId,
        environmentId: user.environmentId,
        organizationId: user.organizationId,
      })
    );
  }

  @Post('/')
  @UseGuards(UserAuthGuard)
  async upsert(@Body() data: UpsertPreferencesDto, @UserSession() user: UserSessionData) {
    await this.verifyPreferencesApiAvailability(user);

    return this.upsertPreferences.execute(
      UpsertPreferencesCommand.create({
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        userId: user._id,
        preferences: data.preferences,
        templateId: data.workflowId,
        actor: PreferencesActorEnum.USER,
      })
    );
  }

  private async verifyPreferencesApiAvailability(user: UserSessionData) {
    const isEnabled = await this.getFeatureFlag.execute(
      GetFeatureFlagCommand.create({
        userId: user._id,
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        key: FeatureFlagsKeysEnum.IS_WORKFLOW_PREFERENCES_ENABLED,
      })
    );

    if (isEnabled) {
      return;
    }

    throw new NotFoundException();
  }
}
