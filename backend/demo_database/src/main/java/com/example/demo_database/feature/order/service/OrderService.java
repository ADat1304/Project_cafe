package com.example.demo_database.feature.order.service;


import com.example.demo_database.common.exception.AppException;
import com.example.demo_database.common.exception.ErrorCode;
import com.example.demo_database.feature.order.dto.request.OrderCreationRequest;
import com.example.demo_database.feature.order.dto.request.OrderItemRequest;
import com.example.demo_database.feature.order.dto.response.OrderResponse;
import com.example.demo_database.feature.order.entity.CafeTable;
import com.example.demo_database.feature.order.entity.OrderDetail;
import com.example.demo_database.feature.order.entity.Orders;
import com.example.demo_database.feature.order.entity.PaymentMethod;
import com.example.demo_database.feature.order.mapper.OrderMapper;
import com.example.demo_database.feature.order.repository.CafeTableRepository;
import com.example.demo_database.feature.order.repository.OrderRepository;
import com.example.demo_database.feature.order.repository.PaymentMethodRepository;
import com.example.demo_database.feature.product.entity.Product;
import com.example.demo_database.feature.product.repository.ProductRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {

    OrderRepository orderRepository;
    ProductRepository productRepository;
    CafeTableRepository cafeTableRepository;
    PaymentMethodRepository paymentMethodRepository;
    OrderMapper orderMapper;

    @Transactional
    public OrderResponse createOrder(OrderCreationRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new AppException(ErrorCode.ORDER_ITEMS_EMPTY);
        }

        Orders order = new Orders();
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("OPEN");

        if (request.getTableNumber() != null) {
            CafeTable table = cafeTableRepository.findByTableNumber(request.getTableNumber())
                    .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));
            order.setTable(table);
            table.setStatus(1);
        }

        if (request.getPaymentMethodType() != null) {
            PaymentMethod paymentMethod = paymentMethodRepository.findByPaymentMethodType(request.getPaymentMethodType())
                    .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));
            order.setPaymentMethod(paymentMethod);
        }

        List<OrderDetail> details = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest item : request.getItems()) {
            Product product = productRepository.findByProductName(item.getProductName())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

            if (product.getAmount() < item.getQuantity()) {
                throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK);
            }

            product.setAmount(product.getAmount() - item.getQuantity());

            OrderDetail detail = OrderDetail.builder()
                    .order(order)
                    .product(product)
                    .quantity(item.getQuantity())
                    .unitPrice(product.getPrice())
                    .notes(item.getNotes())
                    .build();
            details.add(detail);

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);
        }

        order.setOrderDetails(details);
        order.setTotalAmount(totalAmount);

        Orders savedOrder = orderRepository.save(order);
        return orderMapper.toOrderResponse(savedOrder);
    }
}