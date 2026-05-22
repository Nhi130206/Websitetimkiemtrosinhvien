// =========================================================================
// BẢO HIỂM CHẠY TRƯỚC: Ép ẩn khung đăng ký ngay khi vừa dựng xong khung HTML
// =========================================================================
document.addEventListener("DOMContentLoaded", function() {
  const khungDangKy = document.getElementById("khung-dang-ky");
  if (khungDangKy) {
    khungDangKy.style.display = "none";
  }
});

// =========================================================================
// TOÀN BỘ LOGIC HOẠT ĐỘNG CHÍNH CỦA WEBSITE
// =========================================================================
$(document).ready(function() {

  // Lấy dữ liệu phòng trọ dùng chung từ localStorage
  const danhSachPhong = JSON.parse(localStorage.getItem("rooms")) || [];

  // Tự động kiểm tra trạng thái đăng nhập để cập nhật Icon người dùng ở Header
  capNhatTrangThaiHeader();


  // ==================== KHU VỰC 1: XỬ LÝ TRANG CHỦ (index.html) ====================
  if ($('#danh-sach-tro').length > 0) {
    hienThiDanhSachPhong(danhSachPhong.slice(0, 3), '#danh-sach-tro');
  }

  $('#btn-tim').on('click', function() {
    const duongDaChon = $('#chon-duong').val();
    sessionStorage.setItem("duongChuyenTiep", duongDaChon);
    window.location.href = "tim-kiem.html";
  });


  // ==================== KHU VỰC 2: XỬ LÝ TRANG BỘ LỌC TÌM KIẾM (tim-kiem.html) ====================
  if ($('#danh-sach-tim-kiem').length > 0) {
    
    const duongTuTrangChu = sessionStorage.getItem("duongChuyenTiep");
    if (duongTuTrangChu) {
      $('#chon-duong').val(duongTuTrangChu);
      sessionStorage.removeItem("duongChuyenTiep");
    }

    thucHienLocPhong();

    $('#chon-duong, #loc-gia-thap, #loc-gia-cao, #sap-xep').on('change keyup', thucHienLocPhong);
    $('.loc-loai-phong, .loc-tien-ich').on('change', thucHienLocPhong);

    $('#nut-dat-lai').on('click', function() {
      $('#chon-duong').val('all');
      $('#loc-gia-thap').val('0');
      $('#loc-gia-cao').val('10000000');
      $('.loc-loai-phong').prop('checked', false);
      $('.loc-tien-ich').prop('checked', false);
      $('#sap-xep').val('mac-dinh');
      thucHienLocPhong();
    });
  }


  // ==================== KHU VỰC 3: XỬ LÝ TRANG BẢN ĐỒ (ban-do.html) ====================
  if ($('#ban-do-chinh').length > 0) {
    let banDo;
    let danhSachGhim = [];

    banDo = L.map('ban-do-chinh').setView([12.6515, 108.0581], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(banDo);

    function capNhatGhimBanDo(danhSachLoc) {
      danhSachGhim.forEach(ghim => banDo.removeLayer(ghim));
      danhSachGhim = [];

      danhSachLoc.forEach(phong => {
        const ghim = L.marker([phong.lat, phong.lng]).addTo(banDo);
        
        ghim.bindPopup(`
          <div class="popup-ban-do">
            <strong class="popup-ban-do__tieu-de">${phong.title}</strong><br>
            Giá: <span class="popup-ban-do__gia">${phong.price.toLocaleString()}đ</span><br>
            Đường: ${phong.street}
          </div>
        `);

        ghim.on('click', function() {
          hienThiThePhongChon(phong);
        });

        danhSachGhim.push(ghim);
      });

      $('#so-luong-ban-do').text(danhSachLoc.length);
    }

    function hienThiThePhongChon(phong) {
      const theChiTiet = $('#the-phong-chon');
      const noiDung = $('#noi-dung-phong-chon');

      noiDung.html(`
        <div class="the-phong-chon__khung">
          <span class="the-phong-chon__nhan">${phong.tag}</span>
          <h4 class="the-phong-chon__tieu-de">${phong.title}</h4>
          <p class="the-phong-chon__dia-chi">📍 ${phong.address}</p>
          <p class="the-phong-chon__thong-so">📐 Diện tích: <strong>${phong.area} m²</strong></p>
          <div class="the-phong-chon__dong-gia">
            <span>Giá thuê:</span>
            <strong class="the-phong-chon__gia">${phong.price.toLocaleString()}đ/tháng</strong>
          </div>
          <a href="chi-tiet.html?id=${phong.id}" class="the-phong-chon__link">Xem chi tiết</a>
        </div>
      `);

      theChiTiet.fadeIn(200);
    }

    $('#nut-dong-the').on('click', function() {
      $('#the-phong-chon').fadeOut(200);
    });

    function thucHienLocBanDo() {
      const duongLoc = $('#loc-duong-ban-do').val();
      let danhSachSauLoc = danhSachPhong;

      if (duongLoc !== 'all') {
        danhSachSauLoc = danhSachPhong.filter(p => p.street === duongLoc);
      }

      capNhatGhimBanDo(danhSachSauLoc);
      $('#the-phong-chon').fadeOut(100);
    }

    $('#loc-duong-ban-do').on('change', thucHienLocBanDo);
    capNhatGhimBanDo(danhSachPhong);
  }


  // ==================== KHU VỰC 4: XỬ LÝ TRANG ĐĂNG TIN NHIỀU BƯỚC (dang-tin.html) ====================
  if ($('#form-dang-tin').length > 0) {
    
    $('#nut-tiep-1').on('click', function() {
      const tieuDe = $('#dang-tieu-de').val().trim();
      const diaChi = $('#dang-dia-chi').val().trim();
      const dienTich = $('#dang-dien-tich').val().trim();

      if (tieuDe === "" || diaChi === "" || dienTich === "") {
        alert("Vui lòng điền đầy đủ các trường thông tin có dấu *");
        return;
      }

      $('#khung-buoc-1').addClass('an');
      $('#khung-buoc-2').removeClass('an');

      $('#vong-1').addClass('completed').removeClass('active');
      $('#duong-1').addClass('active');
      $('#vong-2').addClass('active');
    });

    $('#nut-quay-1').on('click', function() {
      $('#khung-buoc-2').addClass('an');
      $('#khung-buoc-1').removeClass('an');

      $('#vong-2').removeClass('active');
      $('#duong-1').removeClass('active');
      $('#vong-1').removeClass('completed').addClass('active');
    });

    $('#nut-tiep-2').on('click', function() {
      const gia = $('#dang-gia').val().trim();
      const coc = $('#dang-coc').val().trim();

      if (gia === "" || coc === "") {
        alert("Vui lòng nhập đầy đủ giá thuê và tiền cọc *");
        return;
      }

      $('#khung-buoc-2').addClass('an');
      $('#khung-buoc-3').removeClass('an');

      $('#vong-2').addClass('completed').removeClass('active');
      $('#duong-2').addClass('active');
      $('#vong-3').addClass('active');
    });

    $('#nut-quay-2').on('click', function() {
      $('#khung-buoc-3').addClass('an');
      $('#khung-buoc-2').removeClass('an');

      $('#vong-3').removeClass('active');
      $('#duong-2').removeClass('active');
      $('#vong-2').removeClass('completed').addClass('active');
    });

    $('#nut-hoan-tat').on('click', function() {
      const soLuongPhong = $('#dang-so-luong').val().trim();

      if (soLuongPhong === "") {
        alert("Vui lòng điền số lượng phòng còn trống *");
        return;
      }

      const tienIchDaChon = $('.tien-ich-dang:checked').map(function() {
        return $(this).val();
      }).get();

      const offsetLat = (Math.random() - 0.5) * 0.01;
      const offsetLng = (Math.random() - 0.5) * 0.01;
      const latMoi = 12.6515 + offsetLat;
      const lngMoi = 108.0581 + offsetLng;

      const danhSachPhongHienTai = JSON.parse(localStorage.getItem("rooms")) || [];

      const phongTroMoi = {
        id: Date.now(),
        title: $('#dang-tieu-de').val().trim(),
        address: $('#dang-dia-chi').val().trim(),
        street: $('#dang-duong').val(),
        price: parseInt($('#dang-gia').val()),
        deposit: parseInt($('#dang-coc').val()),
        area: parseInt($('#dang-dien-tich').val()),
        rating: 5.0,
        tag: `Còn ${soLuongPhong} phòng`,
        amenities: tienIchDaChon,
        lat: latMoi,
        lng: lngMoi,
        landlordId: Date.now() + 1
      };

      danhSachPhongHienTai.push(phongTroMoi);
      localStorage.setItem("rooms", JSON.stringify(danhSachPhongHienTai));

      alert("Chúc mừng! Bạn đã đăng tin phòng trọ thành công.");
      window.location.href = "tim-kiem.html";
    });
  }

  // ==================== KHU VỰC 5: XỬ LÝ ĐĂNG NHẬP & ĐĂNG KÝ (dang-nhap.html) ====================
  if ($('#khung-dang-nhap').length > 0) {
    
    $('#khung-dang-ky').hide();
    $('#khung-dang-nhap').show();

    $('#link-sang-dang-ky').on('click', function(e) {
      e.preventDefault();
      $('#khung-dang-nhap').hide();
      $('#khung-dang-ky').fadeIn(200);
    });

    $('#link-sang-dang-nhap').on('click', function(e) {
      e.preventDefault();
      $('#khung-dang-ky').hide();
      $('#khung-dang-nhap').fadeIn(200);
    });

    $('#form-dang-ky-truc-tiep').on('submit', function(e) {
      e.preventDefault();

      const ten = $('#ky-ten').val().trim();
      const email = $('#ky-email').val().trim();
      const soDt = $('#ky-sodt').val().trim();
      const matKhau = $('#ky-mat-khau').val().trim();
      const vaiTro = $('#ky-vai-tro').val();

      const danhSachUser = JSON.parse(localStorage.getItem("users")) || [];

      const checkTrung = danhSachUser.find(u => u.email === email);
      if (checkTrung) {
        alert("Email này đã được sử dụng! Vui lòng chọn email khác.");
        return;
      }

      const userMoi = {
        id: Date.now(),
        name: ten,
        email: email,
        phone: soDt,
        password: matKhau,
        role: vaiTro
      };

      danhSachUser.push(userMoi);
      localStorage.setItem("users", JSON.stringify(danhSachUser));

      alert("Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.");
      
      $('#form-dang-ky-truc-tiep')[0].reset();
      $('#link-sang-dang-nhap').click();
    });

    $('#form-dang-nhap-truc-tiep').on('submit', function(e) {
      e.preventDefault();

      const email = $('#nhap-email').val().trim();
      const matKhau = $('#nhap-mat-khau').val().trim();

      const danhSachUser = JSON.parse(localStorage.getItem("users")) || [];

      const matchedUser = danhSachUser.find(u => u.email === email && u.password === matKhau);

      if (matchedUser) {
        alert("Đăng nhập thành công!");
        sessionStorage.setItem("currentUser", JSON.stringify(matchedUser));
        window.location.href = "index.html";
      } else {
        alert("Sai tài khoản hoặc mật khẩu! Vui lòng thử lại.");
      }
    });
  }


  // ==================== KHU VỰC 6: CÁC HÀM TRỢ GIÚP DÙNG CHUNG (LỌC PHÒNG & RENDER PHÒNG) ====================

  function thucHienLocPhong() {
    const duongLoc = $('#chon-duong').val();
    const giaThap = parseInt($('#loc-gia-thap').val()) || 0;
    const giaCao = parseInt($('#loc-gia-cao').val()) || 99999999;
    const sapXep = $('#sap-xep').val();

    const loaiPhongDaChon = $('.loc-loai-phong:checked').map(function() {
      return $(this).val();
    }).get();

    const tienIchDaChon = $('.loc-tien-ich:checked').map(function() {
      return $(this).val();
    }).get();

    let danhSachSauLoc = danhSachPhong.filter(phong => {
      if (duongLoc !== 'all' && phong.street !== duongLoc) return false;
      if (phong.price < giaThap || phong.price > giaCao) return false;
      if (loaiPhongDaChon.length > 0 && !loaiPhongDaChon.includes(phong.type)) return false;

      if (tienIchDaChon.length > 0) {
        const checkTienIch = tienIchDaChon.every(ti => phong.amenities.includes(ti));
        if (!checkTienIch) return false;
      }

      return true;
    });

    if (sapXep === 'gia-tang') {
      danhSachSauLoc.sort((a, b) => a.price - b.price);
    } else if (sapXep === 'gia-giam') {
      danhSachSauLoc.sort((a, b) => b.price - a.price);
    }

    hienThiDanhSachPhong(danhSachSauLoc, '#danh-sach-tim-kiem');
    $('#so-luong-phong').text(`Tìm thấy ${danhSachSauLoc.length} phòng trọ`);
  }

  // Hàm tạo thẻ HTML và hiển thị danh sách phòng trọ nổi bật chuẩn giao diện
  function hienThiDanhSachPhong(danhSach, idTheChua) {
    const theChua = $(idTheChua);
    theChua.empty();

    if (danhSach.length === 0) {
      theChua.html('<p class="thong-bao-trong">Không tìm thấy phòng trọ nào phù hợp.</p>');
      return;
    }

    danhSach.forEach(phong => {
      // ĐÃ CẬP NHẬT: Thay thế thẻ <div> ngoài cùng thành thẻ liên kết <a> truyền ID động
      const thePhongHTML = `
        <a href="chi-tiet.html?id=${phong.id}" class="card-phong">
          <div class="card-phong__khung-anh">
            <div class="card-phong__nhan">${phong.tag}</div>
            <div class="room-image-placeholder">Ảnh phòng trọ mẫu</div>
          </div>
          <div class="card-phong__noi-dung">
            <div class="card-phong__dong-dau">
              <h3 class="card-phong__tieu-de">${phong.title}</h3>
              <span class="card-phong__danh-gia">★ ${phong.rating}</span>
            </div>
            <p class="card-phong__dia-chi">📍 ${phong.address}</p>
            <div class="card-phong__thong-so">
              <span>📐 ${phong.area} m²</span>
              <span>🚪 Phòng đơn</span>
            </div>
            <hr class="card-phong__vach-ngan">
            <div class="card-phong__dong-gia">
              <span class="card-phong__nhan-gia">Giá thuê:</span>
              <strong class="card-phong__gia">${phong.price.toLocaleString()}đ</strong>
            </div>
          </div>
        </a>
      `;
      theChua.append(thePhongHTML);
    });
  }

  // HÀM ĐỒNG BỘ HIỂN THỊ ICON NGƯỜI DÙNG KHI ĐĂNG NHẬP THÀNH CÔNG (ĐÃ CẬP NHẬT)
  function capNhatTrangThaiHeader() {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    const vungHanhDong = $('#vung-hanh-dong');

    if (currentUser) {
      let menuHanhDongHTML = '';

      if (currentUser.role === 'landlord') {
        menuHanhDongHTML += `<a href="dang-tin.html" class="btn btn--landlord">Đăng tin trọ</a>`;
      }
      
      // Sử dụng cấu trúc class .user-profile-header đã định nghĩa ở layout.css
      menuHanhDongHTML += `
        <div class="user-profile-header">
          <span class="user-avatar-text">👤 ${currentUser.name}</span>
          <button id="nut-dang-xuat" class="btn btn--landlord nut-dang-xuat-header">Đăng xuất</button>
        </div>
      `;

      vungHanhDong.html(menuHanhDongHTML);

      // Sự kiện Đăng xuất
      $('#nut-dang-xuat').on('click', function() {
        if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
          sessionStorage.removeItem("currentUser");
          window.location.href = "index.html";
        }
      });
    }
  }

});
// =========================================================================
// KHU VỰC 7: XỬ LÝ TRANG CHI TIẾT PHÒNG TRỌ (chi-tiet.html) 
// =========================================================================
if ($('#chi-tiet-trang').length > 0) {
  
  // 1. Hàm bóc tách ID phòng trọ từ URL
  function layThamSoIdURL(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get(name));
  }

  const idPhong = layThamSoIdURL('id');
  const danhSachPhongTuStorage = JSON.parse(localStorage.getItem("rooms")) || [];
  const phongChiTiet = danhSachPhongTuStorage.find(p => p.id === idPhong);

  if (!phongChiTiet) {
    alert('Không tìm thấy phòng trọ này! Quay lại trang tìm kiếm.');
    window.location.href = 'tim-kiem.html';
  } else {
    napGiaoDienChiTiet(phongChiTiet);
  }

  // 2. Hàm kết xuất toàn bộ giao diện chi tiết không chứa CSS inline
  function napGiaoDienChiTiet(phong) {
    
    // Cập nhật đường dẫn Breadcrumb và tiêu đề trình duyệt
    $('#duong-dan-tieu-de').text(phong.title);
    document.title = `${phong.title} - NhaTroSV`;

    // A. Render phần Đầu: Tiêu đề, địa chỉ, khoảng cách Đại học Tây Nguyên
    $('#dau-chi-tiet').html(`
      <h1 class="tieu-de-chi-tiet">${phong.title}</h1>
      <div class="thong-tin-phu-chi-tiet">
        <div>📍 ${phong.address}</div>
        <div>🏫 Ea Tam, cách Đại học Tây Nguyên 0.5 km</div>
        <div style="color: #fbbf24;">★ ${phong.rating} (24 đánh giá)</div>
      </div>
      <span class="the-phong-chon__nhan">${phong.tag}</span>
    `);

    // B. Render Ảnh phòng trọ mẫu
    $('#khung-anh-phong').html(`<div class="room-image-placeholder">Ảnh phòng trọ minh họa</div>`);

    // C. Render Lưới 3 thông số phụ nhanh
    $('#luoi-thong-tin-phu').html(`
      <div class="hop-thong-tin-phu">
        <div class="nhan-thong-tin-phu">📐 Diện tích</div>
        <div class="gia-tri-thong-tin-phu">${phong.area} m²</div>
      </div>
      <div class="hop-thong-tin-phu">
        <div class="nhan-thong-tin-phu">🚪 Loại phòng</div>
        <div class="gia-tri-thong-tin-phu">${phong.type === 'single' ? 'Đơn' : phong.type === 'double' ? 'Đôi' : 'KTX'}</div>
      </div>
      <div class="hop-thong-tin-phu">
        <div class="nhan-thong-tin-phu">★ Đánh giá</div>
        <div class="gia-tri-thong-tin-phu">${phong.rating}/5</div>
      </div>
    `);

    // D. Bảng kê chi phí chi tiết
    const tienDienUocTinh = 3500 * 100; // Giả định đơn giá 3.5k nhân với 100 kWh điện
    const tongUocTinhThang = phong.price + (phong.deposit / 12) + tienDienUocTinh + 100000 + 100000 + 150000; // Tiền nhà + điện nước internet gửi xe phân bổ

    $('#bang-chi-phi').html(`
      <div class="dong-chi-phi">
        <div class="nhan-chi-phi">📅 Tiền thuê hàng tháng</div>
        <div class="gia-tri-chi-phi gia-tri-chi-phi--noi-bat">${phong.price.toLocaleString()}đ</div>
      </div>
      <div class="dong-chi-phi">
        <div class="nhan-chi-phi">📅 Tiền cọc (1 tháng)</div>
        <div class="gia-tri-chi-phi">${phong.deposit.toLocaleString()}đ</div>
      </div>
      <div class="dong-chi-phi">
        <div class="nhan-chi-phi">⚡ Điện (ước tính 100 kWh)</div>
        <div class="gia-tri-chi-phi">${tienDienUocTinh.toLocaleString()}đ</div>
      </div>
      <div class="dong-chi-phi">
        <div class="nhan-chi-phi">💧 Nước định mức</div>
        <div class="gia-tri-chi-phi">100.000đ</div>
      </div>
      <div class="dong-chi-phi">
        <div class="nhan-chi-phi">📶 Wifi tốc độ cao</div>
        <div class="gia-tri-chi-phi">100.000đ</div>
      </div>
      <div class="dong-chi-phi">
        <div class="nhan-chi-phi">🏍️ Gửi xe máy</div>
        <div class="gia-tri-chi-phi">150.000đ</div>
      </div>
      <div class="dong-chi-phi" style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 10px;">
        <div class="nhan-chi-phi" style="font-weight: 700; font-size: 16px;">Tổng ước tính/tháng</div>
        <div class="gia-tri-chi-phi gia-tri-chi-phi--noi-bat" style="font-size: 22px;">${tongUocTinhThang.toLocaleString()}đ</div>
      </div>
    `);

    // E. Render danh sách tiện ích
    const checkWifi = phong.amenities.includes('wifi') ? '✔️ Wifi miễn phí' : '❌ Không có Wifi';
    const checkGac = phong.amenities.includes('gac_lung') ? '✔️ Có gác lửng' : '❌ Không gác lửng';
    const checkMayGiat = phong.amenities.includes('may_giat') ? '✔️ Có máy giặt chung' : '❌ Không máy giặt';

    $('#danh-sach-tien-ich').html(`
      <div class="muc-tien-ich">${checkWifi}</div>
      <div class="muc-tien-ich">${checkGac}</div>
      <div class="muc-tien-ich">${checkMayGiat}</div>
      <div class="muc-tien-ich">✔️ Cửa sổ thoáng mát</div>
    `);

    // F. Render hộp liên hệ bên phải (Contact Card)
    $('#the-lien-he').html(`
      <div class="hop-gia-chinh">
        <div class="gia-chinh">${phong.price.toLocaleString()}đ</div>
        <p>/ tháng</p>
      </div>
      <div class="thong-tin-chu-tro">
        <div class="anh-dai-dien-chu-tro">👤</div>
        <div>
          <div style="font-weight: 700;">Chị Mai (Chủ trọ)</div>
          <div style="font-size: 12px; color: #00c853;">✔️ Đã xác thực thông tin</div>
        </div>
      </div>
      <div class="nhom-nut-lien-he">
        <button class="btn-giao-tiep btn-giao-tiep--phone" onclick="alert('Số điện thoại: 0901234567')">📞 Gọi điện thoại</button>
        <button class="btn-giao-tiep btn-giao-tiep--nhan-tin" onclick="alert('Hộp thư đang được kết nối!')">✉️ Nhắn tin nhanh</button>
        <button class="btn-giao-tiep btn-giao-tiep--dat-lich" onclick="alert('Đã đặt lịch hẹn xem phòng!')">📅 Đặt lịch xem phòng</button>
      </div>
      <div class="hop-luu-y">
        💡 <strong>Lưu ý quan trọng:</strong> Luôn đi xem phòng trực tiếp trước khi giao tiền đặt cọc để tránh bị lừa đảo mạng.
      </div>
    `);

    // G. Khởi tạo bản đồ con định vị phòng
    const mapCon = L.map('ban-do-chi-tiet').setView([phong.lat, phong.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapCon);
    L.marker([phong.lat, phong.lng]).addTo(mapCon).bindPopup(phong.title);
  }
}
// ==================== KHU VỰC 4: XỬ LÝ TRANG ĐĂNG TIN ĐƠN GỘP (ĐÃ ÉP BUỘC TẢI ẢNH) ====================
  if ($('#form-dang-tin').length > 0) {
    
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== 'landlord') {
      alert("Vui lòng đăng nhập tài khoản CHỦ TRỌ để thực hiện chức năng đăng tin!");
      window.location.href = "dang-nhap.html";
      return;
    }

    let hinhAnhBase64 = ""; // Biến lưu chuỗi mã hóa ảnh bắt buộc

    // Trình xử lý đọc tệp tin khi chủ nhà trọ tải file ảnh từ máy
    $('#dang-anh').on('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          hinhAnhBase64 = e.target.result; 
        };
        reader.readAsDataURL(file);
      }
    });

    $('#form-dang-tin').on('submit', function(e) {
      e.preventDefault();

      // KIỂM TRA BẮT BUỘC: Nếu biến chứa ảnh trống, hiện cảnh báo và dừng đăng tin
      if (!hinhAnhBase64) {
        alert("Vui lòng tải lên một hình ảnh thực tế của phòng trọ trước khi đăng tin!");
        return;
      }

      const tieuDe = $('#dang-tieu-de').val().trim();
      const duong = $('#dang-duong').val();
      const diaChi = $('#dang-dia-chi').val().trim();
      const dienTich = parseInt($('#dang-dien-tich').val());
      const loaiPhong = $('#dang-loai-phong').val();
      const gia = parseInt($('#dang-gia').val());
      const coc = parseInt($('#dang-coc').val());
      const soLuongPhong = $('#dang-so-luong').val().trim();

      const tienIchDaChon = $('.tien-ich-dang:checked').map(function() {
        return $(this).val();
      }).get();

      const offsetLat = (Math.random() - 0.5) * 0.01;
      const offsetLng = (Math.random() - 0.5) * 0.01;
      const latMoi = 12.6515 + offsetLat;
      const lngMoi = 108.0581 + offsetLng;

      const danhSachPhongHienTai = JSON.parse(localStorage.getItem("rooms")) || [];

      const phongTroMoi = {
        id: Date.now(),
        title: tieuDe,
        address: diaChi,
        street: duong,
        price: gia,
        deposit: coc,
        area: dienTich,
        type: loaiPhong,
        rating: 5.0,
        tag: `Còn ${soLuongPhong} phòng`,
        amenities: tienIchDaChon,
        image: hinhAnhBase64, // Gắn ảnh Base64 bắt buộc vào đối tượng phòng mới
        lat: latMoi,
        lng: lngMoi,
        landlordId: currentUser.id
      };

      danhSachPhongHienTai.push(phongTroMoi);
      localStorage.setItem("rooms", JSON.stringify(danhSachPhongHienTai));

      alert("Chúc mừng! Bạn đã đăng tin phòng trọ thành công.");
      window.location.href = "tim-kiem.html";
    });
  }