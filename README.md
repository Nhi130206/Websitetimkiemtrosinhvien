# NhaTroSV - Website Tìm Nhà Trọ Sinh Viên

Website HTML/CSS/JavaScript thuần để tìm kiếm nhà trọ sinh viên.

## Cấu trúc file

```
Websitetimkiemtrosinhvien/
├── index.html          # Trang chủ
├── dang-nhap.html         # Trang tìm kiếm với bộ lọc
├── dang-tin.html            # Trang bản đồ tương tác
├── thong-tin.html    # Trang chi tiết phòng trọ   
├── ban-do.html           
├── chi-tiet.html
├── js
    ├── data.js           
    ├── main.js            # JavaScript chung
├── css  
    ├── layout.css          # CSS chung cho toàn website 
    ├── base.css        
    ├── components.css      
    ├── pages.css        
    ├── main.css       
├── tim-kiem.html
└── README.md           
```

## Công nghệ sử dụng

- **HTML5**: Cấu trúc semantic
- **CSS3**: Flexbox, Grid, gradient, responsive
- **JavaScript**: jQuery cơ bản
- **Leaflet.js**: Bản đồ tương tác
- **Font Awesome**: Icons


## Tính năng

### Trang chủ (index.html)
- Hero section với form tìm kiếm
- Giới thiệu tính năng
- Phòng trọ nổi bật
- Call-to-action cho chủ trọ

### Trang tìm kiếm (search.html)
- Bộ lọc theo giá, loại phòng
- Sắp xếp kết quả
- Hiển thị danh sách phòng dạng grid
- Sidebar filter có thể toggle

### Trang bản đồ (map.html)
- Bản đồ Leaflet tương tác
- Markers cho từng phòng trọ
- Popup hiển thị thông tin nhanh
- Card chi tiết khi click vào marker

### Trang chi tiết (room-detail.html)
- Thông tin đầy đủ về phòng
- Bảng giá chi tiết minh bạch
- Danh sách tiện ích
- Bản đồ vị trí
- Thông tin liên hệ chủ nhà

## Tùy chỉnh

### Thêm phòng trọ mới
Mở file `data.js` và thêm object vào array `rooms`:
thêm p thủ công
```javascript
{
    id: '4',
    title: 'Tên phòng',
    address: 'Địa chỉ',
    price: 3000000,
    // ... các thông tin khác
}
```

### Đổi màu sắc
Tìm và thay đổi trong `style.css`:
- Màu xanh chính: `#2563eb`
- Màu xanh lá: `#10b981`
- Màu xám: `#6b7280`

### Thay đổi bản đồ
Trong các file map.html và room-detail.html, tìm:
```javascript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
```

## Lưu ý

- Website hoàn toàn responsive (desktop + mobile)
- Sử dụng CDN cho jQuery, Font Awesome, Leaflet
- LocalStorage để lưu phòng
- Không cần build tool hay framework phức tạp

