import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res: any = exceptionResponse;
        message = res.message || res.error || 'Error';
        errors = Array.isArray(res.message) ? res.message : null;
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? 'Validation failed' : message,
      errors: errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}