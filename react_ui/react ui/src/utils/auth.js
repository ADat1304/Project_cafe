const STORAGE_KEY = "cafe_auth";

export function saveAuth({ token, user }) {
    if (!token || !user) {
        throw new Error("Token và thông tin người dùng là bắt buộc");
    }

    const payload = {
        token,
        user,
        loginAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return payload;
}

export function getAuth() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.warn("Không thể parse thông tin đăng nhập", error);
        return null;
    }
}

export function clearAuth() {
    localStorage.removeItem(STORAGE_KEY);
}

export function isAuthenticated() {
    const data = getAuth();
    return Boolean(data?.token && data?.user);
}
