import {
  IsDateString,
  IsOptional,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateBookDto {
  @IsString({ message: "Название должно быть строкой" })
  @IsNotEmpty({ message: "Название обязательно" })
  @MaxLength(255, { message: "Название не должно превышать 255 символов" })
  title!: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: "Цена должна быть числом с максимум двумя знаками после запятой",
    },
  )
  @Min(0, { message: "Цена не может быть отрицательной" })
  price!: number;

  @IsDateString({}, { message: "Укажите корректную дату публикации" })
  publishedAt!: string;

  @Type(() => Number)
  @IsInt({ message: "Количество страниц должно быть целым числом" })
  @Min(1, { message: "Количество страниц должно быть больше нуля" })
  pages!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number | null;
}
