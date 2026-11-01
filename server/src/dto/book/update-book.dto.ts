import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { AtLeastOneField } from "../../decorators/at-least-one-field";

@AtLeastOneField()
export class UpdateBookDto {
  @IsOptional()
  @IsString({ message: "Название должно быть строкой" })
  @IsNotEmpty({ message: "Название не может быть пустым" })
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsDateString({}, { message: "Укажите корректную дату публикации" })
  publishedAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pages?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number | null;
}
