package com.gateway_service.config;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Collections;

@ApplicationScoped
public class RateLimitProperties {
    @Inject
    @ConfigProperty(name = "security.rate-limit.capacity", defaultValue = "100")
    int capacity;

    @Inject
    @ConfigProperty(name = "security.rate-limit.refill-tokens", defaultValue = "50")
    int refillTokens;

    @Inject
    @ConfigProperty(name = "security.rate-limit.whitelist", defaultValue = "/actuator/health")
    String whitelist;

    public int getCapacity() {
        return capacity;
    }

    public int getRefillTokens() {
        return refillTokens;
    }

    public java.time.Duration getRefillPeriod() {
        return java.time.Duration.ofSeconds(60);
    }

    public List<String> getWhitelist() {
        return Collections.singletonList(whitelist);
    }
}
