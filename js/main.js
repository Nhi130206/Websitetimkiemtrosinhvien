$(document).ready(function() {

  // =========================================================================
  // KHU VỰC 0: ĐỒNG BỘ TRẠNG THÁI THANH HEADER (DÙNG CHUNG TOÀN TRANG)
  // =========================================================================
  capNhatTrangThaiHeader();

  function capNhatTrangThaiHeader() {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    const vungHanhDong = $('#vung-hanh-dong');

    // Nếu đã có thông tin phiên làm việc trong sessionStorage
    if (currentUser) {
      let menuHanhDongHTML = '';

      // Nếu là chủ trọ thì có nút "Đăng tin trọ" riêng biệt
      if (currentUser.role === 'landlord') {
        menuHanhDongHTML += `<a href="dang-tin.html" class="btn btn--landlord">Đăng tin trọ</a>`;
      }
      
      // Chào tên người dùng và hiển thị nút Đăng xuất (Dùng class định dạng sạch)
      menuHanhDongHTML += `
        <span class="dang-nhap-chao">👋 Chào, ${currentUser.name}</span>
        <button id="nut-dang-xuat" class="btn btn--landlord nut-dang-xuat-header">Đăng xuất</button>
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


  // =========================================================================
  // KHU VỰC 1: XỬ LÝ TRANG CHỦ (index.html)
  // =========================================================================
  const danhSachPhong = JSON.parse(localStorage.getItem("rooms")) || [];

  if ($('#danh-sach-tro').length > 0) {
    // Chỉ hiển thị tối đa 3 phòng trọ đầu tiên làm nổi bật ở trang chủ
    hienThiDanhSachPhong(danhSachPhong.slice(0, 3), '#danh-sach-tro');
  }

  // Sự kiện khi nhấn nút "Tìm phòng" ở trang chủ
  $('#btn-tim').on('click', function() {
    const duongDaChon = $('#chon-duong').val();
    sessionStorage.setItem("duongChuyenTiep", duongDaChon);
    window.location.href = "tim-kiem.html"; // Chuyển sang trang bộ lọc
  });


  // =========================================================================
  // KHU VỰC 2: XỬ LÝ TRANG BỘ LỌC TÌM KIẾM (tim-kiem.html)
  // =========================================================================
  if ($('#danh-sach-tim-kiem').length > 0) {
    
    // Đọc yêu cầu lọc đường được gửi từ Trang chủ sang (nếu có)
    const duongTuTrangChu = sessionStorage.getItem("duongChuyenTiep");
    if (duongTuTrangChu) {
      $('#chon-duong').val(duongTuTrangChu);
      sessionStorage.removeItem("duongChuyenTiep"); // Xóa bộ nhớ tạm
    }

    // Chạy lọc phòng lần đầu tiên khi tải trang
    thucHienLocPhong();

    // Lắng nghe các sự kiện thay đổi dữ liệu lọc
    $('#chon-duong, #loc-gia-thap, #loc-gia-cao, #sap-xep').on('change keyup', thucHienLocPhong);
    $('.loc-loai-phong, .loc-tien-ich').on('change', thucHienLocPhong);

    // Sự kiện nút "Đặt lại" bộ lọc về mặc định
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


  // =========================================================================
  // KHU VỰC 3: XỬ LÝ TRANG BẢN ĐỒ (ban-do.html)
  // =========================================================================
  if ($('#ban-do-chinh').length > 0) {
    let banDo;
    let danhSachGhim = [];

    // Khởi tạo bản đồ Leaflet lấy tâm tại Đại học Tây Nguyên
    banDo = L.map('ban-do-chinh').setView([12.6515, 108.0581], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(banDo);

    // Hàm vẽ ghim (Marker) lên bản đồ
    function capNhatGhimBanDo(danhSachLoc) {
      danhSachGhim.forEach(ghim => banDo.removeLayer(ghim));
      danhSachGhim = [];

      danhSachLoc.forEach(phong => {
        const ghim = L.marker([phong.lat, phong.lng]).addTo(banDo);
        
        // Sử dụng class CSS đã khai báo sẵn trong components.css thay vì style inline
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

    // Hiển thị hộp chi tiết phòng trọ ở góc dưới bản đồ
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

    // Bấm đóng thẻ thông tin phòng ở góc bản đồ
    $('#nut-dong-the').on('click', function() {
      $('#the-phong-chon').fadeOut(200);
    });

    // Hàm lọc ghim phòng theo tên đường
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


  // =========================================================================
  // KHU VỰC 4: XỬ LÝ TRANG ĐĂNG TIN NHIỀU BƯỚC (dang-tin.html)
  // =========================================================================
  if ($('#form-dang-tin').length > 0) {
    
    // Bước 1 sang Bước 2
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

    // Bước 2 quay về Bước 1
    $('#nut-quay-1').on('click', function() {
      $('#khung-buoc-2').addClass('an');
      $('#khung-buoc-1').removeClass('an');

      $('#vong-2').removeClass('active');
      $('#duong-1').removeClass('active');
      $('#vong-1').removeClass('completed').addClass('active');
    });

    // Bước 2 sang Bước 3
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

    // Bước 3 quay về Bước 2
    $('#nut-quay-2').on('click', function() {
      $('#khung-buoc-3').addClass('an');
      $('#khung-buoc-2').removeClass('an');

      $('#vong-3').removeClass('active');
      $('#duong-2').removeClass('active');
      $('#vong-2').removeClass('completed').addClass('active');
    });

    // Bước 3 hoàn tất lưu dữ liệu phòng mới
    $('#nut-hoan-tat').on('click', function() {
      const soLuongPhong = $('#dang-so-luong').val().trim();

      if (soLuongPhong === "") {
        alert("Vui lòng điền số lượng phòng còn trống *");
        return;
      }

      const tienIchDaChon = $('.tien-ich-dang:checked').map(function() {
        return $(this).val();
      }).get();

      // Tạo tọa độ ngẫu nhiên quanh ĐH Tây Nguyên
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
      window.location.href = "tim-kiem.html"; // Chuyển về trang lọc để xem ngay
    });
  }

// =========================================================================
  // KHU VỰC 5: XỬ LÝ ĐĂNG NHẬP & ĐĂNG KÝ (dang-nhap.html) 
  // =========================================================================
  if ($('#khung-dang-nhap').length > 0) {
    
    // Ép trình duyệt ẩn khung Đăng ký ngay khi vừa tải trang xong
    $('#khung-dang-ky').hide(); 
    $('#khung-dang-nhap').show();

    // Click chuyển sang form Đăng ký
    $('#link-sang-dang-ky').on('click', function(e) {
      e.preventDefault();
      $('#khung-dang-nhap').hide(); // Ẩn đăng nhập
      $('#khung-dang-ky').fadeIn(200); // Hiện đăng ký mượt mà
    });

    // Click chuyển về form Đăng nhập
    $('#link-sang-dang-nhap').on('click', function(e) {
      e.preventDefault();
      $('#khung-dang-ky').hide(); // Ẩn đăng ký
      $('#khung-dang-nhap').fadeIn(200); // Hiện đăng nhập mượt mà
    });

    // Xử lý nộp form ĐĂNG KÝ tài khoản mới
    $('#form-dang-ky-truc-tiep').on('submit', function(e) {
      e.preventDefault();

      const ten = $('#ky-ten').val().trim();
      const email = $('#ky-email').val().trim();
      const soDt = $('#ky-sodt').val().trim();
      const matKhau = $('#ky-mat-khau').val().trim();
      const vaiTro = $('#ky-vai-tro').val();

      const danhSachUser = JSON.parse(localStorage.getItem("users")) || [];

      // Kiểm tra trùng lặp Email
      const checkTrung = danhSachUser.find(u => u.email === email);
      if (checkTrung) {
        alert("Email này đã được sử dụng! Vui lòng chọn email khác.");
        return;
      }

      // Lưu trữ tài khoản mới
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
      
      // Reset form đăng ký và quay về giao diện đăng nhập
      $('#form-dang-ky-truc-tiep')[0].reset();
      $('#link-sang-dang-nhap').click();
    });

    // Xử lý nộp form ĐĂNG NHẬP
    $('#form-dang-nhap-truc-tiep').on('submit', function(e) {
      e.preventDefault();

      const email = $('#nhap-email').val().trim();
      const matKhau = $('#nhap-mat-khau').val().trim();

      const danhSachUser = JSON.parse(localStorage.getItem("users")) || [];

      // Tìm kiếm xem tài khoản khớp thông tin không
      const matchedUser = danhSachUser.find(u => u.email === email && u.password === matKhau);

      if (matchedUser) {
        alert("Đăng nhập thành công!");
        sessionStorage.setItem("currentUser", JSON.stringify(matchedUser));
        window.location.href = "index.html"; // Trở về trang chủ
      } else {
        alert("Sai tài khoản hoặc mật khẩu! Vui lòng thử lại.");
      }
    });
  }

  // =========================================================================
  // KHU VỰC 6: CÁC HÀM TRỢ GIÚP DÙNG CHUNG (LỌC PHÒNG & RENDER PHÒNG)
  // =========================================================================

  // Hàm lọc danh sách phòng
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
      // 1. Lọc theo đường phố
      if (duongLoc !== 'all' && phong.street !== duongLoc) return false;

      // 2. Lọc theo giá thuê
      if (phong.price < giaThap || phong.price > giaCao) return false;
      
      // 3. Lọc theo loại phòng
      if (loaiPhongDaChon.length > 0 && !loaiPhongDaChon.includes(phong.type)) return false;

      // 4. Lọc theo danh sách tiện ích
      if (tienIchDaChon.length > 0) {
        const checkTienIch = tienIchDaChon.every(ti => phong.amenities.includes(ti));
        if (!checkTienIch) return false;
      }

      return true;
    });

    // 5. Tiến hành sắp xếp kết quả
    if (sapXep === 'gia-tang') {
      danhSachSauLoc.sort((a, b) => a.price - b.price);
    } else if (sapXep === 'gia-giam') {
      danhSachSauLoc.sort((a, b) => b.price - a.price);
    }

    // Kết xuất giao diện ra màn hình
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
      const thePhongHTML = `
        <div class="card-phong">
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
              <span class="card-phong__gia">${phong.price.toLocaleString()}đ</span>
            </div>
          </div>
        </div>
      `;
      theChua.append(thePhongHTML);
    });
  }

});