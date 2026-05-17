package com.example.cafe.orders.service;

import com.example.cafe.common.exception.AppException;
import com.example.cafe.common.exception.ErrorCode;
import com.example.cafe.orders.dto.request.OrderCreationRequest;
import com.example.cafe.orders.dto.request.OrderItemRequest;
import com.example.cafe.orders.dto.request.OrderStatusUpdateRequest;
import com.example.cafe.orders.dto.response.DailyOrderStatsResponse;
import com.example.cafe.orders.dto.response.OrderResponse;
import com.example.cafe.orders.dto.response.TopProductResponse;
import com.example.cafe.orders.entity.CafeTable;
import com.example.cafe.orders.entity.OrderDetail;
import com.example.cafe.orders.entity.Orders;
import com.example.cafe.orders.entity.PaymentMethod;
import com.example.cafe.orders.mapper.OrderMapper;
import com.example.cafe.orders.repository.CafeTableRepository;
import com.example.cafe.orders.repository.OrderRepository;
import com.example.cafe.orders.repository.PaymentMethodRepository;
import com.example.cafe.products.service.ProductService;
import com.example.cafe.products.dto.response.ProductResponse;
import com.example.cafe.products.dto.request.InventoryUpdateRequest;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderService {

    @Inject
    OrderRepository orderRepository;
    
    @Inject
    CafeTableRepository cafeTableRepository;
    
    @Inject
    PaymentMethodRepository paymentMethodRepository;
    
    @Inject
    OrderMapper orderMapper;
    
    @Inject
    ProductService productService;

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
            table.setStatus(1); // Cập nhật bàn thành Bận
        }

        if (request.getPaymentMethodType() != null) {
            PaymentMethod paymentMethod = paymentMethodRepository.findByPaymentMethodType(request.getPaymentMethodType())
                    .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));
            order.setPaymentMethod(paymentMethod);
        }

        List<OrderDetail> details = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest item : request.getItems()) {
            // 1. Lấy thông tin sản phẩm trực tiếp từ ProductService
            ProductResponse product = productService.getProductByName(item.getProductName());

            // 2. Gọi hàm giảm tồn kho trực tiếp
            productService.decrementInventory(product.getProductID(), new InventoryUpdateRequest(item.getQuantity()));

            OrderDetail detail = OrderDetail.builder()
                    .order(order)
                    .productId(product.getProductID())
                    .productName(product.getProductName())
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

        orderRepository.persist(order);
        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(String orderId, OrderStatusUpdateRequest request) {
        Orders order = orderRepository.findByIdOptional(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        String normalizedStatus = request.getStatus() == null ? null : request.getStatus().trim().toUpperCase();

        if (!"OPEN".equals(normalizedStatus) && !"CLOSE".equals(normalizedStatus)) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        order.setStatus(normalizedStatus);

        CafeTable table = order.getTable();
        if (table != null) {
            if ("CLOSE".equals(normalizedStatus)) {
                table.setStatus(0);
            } else if ("OPEN".equals(normalizedStatus)) {
                table.setStatus(1);
            }
        }

        return orderMapper.toOrderResponse(order);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.listAll().stream()
                .map(orderMapper::toOrderResponse)
                .collect(Collectors.toList());
    }

    public DailyOrderStatsResponse getDailyStats(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime startOfNextDay = targetDate.plusDays(1).atStartOfDay();

        BigDecimal totalAmount = orderRepository.sumTotalAmountByOrderDateBetweenAndStatus(startOfDay, startOfNextDay, "CLOSE");
        long orderCount = orderRepository.countByOrderDateBetweenAndStatus(startOfDay, startOfNextDay, "CLOSE");

        return DailyOrderStatsResponse.builder()
                .date(targetDate)
                .totalAmount(totalAmount)
                .orderCount(orderCount)
                .build();
    }

    public List<PaymentMethod> getAllPaymentMethods() {
        return paymentMethodRepository.listAll();
    }

    public List<TopProductResponse> getTopSellingProducts(int limit) {
        return orderRepository.findTopSellingProducts(limit);
    }

    public BigDecimal getRevenueBetween(LocalDate startDate, LocalDate endDate, String status) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();
        return orderRepository.sumTotalAmountByOrderDateBetweenAndStatus(start, end, status);
    }

    @Transactional
    public OrderResponse addItem(String orderId, OrderItemRequest request) {
        Orders order = orderRepository.findByIdOptional(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if ("CLOSE".equalsIgnoreCase(order.getStatus())) {
            throw new AppException(ErrorCode.ORDER_ALREADY_CLOSED);
        }

        ProductResponse product = productService.getProductByName(request.getProductName());
        productService.decrementInventory(product.getProductID(), new InventoryUpdateRequest(request.getQuantity()));

        OrderDetail existingDetail = order.getOrderDetails().stream()
                .filter(d -> d.getProductId().equals(product.getProductID()))
                .findFirst()
                .orElse(null);

        if (existingDetail != null) {
            existingDetail.setQuantity(existingDetail.getQuantity() + request.getQuantity());
        } else {
            OrderDetail detail = OrderDetail.builder()
                    .order(order)
                    .productId(product.getProductID())
                    .productName(product.getProductName())
                    .quantity(request.getQuantity())
                    .unitPrice(product.getPrice())
                    .notes(request.getNotes())
                    .build();
            order.getOrderDetails().add(detail);
        }

        order.setTotalAmount(recalculateTotal(order));
        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    public OrderResponse decreaseItemQuantity(String orderId, OrderItemRequest request) {
        Orders order = orderRepository.findByIdOptional(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if ("CLOSE".equalsIgnoreCase(order.getStatus())) {
            throw new AppException(ErrorCode.ORDER_ALREADY_CLOSED);
        }

        ProductResponse product = productService.getProductByName(request.getProductName());

        OrderDetail targetDetail = order.getOrderDetails().stream()
                .filter(d -> d.getProductId().equals(product.getProductID()))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_ITEM_NOT_FOUND));

        int removeQuantity = Math.min(request.getQuantity(), targetDetail.getQuantity());
        productService.incrementInventory(product.getProductID(), new InventoryUpdateRequest(removeQuantity));

        targetDetail.setQuantity(targetDetail.getQuantity() - removeQuantity);
        if (targetDetail.getQuantity() <= 0) {
            order.getOrderDetails().remove(targetDetail);
        }

        order.setTotalAmount(recalculateTotal(order));
        return orderMapper.toOrderResponse(order);
    }

    private BigDecimal recalculateTotal(Orders order) {
        return order.getOrderDetails().stream()
                .map(detail -> detail.getUnitPrice().multiply(BigDecimal.valueOf(detail.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
