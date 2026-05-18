package com.gateway_service.common;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import jakarta.ws.rs.ForbiddenException;
import io.quarkus.security.UnauthorizedException;

@Provider
public class GlobalExeptionHandler implements ExceptionMapper<Throwable> {

    private static final java.util.logging.Logger log = java.util.logging.Logger.getLogger(GlobalExeptionHandler.class.getName());

    @Override
    public Response toResponse(Throwable exception) {
        if (exception instanceof WebApplicationException) {
            WebApplicationException wae = (WebApplicationException) exception;
            Response response = wae.getResponse();
            String errorMsg = exception.getMessage();
            try {
                if (response.hasEntity()) {
                    errorMsg = response.readEntity(String.class);
                }
            } catch (Exception e) {
                // Ignore reading exception
            }
            log.severe("Service call failed: status=" + response.getStatus() + ", message=" + errorMsg);
            
            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .code(response.getStatus())
                    .message(wae.getMessage())
                    .result(errorMsg)
                    .build();
            return Response.status(response.getStatus()).entity(apiResponse).build();
        }

        if (exception instanceof ForbiddenException || exception instanceof io.quarkus.security.ForbiddenException) {
            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .code(Response.Status.FORBIDDEN.getStatusCode())
                    .message(exception.getMessage())
                    .build();
            return Response.status(Response.Status.FORBIDDEN).entity(apiResponse).build();
        }

        if (exception instanceof UnauthorizedException) {
            ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                    .code(Response.Status.UNAUTHORIZED.getStatusCode())
                    .message(exception.getMessage())
                    .build();
            return Response.status(Response.Status.UNAUTHORIZED).entity(apiResponse).build();
        }

        log.severe("Unexpected error: " + exception.getMessage());
        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .code(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode())
                .message(exception.getMessage())
                .build();
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(apiResponse).build();
    }
}
