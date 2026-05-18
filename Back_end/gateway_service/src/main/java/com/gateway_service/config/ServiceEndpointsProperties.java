package com.gateway_service.config;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import lombok.Getter;
import lombok.Setter;
import jakarta.inject.Inject;

@Getter
@Setter
@ApplicationScoped
public class ServiceEndpointsProperties {
    @Inject
    @ConfigProperty(name = "quarkus.rest-client.user-client.url")
    String user;

    @Inject
    @ConfigProperty(name = "quarkus.rest-client.product-client.url")
    String product;

    @Inject
    @ConfigProperty(name = "quarkus.rest-client.order-client.url")
    String order;
}