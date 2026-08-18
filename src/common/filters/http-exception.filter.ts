import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetails: any = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || message;
        errorDetails = resp.error ? { code: resp.error } : {};
      }
    }

    const isProduction = process.env.NODE_ENV === 'production';

    response.status(status).json({
      success: false,
      message: Array.isArray(message) ? message[0] : message,
      error: {
        code: status,
        details: Array.isArray(message) ? message : errorDetails,
        ...(isProduction ? {} : { stack: exception instanceof Error ? exception.stack : undefined }),
      },
    });
  }
}
