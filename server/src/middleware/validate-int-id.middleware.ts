import type { Request, Response, NextFunction } from "express";

export const validateIntId = (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Некорректный ID",
    });
  }

  next();
};
