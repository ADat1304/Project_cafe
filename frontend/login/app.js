// Cấu hình API: để cùng domain với Spring Boot nếu dùng static/resources.
const API_BASE = "http://localhost:8080/api";

// Form và phần tử giao diện
const form = document.getElementById("login-form");
const u = document.getElementById("username");
const p = document.getElementById("password");
const userErr = document.getElementById("user-err");
const passErr = document.getElementById("pass-err");
const togglePass = document.getElementById("toggle-pass");
const forgotLink = document.getElementById("forgot-link");
const toastArea = document.querySelector(".toast-area");

// Toggle password, ẩn hiện password
if (togglePass) {
  togglePass.addEventListener("click", () => {
    const t = p.getAttribute("type") === "password" ? "text" : "password";
    p.setAttribute("type", t);
    togglePass.textContent = t === "password" ? "Hiện" : "Ẩn";
  });
}

// Popup "Quên mật khẩu?"
if (forgotLink) {
  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    showForgotToast();
  });
}

function showForgotToast() {
  const tpl = document.getElementById("forgot-toast");
  const node = tpl.content.firstElementChild.cloneNode(true);
  node
    .querySelector(".toast-close")
    .addEventListener("click", () => node.remove());
  node
    .querySelector('[data-action="ok"]')
    .addEventListener("click", () => node.remove());
  // Nếu đã có toast cũ, bỏ đi để tránh chồng
  toastArea.querySelectorAll(".toast").forEach((t) => t.remove());
  toastArea.appendChild(node);
}

// Validate cơ bản & gọi API đăng nhập
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  userErr.textContent = "";
  passErr.textContent = "";
  const username = u.value.trim();
  const password = p.value;

  let ok = true;
  if (!username) {
    userErr.textContent = "Vui lòng nhập tên đăng nhập";
    ok = false;
  }
  if (!password) {
    passErr.textContent = "Vui lòng nhập mật khẩu";
    ok = false;
  }
  if (!ok) return;

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      passErr.textContent = "Tài khoản hoặc mật khẩu không đúng";
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        username: data.username,
        fullName: data.fullName,
        roles: data.roles,
      })
    );

    // Chuyển hướng vào hệ thống (tùy bạn):
    window.location.href = "dashboard.html"; // hoặc route khác
  } catch (err) {
    passErr.textContent = "Không thể kết nối máy chủ";
  }
});
