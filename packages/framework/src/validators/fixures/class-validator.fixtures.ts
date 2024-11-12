import 'reflect-metadata';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SimpleStringSchema {
  @IsString()
  name!: string;
}

class NestedChildrenSchema {
  @IsNumber()
  age!: number;
}

export class NestedSchema {
  @IsString()
  name!: string;

  @ValidateNested()
  @Type(() => NestedChildrenSchema)
  nested!: NestedChildrenSchema;
}

export class SimpleStringAndNumberSchema {
  @IsString()
  name!: string;
  @IsNumber()
  age!: number;
}
