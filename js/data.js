// --- FILE: js/data.js ---
// Khởi tạo users nếu chưa có
if (!localStorage.getItem("users")) {
  localStorage.setItem("users", JSON.stringify([]));
}

// Chỉ tạo mảng rỗng nếu chưa có key "rooms"
if (!localStorage.getItem("rooms")) {
  localStorage.setItem("rooms", JSON.stringify([]));
}s