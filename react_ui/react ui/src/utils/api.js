import { getAuth } from "./auth.js";

const GATEWAY_BASE_URL = (import.meta.env.VITE_GATEWAY_URL || "http://localhost:8080").replace(/\/$/, "");

const buildUrl = (path) => `${GATEWAY_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

const parseResult = (payload) =>
    payload && typeof payload === "object" && Object.prototype.hasOwnProperty.call(payload, "result")
        ? payload.result
        : payload;

async function requestGateway(path, { method = "GET", body, token, headers } = {}) {
    const authToken = token || getAuth()?.token;

    const config = {
        method,
        headers: {
            Accept: "application/json",
            ...headers,
        },
    };

    if (body !== undefined) {
        config.body = JSON.stringify(body);
        config.headers["Content-Type"] = "application/json";
    }

    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(buildUrl(path), config);
    let payload = null;

    try {
        payload = await response.json();
    } catch (error) {
        payload = null;
    }

    if (!response.ok) {
        const message = payload?.message || `Request failed with status ${response.status}`;
        const err = new Error(message);
        err.status = response.status;
        err.payload = payload;
        throw err;
    }

    return parseResult(payload);
}

// ===== Authentication =====
export const authenticate = (credentials) =>
    requestGateway("/auth/token", { method: "POST", body: credentials });

export const introspectToken = (token) =>
    requestGateway("/auth/introspect", { method: "POST", body: { token } });

// ===== Users =====
export const createUser = (data, token) =>
    requestGateway("/users", { method: "POST", body: data, token });

export const fetchUsers = (token) => requestGateway("/users", { token });

export const fetchUserById = (userId, token) => requestGateway(`/users/${userId}`, { token });

export const updateUser = (userId, data, token) =>
    requestGateway(`/users/${userId}`, { method: "PUT", body: data, token });

export const deleteUser = (userId, token) =>
    requestGateway(`/users/${userId}`, { method: "DELETE", token });

// ===== Products =====
export const createProduct = (data, token) =>
    requestGateway("/products", { method: "POST", body: data, token });

export const fetchProducts = (token) => requestGateway("/products", { token });

export const fetchProductByName = (name, token) =>
    requestGateway(`/products/name/${encodeURIComponent(name)}`, { token });

export const decrementProductInventory = (productId, data, token) =>
    requestGateway(`/products/${productId}/inventory/decrease`, {
        method: "POST",
        body: data,
        token,
    });

// ===== Tables =====
export const fetchTables = (token) => requestGateway("/tables", { token });
export const updateTableStatus = (tableNumber, status, token) =>
    requestGateway(`/tables/${encodeURIComponent(tableNumber)}/status`, {
        method: "PATCH",
        body: { status },
        token,
    });
// ===== Orders =====
export const createOrder = (data, token) =>
    requestGateway("/orders", { method: "POST", body: data, token });

export const fetchOrders = (token) => requestGateway("/orders", { token });
export const updateOrderStatus = (orderId, status, token) =>
    requestGateway(`/orders/${orderId}/status`, { method: "PATCH", body: { status }, token });


export { GATEWAY_BASE_URL, requestGateway };
