package com.order_service.demo.controller;

import com.order_service.demo.common.ApiResponse;
import com.order_service.demo.dto.request.TableStatusUpdateRequest;
import com.order_service.demo.dto.response.CafeTableResponse;
import com.order_service.demo.service.TableService;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Path("/tables")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TableController {

    TableService tableService;

    @GET
    public ApiResponse<List<CafeTableResponse>> getTables() {
        List<CafeTableResponse> tables = tableService.getAllTables();
        return ApiResponse.<List<CafeTableResponse>>builder()
                .result(tables)
                .build();
    }

    @PATCH
    @Path("/{tableNumber}/status")
    public ApiResponse<CafeTableResponse> updateStatus(@PathParam("tableNumber") String tableNumber,
                                                       @Valid TableStatusUpdateRequest request) {
        CafeTableResponse response = tableService.updateStatus(tableNumber, request.getStatus());
        return ApiResponse.<CafeTableResponse>builder()
                .result(response)
                .build();
    }
}
