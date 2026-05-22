// Khởi tạo mảng người dùng rỗng (chỉ lưu dữ liệu khi người dùng đăng ký thực tế)
if (!localStorage.getItem("users")) {
  localStorage.setItem("users", JSON.stringify([]));
}

// Danh sách phòng trọ mẫu quanh ĐH Tây Nguyên để hiển thị lên trang chủ
const duLieuPhongTroMau = [
  {
    id: 101,
    title: "Phòng trọ cao cấp gần ĐH Bách Khoa",
    address: "268 Lý Thường Kiệt, P.14, Q.10",
    street: "Lê Duẩn",
    price: 3500000,
    deposit: 3500000,
    area: 25,
    rating: 4.5,
    tag: "Còn 2 phòng",
    amenities: ["wifi", "gac_lung"],
    lat: 12.6512, 
    lng: 108.0583,
    landlordId: 1
  },
  {
    id: 102,
    title: "Phòng trọ sinh viên giá rẻ",
    address: "123 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức",
    street: "Y Wang",
    price: 2000000,
    deposit: 1000000,
    area: 18,
    rating: 4.0,
    tag: "Còn 5 phòng",
    amenities: ["wifi"],
    lat: 12.6530, 
    lng: 108.0595,
    landlordId: 1
  },
  {
    id: 103,
    title: "Căn hộ mini full nội thất",
    address: "45 Nguyễn Thị Minh Khai, Q.1",
    street: "Nguyễn An Ninh",
    price: 5000000,
    deposit: 5000000,
    area: 35,
    rating: 4.8,
    tag: "Còn 1 phòng",
    amenities: ["wifi", "may_giat", "gac_lung"],
    lat: 12.6495, 
    lng: 108.0560,
    landlordId: 1
  }
];

// Nạp phòng trọ mẫu vào localStorage nếu chưa có
if (!localStorage.getItem("rooms")) {
  localStorage.setItem("rooms", JSON.stringify(duLieuPhongTroMau));
}