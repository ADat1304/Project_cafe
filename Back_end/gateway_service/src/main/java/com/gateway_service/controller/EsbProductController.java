package com.gateway_service.controller;


import com.gateway_service.client.ProductClient;
import com.gateway_service.dto.product.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/esb/products")
@RequiredArgsConstructor
public class EsbProductController {

    private final ProductClient productClient;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> listProducts() {
        return ResponseEntity.ok(productClient.getAllProducts());
    }

    @GetMapping("/{name}")
    public ResponseEntity<ProductResponse> getByName(@PathVariable String name) {
        return ResponseEntity.ok(productClient.getProductByName(name));
    }
}