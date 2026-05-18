package com.gateway_service.dto.table;

import jakarta.validation.constraints.NotNull;

public class TableStatusUpdateRequest {

    @NotNull
    private Integer status;

    public TableStatusUpdateRequest() {}

    public TableStatusUpdateRequest(Integer status) {
        this.status = status;
    }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }

    public static TableStatusUpdateRequestBuilder builder() {
        return new TableStatusUpdateRequestBuilder();
    }

    public static class TableStatusUpdateRequestBuilder {
        private Integer status;

        public TableStatusUpdateRequestBuilder status(Integer status) {
            this.status = status;
            return this;
        }

        public TableStatusUpdateRequest build() {
            return new TableStatusUpdateRequest(status);
        }
    }
}