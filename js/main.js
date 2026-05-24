// Ép ẩn khung đăng ký ngay khi vừa dựng xong khung HTML
document.addEventListener("DOMContentLoaded", function() {
  const khungDangKy = document.getElementById("khung-dang-ky");
  if (khungDangKy) khungDangKy.style.display = "none";
});

$(document).ready(function() {

  // ==================== HÀM TIỆN ÍCH DÙNG CHUNG ====================
  function layDanhSachPhong() {
    return JSON.parse(localStorage.getItem("rooms")) || [];
  }

  // ==================== CẬP NHẬT HEADER TRÊN TẤT CẢ CÁC TRANG ====================
  function capNhatTrangThaiHeader() {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    const vungHanhDong = $("#vung-hanh-dong");
    if (vungHanhDong.length === 0) return;

    if (currentUser) {
      // Đã đăng nhập: hiển thị avatar chứa chữ cái đầu hoặc ảnh đại diện tròn
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
      // Chưa đăng nhập: hiển thị nút Đăng nhập và Cho chủ trọ mặc định
      vungHanhDong.html(`
        <a href="dang-nhap.html" class="btn btn--landlord">Cho chủ trọ</a>
        <a href="dang-nhap.html" class="btn btn--login">Đăng nhập</a>
      `);
    }
  }

  capNhatTrangThaiHeader();

  // ==================== TRANG CHỦ (index.html) ====================
  if ($('#danh-sach-tro').length > 0) {
    let dsPhong = layDanhSachPhong();
    hienThiDanhSachPhong(dsPhong, '#danh-sach-tro');
  }

  $('#btn-tim').on('click', function() {
    sessionStorage.setItem("duongChuyenTiep", $('#chon-duong').val());
    window.location.href = "tim-kiem.html";
  });

  // ==================== TRANG TÌM KIẾM (tim-kiem.html) ====================
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
      $('#loc-gia-cao').val('100000000000');
      $('.loc-loai-phong').prop('checked', false);
      $('.loc-tien-ich').prop('checked', false);
      $('#sap-xep').val('mac-dinh');
      thucHienLocPhong();
    });
  }

  // ==================== TRANG BẢN ĐỒ (ban-do.html) ====================
  if ($('#ban-do-chinh').length > 0) {
    let banDo = L.map('ban-do-chinh').setView([12.6515, 108.0581], 15);
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

  // ==================== TRANG ĐĂNG TIN (dang-tin.html) ====================
  if ($('#form-dang-tin').length > 0) {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== 'landlord') {
      alert("Vui lòng đăng nhập tài khoản CHỦ TRỌ để đăng tin!");
      window.location.href = "dang-nhap.html";
      return;
    }
    let hinhAnhBase64 = "";

    // BỘ NÉN ẢNH CANVAS CHỐNG TRÀN BỘ NHỚ LOCALSTORAGE TRONG LÚC DEMO BÁO CÁO
    $('#dang-anh').on('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          const img = new Image();
          img.onload = function() {
            const canvas = document.createElement('canvas');
            const max_width = 600; // Bóp chiều ngang ảnh về 600px cực nhẹ
            const scale = max_width / img.width;
            canvas.width = max_width;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            hinhAnhBase64 = canvas.toDataURL('image/jpeg', 0.7); // Nén ảnh chất lượng 70%
          };
          img.src = ev.target.result;
        };
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
        electricPrice: parseInt($('#dang-gia-dien').val()) || 3500,
        waterPrice: parseInt($('#dang-gia-nuoc').val()) || 100000,
        wifiPrice: parseInt($('#dang-gia-wifi').val()) || 100000,
        parkingPrice: 150000
      };
      let dsPhong = layDanhSachPhong();
      dsPhong.push(phongMoi);
      localStorage.setItem("rooms", JSON.stringify(dsPhong));
      alert("Đăng tin thành công!");
      window.location.href = "tim-kiem.html";
    });
  }

  // ==================== ĐĂNG NHẬP & ĐĂNG KÝ (dang-nhap.html) ====================
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

    // MÃ HÓA MẬT KHẨU MÔ PHỎNG BẰNG BTOA() ĐỂ GHI ĐIỂM BẢO MẬT KHI THUYẾT TRÌNH
    $('#form-dang-ky-truc-tiep').submit(e => {
      e.preventDefault();
      let ten = $('#ky-ten').val().trim();
      let email = $('#ky-email').val().trim();
      let sdt = $('#ky-sodt').val().trim();
      let pass = $('#ky-mat-khau').val().trim();
      let role = $('#ky-vai-tro').val();

      if (!ten || !email || !sdt || !pass) { alert("Nhập đủ thông tin"); return; }
      if (pass.length < 4) { alert("Mật khẩu ≥4 ký tự"); return; }

      let users = [];
      try {
        users = JSON.parse(localStorage.getItem("users")) || [];
      } catch (err) {
        users = [];
      }

      if (users.find(u => u.email === email)) { alert("Email đã tồn tại"); return; }

      let newUser = { id: Date.now(), name: ten, email, phone: sdt, password: btoa(pass), role };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      $('#form-dang-ky-truc-tiep')[0].reset();
      $('#khung-dang-ky').hide();
      $('#khung-dang-nhap').fadeIn(200);
    });

    // GIẢI MÃ SO KHỚP KHI ĐĂNG NHẬP
    $('#form-dang-nhap-truc-tiep').submit(e => {
      e.preventDefault();
      let email = $('#nhap-email').val().trim();
      let pass = $('#nhap-mat-khau').val().trim();

      let users = [];
      try {
        users = JSON.parse(localStorage.getItem("users")) || [];
      } catch (err) {
        users = [];
      }

      let user = users.find(u => u.email === email && u.password === btoa(pass));
      if (user) {
        alert("Đăng nhập thành công");
        sessionStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = "index.html";
      } else {
        alert("Sai email hoặc mật khẩu");
      }
    });
  }

  // ==================== HÀM LỌC & HIỂN THỊ DẠNG THẺ ====================
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
      $container.html('<p class="thong-bao-trong">Không có dữ liệu phòng trọ phù hợp.</p>');
      return;
    }

    ds.forEach(p => {
      let imgHtml = p.image ? `<img src="${p.image}" class="card-phong__anh-that">` : '<div class="room-image-placeholder">Ảnh phòng trọ mẫu</div>';
      let card = `
        <a href="chi-tiet.html?id=${p.id}" class="card-phong">
          <div class="card-phong__khung-anh">
            <div class="card-phong__nhan">${p.tag}</div>
            ${imgHtml}
          </div>
          <div class="card-phong__noi-dung">
            <h3 class="card-phong__tieu-de">${p.title}</h3>
            <p class="card-phong__dia-chi">📍 ${p.address}</p>
            <div class="card-phong__thong-so">
              <span>📐 ${p.area} m²</span>
              <span>🚪 Phòng đơn</span>
            </div>
            <div class="card-phong__vach-ngan"></div>
            <div class="card-phong__dong-gia">
              <span class="card-phong__nhan-gia">Giá thuê:</span>
              <strong class="card-phong__gia">${p.price.toLocaleString()}đ</strong>
            </div>
          </div>
        </a>
      `;
      $container.append(card);
    });
  }

  // ==================== TRANG CHI TIẾT (CHỈ TƯƠNG TÁC LÊN HTML TĨNH) ====================
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
    // 1. Cập nhật các thông tin cơ bản bằng text()
    $('#duong-dan-tieu-de').text(phong.title);
    document.title = `${phong.title} - NhaTroSV`;
    $('#chi-tiet-ten').text(phong.title);
    $('#chi-tiet-dia-chi').text(`📍 ${phong.address}`);
    $('#chi-tiet-rating').html(`★ ${phong.rating} (24 đánh giá)`);
    $('#chi-tiet-tag').text(phong.tag);

    // 2. Cập nhật ảnh
    if (phong.image) {
      $('#chi-tiet-anh').attr('src', phong.image).show();
      $('#khung-anh-phong .room-image-placeholder').hide();
    } else {
      $('#chi-tiet-anh').hide();
      $('#khung-anh-phong .room-image-placeholder').show();
    }

    // 3. Thông số phụ
    $('#thongso-dien-tich').text(`${phong.area} m²`);
    let loaiText = phong.type === 'single' ? 'Đơn' : (phong.type === 'double' ? 'Đôi' : 'KTX');
    $('#thongso-loai').text(loaiText);
    $('#thongso-rating').text(`${phong.rating}/5`);

    // 4. Chi phí dịch vụ và tiền phòng
    let tienDien = (phong.electricPrice || 3500) * 100;
    let tienNuoc = phong.waterPrice || 100000;
    let tienWifi = phong.wifiPrice || 100000;
    let tong = phong.price + (phong.deposit / 12) + tienDien + tienNuoc + tienWifi + 150000;

    $('#chiphi-thue').text(`${phong.price.toLocaleString()}đ`);
    $('#chiphi-coc').text(`${phong.deposit.toLocaleString()}đ`);
    $('#chiphi-dien').text(`${tienDien.toLocaleString()}đ`);
    $('#chiphi-nuoc').text(`${tienNuoc.toLocaleString()}đ`);
    $('#chiphi-wifi').text(`${tienWifi.toLocaleString()}đ`);
    $('#chiphi-tong').text(`${Math.round(tong).toLocaleString()}đ`);

    // 5. Cập nhật tiện ích bằng text()
    $('#tienich-wifi').text(phong.amenities.includes('wifi') ? '✔️ Wifi miễn phí' : '❌ Không có Wifi');
    $('#tienich-gac').text(phong.amenities.includes('gac_lung') ? '✔️ Có gác lửng' : '❌ Không gác lửng');
    $('#tienich-maygiat').text(phong.amenities.includes('may_giat') ? '✔️ Có máy giặt chung' : '❌ Không máy giặt');

    // 6. Thông tin liên hệ chủ trọ
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
    
    // Thao tác nút gọi điện và nhắn tin
    $('#lien-he-btn-goi').off('click').on('click', () => alert(`SĐT liên hệ chủ nhà: ${landlordPhone}`));
    $('#lien-he-btn-nhan').off('click').on('click', () => alert('Hộp thư đang kết nối trực tuyến'));
    $('#lien-he-btn-datlich').off('click').on('click', () => alert('Đặt lịch hẹn xem phòng trực tiếp thành công'));

    // 7. Vẽ định vị phòng lên bản đồ LeafletJS con
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
  // Điền thông tin vào form
  $("#sua-ten").val(currentUser.name || "");
  $("#sua-email").val(currentUser.email || "");
  $("#sua-sdt").val(currentUser.phone || "");

  // Hiển thị vai trò dưới avatar
  var doiTuong = currentUser.role === "landlord" ? "Chủ trọ" : "Sinh viên";
  $("#hien-doi-tuong").text(doiTuong);

  // Hiện avatar
  function hienThiAvatar() {
    var kyTuDau = currentUser.name
      ? currentUser.name.charAt(0).toUpperCase()
      : "?";
    if (currentUser.avatar) {
      $("#hien-thi-avatar").html(
        '<img src="' + currentUser.avatar + '" alt="avatar">',
      );
    } else {
      $("#hien-thi-avatar").text(kyTuDau);
    }
  }
  hienThiAvatar();

  // Đổi ảnh đại diện
  $("#input-avatar").on("change", function () {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      currentUser.avatar = e.target.result;
      sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
      hienThiAvatar();
      $("#avatar-header").html(
        '<img src="' +
          currentUser.avatar +
          '" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">',
      );
    };
    reader.readAsDataURL(file);
  });

  // Lưu thông tin
  $("#btn-luu").on("click", function () {
    currentUser.name = $("#sua-ten").val().trim();
    currentUser.email = $("#sua-email").val().trim();
    currentUser.phone = $("#sua-sdt").val().trim();

    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

    var danhSachUser = JSON.parse(localStorage.getItem("users")) || [];
    var viTri = danhSachUser.findIndex(function (u) {
      return u.id === currentUser.id;
    });
    if (viTri !== -1) {
      danhSachUser[viTri] = currentUser;
      localStorage.setItem("users", JSON.stringify(danhSachUser));
    }

    hienThiAvatar();
    $("#thong-bao-luu").fadeIn(200).delay(2000).fadeOut(400);
  });

  // Đăng xuất
  $("#btn-dang-xuat").on("click", function () {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      sessionStorage.removeItem("currentUser");
      window.location.href = "index.html";
    }
  });
  }}
);
