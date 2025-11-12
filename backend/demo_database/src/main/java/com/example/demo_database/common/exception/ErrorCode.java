package com.example.demo_database.common.exception;

public enum ErrorCode {
    PASSWORD_INVALID(1003,"Password must be at least 8 charactor"),
    INVALID_KEY(1002,"invalid key"),
    USER_EXISTED(1001, "user existed"),
    USER_NOT_EXISTED(1004, "user not existed"),
    UNAUTHENTICATED(1005, "Unauthenticated"),
    PRODUCT_EXISTED(1006,"product existed");

    private int code;
    private String messenger;

    ErrorCode(int code, String messenger) {
        this.code = code;
        this.messenger = messenger;
    }

    public int getCode() {
        return code;
    }

    public String getMessenger() {
        return messenger;
    }
}
