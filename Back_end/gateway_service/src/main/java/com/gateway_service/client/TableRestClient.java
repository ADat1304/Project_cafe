package com.gateway_service.client;

import com.gateway_service.common.ApiResponse;
import com.gateway_service.dto.table.CafeTableResponse;
import com.gateway_service.dto.table.TableStatusUpdateRequest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import java.util.List;

@RegisterRestClient(configKey = "order-client")
@Path("/tables")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface TableRestClient {

    @GET
    ApiResponse<List<CafeTableResponse>> getAllTables(@HeaderParam("Authorization") String token);

    @PATCH
    @Path("/{tableNumber}/status")
    ApiResponse<CafeTableResponse> updateTableStatus(@PathParam("tableNumber") String tableNumber, TableStatusUpdateRequest request, @HeaderParam("Authorization") String token);
}
