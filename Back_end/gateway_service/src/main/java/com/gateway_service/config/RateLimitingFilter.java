package com.gateway_service.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.ext.Provider;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.inject.Inject;
import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Provider
@Priority(Priorities.USER)
public class RateLimitingFilter implements ContainerRequestFilter {

    @Inject
    RateLimitProperties properties;

    private final Map<String, Bucket> ipBuckets = new ConcurrentHashMap<>();

    @Override
    public void filter(ContainerRequestContext requestContext) {
        UriInfo uriInfo = requestContext.getUriInfo();
        String path = uriInfo.getPath();

        if (properties.getWhitelist().stream().anyMatch(pattern -> path.contains(pattern))) {
            return;
        }

        String clientIp = extractClientIp(requestContext);
        Bucket bucket = ipBuckets.computeIfAbsent(clientIp, this::newBucket);

        if (!bucket.tryConsume(1)) {
            requestContext.abortWith(
                Response.status(429) // TOO_MANY_REQUESTS
                    .type("application/json")
                    .entity("{\"message\":\"Too many requests - please slow down.\"}")
                    .build()
            );
        }
    }

    private Bucket newBucket(String ignoredKey) {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(
                        properties.getCapacity(),
                        Refill.intervally(properties.getRefillTokens(), Duration.ofSeconds(60))
                ))
                .build();
    }

    private String extractClientIp(ContainerRequestContext requestContext) {
        String xff = requestContext.getHeaderString("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return "unknown-ip";
    }
}
