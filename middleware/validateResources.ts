import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

const validateResource =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next(); 
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => issue.message);
        res.status(400).json({ errors });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };

export default validateResource;
