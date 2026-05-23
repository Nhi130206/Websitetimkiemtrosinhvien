// Ép ẩn khung đăng ký ngay khi vừa dựng xong khung HTML
document.addEventListener("DOMContentLoaded", function() {
  const khungDangKy = document.getElementById("khung-dang-ky");
  if (khungDangKy) khungDangKy.style.display = "none";
});

$(document).ready(function() {

  // ==================== HÀM TIỆN ÍCH ====================
  function layDanhSachPhong() {
    return JSON.parse(localStorage.getItem("rooms")) || [];
  }

  // ==================== CẬP NHẬT HEADER (QUAN TRỌNG) ====================
  function capNhatTrangThaiHeader() {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    const vungHanhDong = $("#vung-hanh-dong");
    if (vungHanhDong.length === 0) return;

    if (currentUser) {
      // Đã đăng nhập: hiển thị avatar + tên viết tắt
      const kyTuDau = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "?";
      const noiDungAvatar = currentUser.avatar
        ? `<img src="${currentUser.avatar}" alt="avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`
        : kyTuDau;

      let menu = "";
      if (currentUser.role === "landlord") {
        menu += `<a href="dang-tin.html" class="btn btn--landlord">Đăng tin trọ</a>`;
      }
      menu += `<div class="user-profile-header"><a href="thong-tin.html" class="user-avatar" id="avatar-header">${noiDungAvatar}</a></div>`;
      vungHanhDong.html(menu);
    } else {
      // CHƯA ĐĂNG NHẬP: hiển thị nút đăng nhập + nút cho chủ trọ (dẫn đến đăng nhập)
      vungHanhDong.html(`
        <a href="dang-nhap.html" class="btn btn--landlord">Cho chủ trọ</a>
        <a href="dang-nhap.html" class="btn btn--login">Đăng nhập</a>
      `);
    }
  }

  capNhatTrangThaiHeader();

  // ==================== TRANG CHỦ ====================
  if ($('#danh-sach-tro').length > 0) {
    let dsPhong = layDanhSachPhong();
    hienThiDanhSachPhong(dsPhong.slice(0), '#danh-sach-tro');
  }

  $('#btn-tim').on('click', function() {
    sessionStorage.setItem("duongChuyenTiep", $('#chon-duong').val());
    window.location.href = "tim-kiem.html";
  });

  // ==================== TRANG TÌM KIẾM ====================
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

  // ==================== TRANG BẢN ĐỒ ====================
  if ($('#ban-do-chinh').length > 0) {
    let banDo = L.map('ban-do-chinh').setView([12.6553, 108.02656], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(banDo);
    let danhSachGhim = [];
    function capNhatGhim(danhSach) {
      danhSachGhim.forEach(ghim => banDo.removeLayer(ghim));
      danhSachGhim = [];
      danhSach.forEach(phong => {
        const ghim = L.marker([phong.lat, phong.lng]).addTo(banDo);
        ghim.bindPopup(`<strong>${phong.title}</strong><br>${phong.price.toLocaleString()}đ/tháng`);
        ghim.on('click', () => hienThiThePhongChon(phong));
        danhSachGhim.push(ghim);
      });
      $('#so-luong-ban-do').text(danhSach.length);
    }
    function hienThiThePhongChon(phong) {
      $('#noi-dung-phong-chon').html(`
        <div class="the-phong-chon__khung">
          <span class="the-phong-chon__nhan">${phong.tag}</span>
          <h4>${phong.title}</h4>
          <p>📍 ${phong.address}</p>
          <p>📐 ${phong.area} m²</p>
          <div><strong>${phong.price.toLocaleString()}đ/tháng</strong></div>
          <a href="chi-tiet.html?id=${phong.id}">Xem chi tiết</a>
        </div>
      `);
      $('#the-phong-chon').fadeIn(200);
    }
    $('#nut-dong-the').click(() => $('#the-phong-chon').fadeOut(200));
    $('#loc-duong-ban-do').on('change', function() {
      let ds = layDanhSachPhong();
      let loc = $(this).val();
      if (loc !== 'all') ds = ds.filter(p => p.street === loc);
      capNhatGhim(ds);
      $('#the-phong-chon').fadeOut(100);
    });
    capNhatGhim(layDanhSachPhong());
  }

  // ==================== TRANG ĐĂNG TIN ====================
  if ($('#form-dang-tin').length > 0) {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== 'landlord') {
      alert("Vui lòng đăng nhập tài khoản CHỦ TRỌ để đăng tin!");
      window.location.href = "dang-nhap.html";
      return;
    }
    let hinhAnhBase64 = "";
    $('#dang-anh').on('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => hinhAnhBase64 = ev.target.result;
        reader.readAsDataURL(file);
      }
    });
    $('#form-dang-tin').on('submit', function(e) {
      e.preventDefault();
      if (!hinhAnhBase64) {
        alert("Vui lòng tải ảnh phòng trọ!");
        return;
      }
      const phongMoi = {
        id: Date.now(),
        title: $('#dang-tieu-de').val().trim(),
        address: $('#dang-dia-chi').val().trim(),
        street: $('#dang-duong').val(),
        price: parseInt($('#dang-gia').val()),
        deposit: parseInt($('#dang-coc').val()),
        area: parseInt($('#dang-dien-tich').val()),
        type: $('#dang-loai-phong').val(),
        rating: 5.0,
        tag: `Còn ${$('#dang-so-luong').val().trim()} phòng`,
        amenities: $('.tien-ich-dang:checked').map((i,el) => $(el).val()).get(),
        image: hinhAnhBase64,
        lat: 12.6515 + (Math.random() - 0.5) * 0.01,
        lng: 108.0581 + (Math.random() - 0.5) * 0.01,
        landlordId: currentUser.id,
        createdAt: Date.now(),
        electricPrice: parseInt($('#dang-gia-dien').val()) || 0,
        waterPrice: parseInt($('#dang-gia-nuoc').val()) || 0,
        wifiPrice: parseInt($('#dang-gia-wifi').val()) || 0,
        parkingPrice: parseInt($('#dang-gia-gui-xe').val()) || 0
      };
      let dsPhong = layDanhSachPhong();
      dsPhong.push(phongMoi);
      localStorage.setItem("rooms", JSON.stringify(dsPhong));
      alert("Đăng tin thành công!");
      window.location.href = "tim-kiem.html";
    });
  }

  // ==================== ĐĂNG NHẬP & ĐĂNG KÝ ====================
  if ($('#khung-dang-nhap').length > 0) {
    $('#khung-dang-ky').hide();
    $('#link-sang-dang-ky').click(e => {
      e.preventDefault();
      $('#khung-dang-nhap').hide();
      $('#khung-dang-ky').fadeIn(200);
    });
    $('#link-sang-dang-nhap').click(e => {
      e.preventDefault();
      $('#khung-dang-ky').hide();
      $('#khung-dang-nhap').fadeIn(200);
    });
    $('#form-dang-ky-truc-tiep').submit(e => {
      e.preventDefault();
      let ten = $('#ky-ten').val().trim();
      let email = $('#ky-email').val().trim();
      let sdt = $('#ky-sodt').val().trim();
      let pass = $('#ky-mat-khau').val().trim();
      let role = $('#ky-vai-tro').val();
      if (!ten || !email || !sdt || !pass) { alert("Nhập đủ thông tin"); return; }
      if (pass.length < 4) { alert("Mật khẩu ≥4 ký tự"); return; }
      let users = JSON.parse(localStorage.getItem("users")) || [];
      if (users.find(u => u.email === email)) { alert("Email đã tồn tại"); return; }
      let newUser = { id: Date.now(), name: ten, email, phone: sdt, password: pass, role };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      $('#form-dang-ky-truc-tiep')[0].reset();
      $('#khung-dang-ky').hide();
      $('#khung-dang-nhap').fadeIn(200);
    });
    $('#form-dang-nhap-truc-tiep').submit(e => {
      e.preventDefault();
      let email = $('#nhap-email').val().trim();
      let pass = $('#nhap-mat-khau').val().trim();
      let users = JSON.parse(localStorage.getItem("users")) || [];
      let user = users.find(u => u.email === email && u.password === pass);
      if (user) {
        alert("Đăng nhập thành công");
        sessionStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = "index.html";
      } else {
        alert("Sai email hoặc mật khẩu");
      }
    });
  }

  // ==================== HÀM LỌC & HIỂN THỊ ====================
  function thucHienLocPhong() {
    let duong = $('#chon-duong').val();
    let giaMin = parseInt($('#loc-gia-thap').val()) || 0;
    let giaMax = parseInt($('#loc-gia-cao').val()) || 100000000000;
    let sapXep = $('#sap-xep').val();
    let loaiChon = $('.loc-loai-phong:checked').map((i,el) => $(el).val()).get();
    let tienIchChon = $('.loc-tien-ich:checked').map((i,el) => $(el).val()).get();
    let ds = layDanhSachPhong().filter(p => {
      if (duong !== 'all' && p.street !== duong) return false;
      if (p.price < giaMin || p.price > giaMax) return false;
      if (loaiChon.length && !loaiChon.includes(p.type)) return false;
      if (tienIchChon.length && !tienIchChon.every(ti => p.amenities.includes(ti))) return false;
      return true;
    });
    if (sapXep === 'gia-tang') ds.sort((a,b) => a.price - b.price);
    if (sapXep === 'gia-giam') ds.sort((a,b) => b.price - a.price);
    hienThiDanhSachPhong(ds, '#danh-sach-tim-kiem');
    $('#so-luong-phong').text(`Tìm thấy ${ds.length} phòng trọ`);
  }

  function hienThiDanhSachPhong(ds, container) {
    let $container = $(container);
    $container.empty();
    if (!ds.length) {
      $container.html('<p class="thong-bao-trong">Không có phòng trọ nào.</p>');
      return;
    }
    ds.forEach(p => {
      let imgHtml = p.image ? `<img src="${p.image}" style="width:100%; height:100%; object-fit:cover;">` : '<div class="room-image-placeholder">Ảnh phòng</div>';
      let card = `
        <a href="chi-tiet.html?id=${p.id}" class="card-phong">
          <div class="card-phong__khung-anh" style="height:190px; overflow:hidden; position:relative;">
            <div class="card-phong__nhan">${p.tag}</div>
            ${imgHtml}
          </div>
          <div class="card-phong__noi-dung">
            <h3>${p.title}</h3>
            <p>📍 ${p.address}</p>
            <div>📐 ${p.area} m²</div>
           <div class="card-phong__vach-ngan"></div>
            <div><strong>${p.price.toLocaleString()}đ/tháng</strong></div>
          </div>
        </a>
      `;
      $container.append(card);
    });
  }

  // ==================== TRANG CHI TIẾT ====================
  if ($('#chi-tiet-trang').length > 0) {
    let id = new URLSearchParams(window.location.search).get('id');
    let phong = layDanhSachPhong().find(p => String(p.id) === String(id));
    if (!phong) {
      alert("Không tìm thấy phòng trọ");
      window.location.href = "tim-kiem.html";
      return;
    }
    napGiaoDienChiTiet(phong);
  }

  function napGiaoDienChiTiet(phong) {
    $('#duong-dan-tieu-de').text(phong.title);
    document.title = `${phong.title} - NhaTroSV`;
    $('#chi-tiet-ten').text(phong.title);
    $('#chi-tiet-dia-chi').text(`📍 ${phong.address}`);
    $('#chi-tiet-rating').html(`★ ${phong.rating} (24 đánh giá)`);
    $('#chi-tiet-tag').text(phong.tag);
    if (phong.image) {
      $('#chi-tiet-anh').attr('src', phong.image).show();
      $('#khung-anh-phong .room-image-placeholder').hide();
    } else {
      $('#chi-tiet-anh').hide();
      $('#khung-anh-phong .room-image-placeholder').show();
    }
    $('#thongso-dien-tich').text(`${phong.area} m²`);
    let loaiText = phong.type === 'single' ? 'Đơn' : (phong.type === 'double' ? 'Đôi' : 'KTX');
    $('#thongso-loai').text(loaiText);
    $('#thongso-rating').text(`${phong.rating}/5`);

    // Chi phí từ dữ liệu đăng tin
    let tienDien = (phong.electricPrice || 0) * 100;
    let tienNuoc = phong.waterPrice || 0;
    let tienWifi = phong.wifiPrice || 0;
    let tienGuiXe = phong.parkingPrice || 0;
    let tong = phong.price + (phong.deposit / 12) + tienDien + tienNuoc + tienWifi + tienGuiXe;
    $('#chiphi-thue').text(`${phong.price.toLocaleString()}đ`);
    $('#chiphi-coc').text(`${phong.deposit.toLocaleString()}đ`);
    $('#chiphi-dien').text(tienDien > 0 ? `${tienDien.toLocaleString()}đ` : 'Không thu');
    $('#chiphi-nuoc').text(tienNuoc > 0 ? `${tienNuoc.toLocaleString()}đ` : 'Không thu');
    $('#chiphi-wifi').text(tienWifi > 0 ? `${tienWifi.toLocaleString()}đ` : 'Không thu');
    $('#chiphi-gui-xe').text(tienGuiXe > 0 ? `${tienGuiXe.toLocaleString()}đ` : 'Không thu');
    $('#chiphi-tong').text(`${Math.round(tong).toLocaleString()}đ`);

    // Tiện ích
    $('#tienich-wifi').text(phong.amenities.includes('wifi') ? '✔️ Wifi miễn phí' : '❌ Không có Wifi');
    $('#tienich-gac').text(phong.amenities.includes('gac_lung') ? '✔️ Có gác lửng' : '❌ Không gác lửng');
    $('#tienich-maygiat').text(phong.amenities.includes('may_giat') ? '✔️ Có máy giặt chung' : '❌ Không máy giặt');

    // Liên hệ
    $('#lien-he-gia').text(`${phong.price.toLocaleString()}đ`);
    let landlordName = "Chủ trọ", landlordPhone = "0901234567";
    if (phong.landlordId) {
      let users = JSON.parse(localStorage.getItem("users")) || [];
      let landlord = users.find(u => u.id === phong.landlordId);
      if (landlord) {
        landlordName = landlord.name || "Chủ trọ";
        landlordPhone = landlord.phone || "0901234567";
      }
    }
    $('#lien-he-ten').text(landlordName);
    $('#lien-he-btn-goi').off('click').on('click', () => alert(`SĐT: ${landlordPhone}`));
    $('#lien-he-btn-nhan').off('click').on('click', () => alert('Hộp thư đang kết nối'));
    $('#lien-he-btn-datlich').off('click').on('click', () => alert('Đã đặt lịch xem phòng'));

    // Bản đồ
    let map = L.map('ban-do-chi-tiet').setView([phong.lat, phong.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([phong.lat, phong.lng]).addTo(map).bindPopup(phong.title);
  }

  // ==================== TRANG THÔNG TIN CÁ NHÂN ====================
  if ($('.trang-thong-tin').length > 0) {
    let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser) {
      window.location.href = "dang-nhap.html";
      return;
    }
    function hienThiAvatar() {
      let kyTuDau = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "?";
      if (currentUser.avatar) {
        $('#hien-thi-avatar').html(`<img src="${currentUser.avatar}" alt="avatar">`);
      } else {
        $('#hien-thi-avatar').text(kyTuDau);
      }
    }
    $('#sua-ten').val(currentUser.name || "");
    $('#sua-email').val(currentUser.email || "");
    $('#sua-sdt').val(currentUser.phone || "");
    $('#sua-vai-tro').val(currentUser.role || "student");
    hienThiAvatar();

    $('#input-avatar').on('change', function() {
      let file = this.files[0];
      if (file) {
        let reader = new FileReader();
        reader.onload = e => {
          currentUser.avatar = e.target.result;
          sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
          hienThiAvatar();
          capNhatTrangThaiHeader(); // cập nhật avatar trên header
        };
        reader.readAsDataURL(file);
      }
    });

    $('#btn-luu').on('click', function() {
      currentUser.name = $('#sua-ten').val().trim();
      currentUser.email = $('#sua-email').val().trim();
      currentUser.phone = $('#sua-sdt').val().trim();
      currentUser.role = $('#sua-vai-tro').val();
      sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
      let users = JSON.parse(localStorage.getItem("users")) || [];
      let idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) users[idx] = currentUser;
      localStorage.setItem("users", JSON.stringify(users));
      hienThiAvatar();
      $('#thong-bao-luu').fadeIn(200).delay(2000).fadeOut(400);
      capNhatTrangThaiHeader();
    });

    $('#btn-dang-xuat').on('click', function() {
      if (confirm("Đăng xuất?")) {
        sessionStorage.removeItem("currentUser");
        window.location.href = "index.html";
      }
    });
  }

});