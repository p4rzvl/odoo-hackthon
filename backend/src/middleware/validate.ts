import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Build clear, field-specific error messages
        const fieldErrors: Record<string, string[]> = {};
        error.issues.forEach((err: ZodIssue) => {
          const path = err.path.join('.');
          if (path) {
            if (!fieldErrors[path]) {
              fieldErrors[path] = [];
            }
            fieldErrors[path].push(err.message);
          }
        });

        // Get a primary error message for display
        const primaryError = error.issues[0]?.message || 'Invalid request parameters';

        res.status(400).json({
          success: false,
          error: primaryError,
          fields: fieldErrors
        });
        return;
      }
      next(error);
    }
  };
};
