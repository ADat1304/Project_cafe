package com.example.cafe.common.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    PASSWORD_INVALID(1003,"Password must be at least 8 charactor"),
    INVALID_KEY(1002,"invalid key"),
    USER_EXISTED(1001, "user existed"),
    USER_NOT_EXISTED(1004, "user not existed"),
    UNAUTHENTICATED(1005, "Unauthenticated"),
    PRODUCT_EXISTED(1006,"product existed"),
    PRODUCT_NOT_FOUND(1007, "product not found"),
    PRODUCT_OUT_OF_STOCK(1008, "product does not have enough quantity"),
    ORDER_ITEMS_EMPTY(1009, "Order items cannot be empty"),
    TABLE_NOT_FOUND(1010, "Table not found"),
    PAYMENT_METHOD_NOT_FOUND(1011, "Payment method not found"),
    ORDER_NOT_FOUND(1012, "Order not found"),
    ORDER_STATUS_INVALID(1013, "Order status is invalid"),
    ORDER_ALREADY_CLOSED(1014, "Order is already closed"),
    ORDER_ITEM_NOT_FOUND(1015, "Order item not found");

    private final int code;
    private final String messenger;

    ErrorCode(int code, String messenger) {
        this.code = code;
        this.messenger = messenger;
    }
}
