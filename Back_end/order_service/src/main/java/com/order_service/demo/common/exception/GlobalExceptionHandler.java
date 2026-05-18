package com.order_service.demo.common.exception;

import com.order_service.demo.common.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class GlobalExceptionHandler implements ExceptionMapper<Throwable> {

    @Override
    public Response toResponse(Throwable exception) {
        if (exception instanceof AppException) {
            AppException appException = (AppException) exception;
            ErrorCode errorCode = appException.getErrorCode();
            ApiResponse apiResponse = new ApiResponse();
            apiResponse.setCode(errorCode.getCode());
            apiResponse.setMessage(errorCode.getMessenger());
            return Response.status(Response.Status.BAD_REQUEST).entity(apiResponse).build();
        }

        if (exception instanceof ConstraintViolationException) {
            ConstraintViolationException cve = (ConstraintViolationException) exception;
            String enumKey = cve.getConstraintViolations().iterator().next().getMessage();
            ErrorCode errorCode = ErrorCode.INVALID_KEY;
            try {
                errorCode = ErrorCode.valueOf(enumKey);
            } catch (IllegalArgumentException e) {
                // Ignore and keep standard
            }
            ApiResponse apiResponse = new ApiResponse();
            apiResponse.setCode(errorCode.getCode());
            apiResponse.setMessage(errorCode.getMessenger());
            return Response.status(Response.Status.BAD_REQUEST).entity(apiResponse).build();
        }

        if (exception instanceof RuntimeException) {
            ApiResponse apiResponse = new ApiResponse();
            apiResponse.setCode(1001);
            apiResponse.setMessage(exception.getMessage());
            return Response.status(Response.Status.BAD_REQUEST).entity(apiResponse).build();
        }

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(5000);
        apiResponse.setMessage("Internal Server Error: " + exception.getMessage());
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(apiResponse).build();
    }
}