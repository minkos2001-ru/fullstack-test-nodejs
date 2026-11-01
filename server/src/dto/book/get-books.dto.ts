import { Type } from "class-transformer";
import { IsInt, Min, IsOptional } from "class-validator";

export class GetBooksDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Начальная строка должна быть целым числом" })
  @Min(0, { message: "Начальная строка не может быть отрицательной" })
  startRow?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Конечная строка должна быть целым числом" })
  @Min(1, { message: "Конечная строка должна быть положительной" })
  endRow?: number;
}
