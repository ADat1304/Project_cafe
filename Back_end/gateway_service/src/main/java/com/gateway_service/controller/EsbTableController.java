package com.gateway_service.controller;

import com.gateway_service.client.TableClient;
import com.gateway_service.dto.table.CafeTableResponse;
import com.gateway_service.dto.table.TableStatusUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import io.quarkus.security.Authenticated;

import java.util.List;

@Path("/esb/tables")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
@Authenticated
public class EsbTableController {

    private final TableClient tableClient;

    @GET
    public List<CafeTableResponse> listTables(
            @HeaderParam("Authorization") String authorization
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return tableClient.getAllTables(token);
    }

    @PATCH
    @Path("/{tableNumber}/status")
    public CafeTableResponse updateStatus(
            @PathParam("tableNumber") String tableNumber,
            @HeaderParam("Authorization") String authorization,
            @Valid TableStatusUpdateRequest request
    ) {
        String token = authorization != null ? authorization.replace("Bearer ", "") : null;
        return tableClient.updateTableStatus(tableNumber, request.getStatus(), token);
    }
}