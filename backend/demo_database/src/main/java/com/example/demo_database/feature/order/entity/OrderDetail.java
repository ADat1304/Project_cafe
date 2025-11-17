package com.example.demo_database.feature.order.entity;


import com.example.demo_database.feature.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Table(name = "OrderDetails")
@IdClass(OrderDetailId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDetail {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "productID", referencedColumnName = "productID", foreignKey = @ForeignKey(name = "fk_order_detail_product"))
    Product product;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderID", referencedColumnName = "orderID", foreignKey = @ForeignKey(name = "fk_order_detail_order"))
    Orders order;

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Column(name = "unitPrice", nullable = false, precision = 10, scale = 2)
    BigDecimal unitPrice;

    @Column(name = "notes", length = 255)
    String notes;
}