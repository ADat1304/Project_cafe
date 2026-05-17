package com.example.cafe.orders.mapper;

import com.example.cafe.orders.dto.response.OrderItemResponse;
import com.example.cafe.orders.dto.response.OrderResponse;
import com.example.cafe.orders.entity.CafeTable;
import com.example.cafe.orders.entity.OrderDetail;
import com.example.cafe.orders.entity.Orders;
import com.example.cafe.orders.entity.PaymentMethod;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-16T15:04:33+0700",
    comments = "version: 1.6.0, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Singleton
@Named
public class OrderMapperImpl implements OrderMapper {

    @Override
    public OrderResponse toOrderResponse(Orders order) {
        if ( order == null ) {
            return null;
        }

        OrderResponse.OrderResponseBuilder orderResponse = OrderResponse.builder();

        orderResponse.orderId( order.getOrderID() );
        orderResponse.tableId( orderTableTableID( order ) );
        orderResponse.tableNumber( orderTableTableNumber( order ) );
        orderResponse.paymentMethodId( orderPaymentMethodPaymentMethodID( order ) );
        orderResponse.paymentMethodType( orderPaymentMethodPaymentMethodType( order ) );
        orderResponse.items( mapOrderItems( order.getOrderDetails() ) );
        orderResponse.orderDate( order.getOrderDate() );
        orderResponse.totalAmount( order.getTotalAmount() );
        orderResponse.status( order.getStatus() );

        return orderResponse.build();
    }

    @Override
    public OrderItemResponse toOrderItemResponse(OrderDetail detail) {
        if ( detail == null ) {
            return null;
        }

        OrderItemResponse.OrderItemResponseBuilder orderItemResponse = OrderItemResponse.builder();

        orderItemResponse.productId( detail.getProductId() );
        orderItemResponse.productName( detail.getProductName() );
        orderItemResponse.quantity( detail.getQuantity() );
        orderItemResponse.unitPrice( detail.getUnitPrice() );
        orderItemResponse.notes( detail.getNotes() );

        orderItemResponse.lineTotal( calculateLineTotal(detail) );

        return orderItemResponse.build();
    }

    private String orderTableTableID(Orders orders) {
        CafeTable table = orders.getTable();
        if ( table == null ) {
            return null;
        }
        return table.getTableID();
    }

    private String orderTableTableNumber(Orders orders) {
        CafeTable table = orders.getTable();
        if ( table == null ) {
            return null;
        }
        return table.getTableNumber();
    }

    private String orderPaymentMethodPaymentMethodID(Orders orders) {
        PaymentMethod paymentMethod = orders.getPaymentMethod();
        if ( paymentMethod == null ) {
            return null;
        }
        return paymentMethod.getPaymentMethodID();
    }

    private String orderPaymentMethodPaymentMethodType(Orders orders) {
        PaymentMethod paymentMethod = orders.getPaymentMethod();
        if ( paymentMethod == null ) {
            return null;
        }
        return paymentMethod.getPaymentMethodType();
    }
}
