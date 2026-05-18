package com.gateway_service.dto.product;

public class InventoryUpdateRequest {

    private Integer quantity;

    public InventoryUpdateRequest() {}

    public InventoryUpdateRequest(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public static InventoryUpdateRequestBuilder builder() {
        return new InventoryUpdateRequestBuilder();
    }

    public static class InventoryUpdateRequestBuilder {
        private Integer quantity;

        public InventoryUpdateRequestBuilder quantity(Integer quantity) {
            this.quantity = quantity;
            return this;
        }

        public InventoryUpdateRequest build() {
            return new InventoryUpdateRequest(quantity);
        }
    }
}