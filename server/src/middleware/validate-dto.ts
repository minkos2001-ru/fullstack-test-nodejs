import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export function validateDto<T extends object>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body ?? {});

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      res.status(400).json({
        message: "Validation failed",
        errors: errors.flatMap((error) =>
          Object.values(error.constraints ?? {}),
        ),
      });
      return;
    }

    req.body = dto;
    next();
  };
}
