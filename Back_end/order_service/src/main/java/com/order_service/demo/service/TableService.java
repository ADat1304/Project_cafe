package com.order_service.demo.service;

import com.order_service.demo.common.exception.AppException;
import com.order_service.demo.common.exception.ErrorCode;
import com.order_service.demo.dto.response.CafeTableResponse;
import com.order_service.demo.entity.CafeTable;
import com.order_service.demo.repository.CafeTableRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TableService {

    CafeTableRepository cafeTableRepository;

    public List<CafeTableResponse> getAllTables() {
        return cafeTableRepository.listAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CafeTableResponse updateStatus(String tableNumber, Integer status) {
        CafeTable table = cafeTableRepository.findByTableNumber(tableNumber)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));

        table.setStatus(status);
        cafeTableRepository.persist(table);
        return toResponse(table);
    }

    private CafeTableResponse toResponse(CafeTable table) {
        return CafeTableResponse.builder()
                .tableId(table.getTableID())
                .tableNumber(table.getTableNumber())
                .status(table.getStatus())
                .build();
    }
}