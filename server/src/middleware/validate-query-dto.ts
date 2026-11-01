import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export const validateQueryDto =
  <T extends object>(dtoClass: new () => T) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const instance = plainToInstance(dtoClass, req.query);
    const errors = await validate(instance, { whitelist: true });

    if (errors.length) {
      return res.status(400).json({
        message: errors.flatMap((e) => Object.values(e.constraints ?? {})),
      });
    }

    res.locals.query = instance;
    next();
  };
