import 'reflect-metadata';
import { IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

enum TestEnum {
  A = 'A',
  B = 'B',
  C = 'C',
}

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
export class NestedArraySchema {
  @IsString()
  name!: string;

  @ValidateNested({ each: true })
  @Type(() => NestedChildrenSchema)
  nested!: NestedChildrenSchema[];
}

export class SimpleStringAndNumberSchema {
  @IsString()
  name!: string;
  @IsNumber()
  age!: number;
}

export class SimpleTestEnum {
  @IsString()
  @IsEnum(TestEnum)
  enum?: TestEnum;
}
