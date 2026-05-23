// Ép ẩn khung đăng ký ngay khi vừa dựng xong khung HTML
document.addEventListener("DOMContentLoaded", function() {
  const khungDangKy = document.getElementById("khung-dang-ky");
  if (khungDangKy) {
    khungDangKy.style.display = "none";
  }
});

$(document).ready(function() {

  // HÀM LẤY DỮ LIỆU PHÒNG TRỌ MỚI NHẤT TỪ LOCALSTORAGE (THAY CHO BIẾN CỐ ĐỊNH)
  function layDanhSachPhong() {
    return JSON.parse(localStorage.getItem("rooms")) || [];
  }

  // Tự động kiểm tra trạng thái đăng nhập để cập nhật Icon người dùng ở Header
  capNhatTrangThaiHeader();

  // ==================== KHU VỰC 1: XỬ LÝ TRANG CHỦ (index.html) ====================
  if ($('#danh-sach-tro').length > 0) {
    let dsPhong = layDanhSachPhong();
    hienThiDanhSachPhong(dsPhong.slice(0), '#danh-sach-tro');
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
      let danhSachPhong = layDanhSachPhong();
      let danhSachSauLoc = duongLoc !== 'all' ? danhSachPhong.filter(p => p.street === duongLoc) : danhSachPhong;
      capNhatGhimBanDo(danhSachSauLoc);
      $('#the-phong-chon').fadeOut(100);
    }

    $('#loc-duong-ban-do').on('change', thucHienLocBanDo);
    capNhatGhimBanDo(layDanhSachPhong());
  }

  // ==================== KHU VỰC 4: XỬ LÝ TRANG ĐĂNG TIN ====================
  if ($('#form-dang-tin').length > 0) {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== 'landlord') {
      alert("Vui lòng đăng nhập tài khoản CHỦ TRỌ để thực hiện chức năng đăng tin!");
      window.location.href = "dang-nhap.html";
      return;
    }
    let hinhAnhBase64 = "";
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
      if (!hinhAnhBase64) {
        alert("Vui lòng tải lên một hình ảnh thực tế của phòng trọ trước khi Đăng tin!");
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
      const tienIchDaChon = $('.tien-ich-dang:checked').map(function() { return $(this).val(); }).get();
      const offsetLat = (Math.random() - 0.5) * 0.01;
      const offsetLng = (Math.random() - 0.5) * 0.01;
      const latMoi = 12.6515 + offsetLat;
      const lngMoi = 108.0581 + offsetLng;
      const danhSachPhongHienTai = layDanhSachPhong();
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
        image: hinhAnhBase64,
        lat: latMoi,
        lng: lngMoi,
        landlordId: currentUser.id,
        createdAt: Date.now()
      };
      danhSachPhongHienTai.push(phongTroMoi);
      localStorage.setItem("rooms", JSON.stringify(danhSachPhongHienTai));
      alert("Chúc mừng! Bạn đã đăng tin phòng trọ thành công.");
      window.location.href = "tim-kiem.html";
    });
  }

  // ==================== KHU VỰC 5: XỬ LÝ ĐĂNG NHẬP & ĐĂNG KÝ ====================
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
      if (!ten || !email || !soDt || !matKhau) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }
      if (matKhau.length < 4) {
        alert("Mật khẩu phải có ít nhất 4 ký tự");
        return;
      }
      let danhSachUser = [];
      try {
        const duLieuGoc = localStorage.getItem("users");
        danhSachUser = duLieuGoc ? JSON.parse(duLieuGoc) : [];
        if (!Array.isArray(danhSachUser)) danhSachUser = [];
      } catch (err) {
        danhSachUser = [];
      }
      if (danhSachUser.find(u => u.email === email)) {
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
      $('#khung-dang-ky').hide();
      $('#khung-dang-nhap').fadeIn(200);
    });
    $('#form-dang-nhap-truc-tiep').on('submit', function(e) {
      e.preventDefault();
      const email = $('#nhap-email').val().trim();
      const matKhau = $('#nhap-mat-khau').val().trim();
      let danhSachUser = [];
      try {
        const duLieuGoc = localStorage.getItem("users");
        danhSachUser = duLieuGoc ? JSON.parse(duLieuGoc) : [];
        if (!Array.isArray(danhSachUser)) danhSachUser = [];
      } catch (err) {
        danhSachUser = [];
      }
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

  // ==================== KHU VỰC 6: HÀM LỌC VÀ HIỂN THỊ ====================
  function thucHienLocPhong() {
    const duongLoc = $('#chon-duong').val();
    const giaThap = parseInt($('#loc-gia-thap').val()) || 0;
    const giaCao = parseInt($('#loc-gia-cao').val()) || 100000000000;
    const sapXep = $('#sap-xep').val();
    const loaiPhongDaChon = $('.loc-loai-phong:checked').map(function() { return $(this).val(); }).get();
    const tienIchDaChon = $('.loc-tien-ich:checked').map(function() { return $(this).val(); }).get();
    let danhSachPhong = layDanhSachPhong(); // LẤY DỮ LIỆU MỚI MỖI LẦN LỌC
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
    if (sapXep === 'gia-tang') danhSachSauLoc.sort((a, b) => a.price - b.price);
    else if (sapXep === 'gia-giam') danhSachSauLoc.sort((a, b) => b.price - a.price);
    hienThiDanhSachPhong(danhSachSauLoc, '#danh-sach-tim-kiem');
    $('#so-luong-phong').text(`Tìm thấy ${danhSachSauLoc.length} phòng trọ`);
  }

  function hienThiDanhSachPhong(danhSach, idTheChua) {
    const theChua = $(idTheChua);
    theChua.empty();
    if (danhSach.length === 0) {
      theChua.html('<p class="thong-bao-trong">Không tìm thấy phòng trọ nào phù hợp.</p>');
      return;
    }
    danhSach.forEach(phong => {
      const khungAnhHTML = phong.image 
        ? `<img src="${phong.image}" class="card-phong__anh-that" style="width:100%; height:100%; object-fit:cover;">`
        : `<div class="room-image-placeholder">Ảnh phòng trọ mẫu</div>`;
      const thePhongHTML = `
        <a href="chi-tiet.html?id=${phong.id}" class="card-phong">
          <div class="card-phong__khung-anh" style="position:relative; height:190px; background-color:#cbd5e1; overflow:hidden;">
            <div class="card-phong__nhan">${phong.tag}</div>
            ${khungAnhHTML}
          </div>
          <div class="card-phong__noi-dung">
            <div class="card-phong__dong-dau">
              <h3 class="card-phong__tieu-de">${phong.title}</h3>
              <span class="card-phong__danh-gia">★ ${phong.rating}</span>
            </div>
            <p class="card-phong__dia-chi">📍 ${phong.address}</p>
            <div class="card-phong__thong-so">
              <span>📐 ${phong.area} m²</span>
              <span>🚪 Phòng trọ</span>
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

  // ==================== KHU VỰC 7: XỬ LÝ TRANG CHI TIẾT PHÒNG TRỌ ====================
  if ($('#chi-tiet-trang').length > 0) {
    function layThamSoIdURL(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    }
    const idPhong = layThamSoIdURL('id');
    const danhSachPhongTuStorage = layDanhSachPhong();
    const phongChiTiet = danhSachPhongTuStorage.find(p => String(p.id) === String(idPhong));
    if (!phongChiTiet) {
      alert('Không tìm thấy phòng trọ này! Quay lại trang tìm kiếm.');
      window.location.href = 'tim-kiem.html';
    } else {
      napGiaoDienChiTiet(phongChiTiet);
    }
  function napGiaoDienChiTiet(phong) {
    // Cập nhật tiêu đề trang và breadcrumb
    $('#duong-dan-tieu-de').text(phong.title);
    document.title = `${phong.title} - NhaTroSV`;

    // Phần đầu: tên, địa chỉ, rating, tag
    $('#chi-tiet-ten').text(phong.title);
    $('#chi-tiet-dia-chi').text(`📍 ${phong.address}`);
    $('#chi-tiet-rating').html(`★ ${phong.rating} (24 đánh giá)`);
    $('#chi-tiet-tag').text(phong.tag);

    // Ảnh
    if (phong.image) {
        $('#chi-tiet-anh').attr('src', phong.image).show();
        $('#khung-anh-phong .room-image-placeholder').hide();
    } else {
        $('#chi-tiet-anh').hide();
        $('#khung-anh-phong .room-image-placeholder').show();
    }

    // Lưới thông số
    $('#thongso-dien-tich').text(`${phong.area} m²`);
    let loaiText = phong.type === 'single' ? 'Đơn' : (phong.type === 'double' ? 'Đôi' : 'KTX');
    $('#thongso-loai').text(loaiText);
    $('#thongso-rating').text(`${phong.rating}/5`);

    // Chi phí (tính toán)
    let tienDien = 3500 * 100;
    let tienNuoc = 100000;
    let tienWifi = 100000;
    let tienGuiXe = 150000;
    let tong = phong.price + (phong.deposit / 12) + tienDien + tienNuoc + tienWifi + tienGuiXe;
    $('#chiphi-thue').text(`${phong.price.toLocaleString()}đ`);
    $('#chiphi-coc').text(`${phong.deposit.toLocaleString()}đ`);
    $('#chiphi-dien').text(`${tienDien.toLocaleString()}đ`);
    $('#chiphi-nuoc').text(`${tienNuoc.toLocaleString()}đ`);
    $('#chiphi-wifi').text(`${tienWifi.toLocaleString()}đ`);
    $('#chiphi-gui-xe').text(`${tienGuiXe.toLocaleString()}đ`);
    $('#chiphi-tong').text(`${Math.round(tong).toLocaleString()}đ`);

    // Tiện ích
    $('#tienich-wifi').text(phong.amenities.includes('wifi') ? '✔️ Wifi miễn phí' : '❌ Không có Wifi');
    $('#tienich-gac').text(phong.amenities.includes('gac_lung') ? '✔️ Có gác lửng' : '❌ Không gác lửng');
    $('#tienich-maygiat').text(phong.amenities.includes('may_giat') ? '✔️ Có máy giặt chung' : '❌ Không máy giặt');
    // Cửa sổ thoáng mát là mặc định, giữ nguyên

    // Thông tin liên hệ (cập nhật giá, tên, số điện thoại)
    $('#lien-he-gia').text(`${phong.price.toLocaleString()}đ`);
    let landlordName = "Chủ trọ";
    let landlordPhone = "0901234567";
    if (phong.landlordId) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        let landlord = users.find(u => u.id === phong.landlordId);
        if (landlord) {
            landlordName = landlord.name || "Chủ trọ";
            landlordPhone = landlord.phone || "0901234567";
        }
    }
    $('#lien-he-ten').text(landlordName);
    $('#lien-he-btn-goi').off('click').on('click', () => alert(`Số điện thoại: ${landlordPhone}`));
    $('#lien-he-btn-nhan').off('click').on('click', () => alert('Hộp thư đang được kết nối!'));
    $('#lien-he-btn-datlich').off('click').on('click', () => alert('Đã đặt lịch hẹn xem phòng!'));
 
     const mapCon = L.map('ban-do-chi-tiet').setView([phong.lat, phong.lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapCon);
      L.marker([phong.lat, phong.lng]).addTo(mapCon).bindPopup(phong.title);
    }
  }
//     // Bản đồ
//     if (window.chiTietMap) window.chiTietMap.remove();
//     window.chiTietMap = L.map('ban-do-chi-tiet').setView([phong.lat, phong.lng], 15);
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '© OpenStreetMap contributors'
//     }).addTo(window.chiTietMap);
//     L.marker([phong.long, phong.lat]).addTo(window.chiTietMap).bindPopup(phong.title);
// }

  // ==================== HÀM CẬP NHẬT HEADER (GIỮ NGUYÊN CÁCH HOẠT ĐỘNG CŨ) ====================
  function capNhatTrangThaiHeader() {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    const vungHanhDong = $('#vung-hanh-dong');
    if (vungHanhDong.length === 0) return;
    if (currentUser) {
      let menuHanhDongHTML = '';
      if (currentUser.role === 'landlord') {
        menuHanhDongHTML += `<a href="dang-tin.html" class="btn btn--landlord">Đăng tin trọ</a>`;
      }
      menuHanhDongHTML += `
        <div class="user-profile-header">
          <span class="user-avatar-text">👤 ${currentUser.name}</span>
          <button id="nut-dang-xuat" class="btn btn--landlord nut-dang-xuat-header">Đăng xuất</button>
        </div>
      `;
      vungHanhDong.html(menuHanhDongHTML);
      $('#nut-dang-xuat').on('click', function() {
        if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
          sessionStorage.removeItem("currentUser");
          window.location.href = "index.html";
        }
      });
    } else {
      vungHanhDong.html(`
        <a href="dang-tin.html" class="btn btn--landlord">Cho chủ trọ</a>
        <a href="dang-nhap.html" class="btn btn--login">Đăng nhập</a>
      `);
    }
  }

});