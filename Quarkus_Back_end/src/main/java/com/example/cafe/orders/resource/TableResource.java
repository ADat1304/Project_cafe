package com.example.cafe.orders.resource;

import com.example.cafe.common.ApiResponse;
import com.example.cafe.orders.entity.CafeTable;
import com.example.cafe.orders.repository.CafeTableRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.Map;

@Path("/tables")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TableResource {

    @Inject
    CafeTableRepository cafeTableRepository;

    @GET
    public ApiResponse<List<CafeTable>> getAllTables() {
        return ApiResponse.<List<CafeTable>>builder()
                .result(cafeTableRepository.listAll())
                .build();
    }

    @PATCH
    @Path("/{tableNumber}/status")
    @Transactional
    public ApiResponse<CafeTable> updateStatus(@PathParam("tableNumber") String tableNumber, Map<String, Integer> request) {
        CafeTable table = cafeTableRepository.findByTableNumber(tableNumber)
                .orElseThrow(() -> new NotFoundException("Table not found"));
        
        if (request.containsKey("status")) {
            table.setStatus(request.get("status"));
        }
        
        return ApiResponse.<CafeTable>builder()
                .result(table)
                .build();
    }
}
