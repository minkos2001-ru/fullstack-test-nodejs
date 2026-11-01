import { IsInt, IsOptional, Min, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";

export class GetBookCategoriesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  startRow?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  endRow?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
