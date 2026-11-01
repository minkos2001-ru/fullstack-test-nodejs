import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";

import { AtLeastOneField } from "../../decorators/at-least-one-field";

@AtLeastOneField()
export class UpdateBookCategoryDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string | null;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: "budget должен быть числом с точностью до двух знаков" },
  )
  budget?: string;

  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number | null;
}
