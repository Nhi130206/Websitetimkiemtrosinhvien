// ==================== KHỞI TẠO DỮ LIỆU ====================
if (!localStorage.getItem("users")) localStorage.setItem("users", "[]");
if (!localStorage.getItem("rooms")) localStorage.setItem("rooms", "[]");

// Helper: lấy danh sách phòng
const layDSPhong = () => JSON.parse(localStorage.getItem("rooms"));
// Helper: lấy user hiện tại
const currentUser = () => JSON.parse(sessionStorage.getItem("currentUser"));

// ==================== CẬP NHẬT HEADER ====================
function capNhatHeader() {
  const user = currentUser();
  const $vung = $("#vung-hanh-dong");
  if (!$vung.length) return;

  if (user) {
    const kyTu = user.name ? user.name.charAt(0).toUpperCase() : "?";
    const avatar = user.avatar
      ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
      : kyTu;
    let menu =
      user.role === "landlord"
        ? '<a href="dang-tin.html" class="btn btn--landlord">Đăng tin trọ</a>'
        : "";
    menu += `<div class="user-profile-header"><a href="thong-tin.html" class="user-avatar">${avatar}</a></div>`;
    $vung.html(menu);
  } else {
    $vung.html(`
      <a href="dang-nhap.html" class="btn btn--landlord">Cho chủ trọ</a>
      <a href="dang-nhap.html" class="btn btn--login">Đăng nhập</a>
    `);
  }
}

// ==================== GUARD CHO NÚT ĐĂNG TIN ====================
$(document).on("click", 'a[href="dang-tin.html"]', function (e) {
  const user = currentUser();
  if (!user || user.role !== "landlord") {
    e.preventDefault();
    alert(
      "⚠️ Chỉ chủ trọ mới được đăng tin. Vui lòng đăng nhập tài khoản chủ trọ.",
    );
  }
});

// ==================== HIỂN THỊ DANH SÁCH PHÒNG (DÙNG TEMPLATE) ====================
function hienThiPhong(ds, containerId) {
  const $container = $(containerId);
  $container.empty();
  if (!ds.length) {
    $container.html(
      '<p class="thong-bao-trong">Không có phòng trọ phù hợp.</p>',
    );
    return;
  }
  const template = document.getElementById("mau-card-phong");
  ds.forEach((p) => {
    const clone = document.importNode(template.content, true);
    const $clone = $(clone);
    $clone.find(".card-phong").attr("href", `chi-tiet.html?id=${p.id}`);
    $clone.find(".card-phong__nhan").text(p.tag);
    if (p.image) {
      $clone.find(".card-phong__anh-that").attr("src", p.image).show();
      $clone.find(".room-image-placeholder").hide();
    }
    $clone.find(".card-phong__tieu-de").text(p.title);
    $clone.find(".card-phong__dia-chi").text(`📍 ${p.address}`);
    $clone.find(".card-phong-dien-tich").text(`📐 ${p.area} m²`);
    const loaiText =
      p.type === "single"
        ? "🚪 Phòng đơn"
        : p.type === "double"
          ? "🚪 Phòng đôi"
          : "🚪 Ký túc xá";
    $clone.find(".card-phong-loai-phong").text(loaiText);
    $clone.find(".card-phong__gia").text(`${p.price.toLocaleString()}đ`);
    $container.append($clone);
  });
}

// ==================== LỌC & SẮP XẾP (TRANG TÌM KIẾM) ====================
function locVaHienThi() {
  let ds = layDSPhong();
  const duong = $("#chon-duong").val();
  const giaMin = parseInt($("#loc-gia-thap").val()) || 0;
  const giaMax = parseInt($("#loc-gia-cao").val()) || 1e12;
  const loaiChon = $(".loc-loai-phong:checked")
    .map((i, el) => $(el).val())
    .get();
  const tienIchChon = $(".loc-tien-ich:checked")
    .map((i, el) => $(el).val())
    .get();
  const sapXep = $("#sap-xep").val();

  ds = ds.filter((p) => {
    if (duong !== "all" && p.street !== duong) return false;
    if (p.price < giaMin || p.price > giaMax) return false;
    if (loaiChon.length && !loaiChon.includes(p.type)) return false;
    if (
      tienIchChon.length &&
      !tienIchChon.every((ti) => p.amenities.includes(ti))
    )
      return false;
    return true;
  });
  if (sapXep === "gia-tang") ds.sort((a, b) => a.price - b.price);
  if (sapXep === "gia-giam") ds.sort((a, b) => b.price - a.price);
  hienThiPhong(ds, "#danh-sach-tim-kiem");
  $("#so-luong-phong").text(`Tìm thấy ${ds.length} phòng trọ`);
}

// ==================== TRANG CHI TIẾT ====================
function napChiTiet(phong) {
  $("#duong-dan-tieu-de, #chi-tiet-ten").text(phong.title);
  document.title = `${phong.title} - NhaTroSV`;
  $("#chi-tiet-dia-chi").text(`📍 ${phong.address}`);
  $("#chi-tiet-rating").html(`★ ${phong.rating} (24 đánh giá)`);
  $("#chi-tiet-tag").text(phong.tag);
  if (phong.image) {
    $("#chi-tiet-anh").attr("src", phong.image).show();
    $("#khung-anh-phong .room-image-placeholder").hide();
  }
  $("#thongso-dien-tich").text(`${phong.area} m²`);
  const loaiText =
    phong.type === "single" ? "Đơn" : phong.type === "double" ? "Đôi" : "KTX";
  $("#thongso-loai").text(loaiText);
  $("#thongso-rating").text(`${phong.rating}/5`);

  const tienDien = (phong.electricPrice || 3500) * 100;
  const tienNuoc = phong.waterPrice || 100000;
  const tienWifi = phong.wifiPrice || 100000;
  const tong =
    phong.price + phong.deposit / 12 + tienDien + tienNuoc + tienWifi + 150000;
  $("#chiphi-thue").text(`${phong.price.toLocaleString()}đ`);
  $("#chiphi-coc").text(`${phong.deposit.toLocaleString()}đ`);
  $("#chiphi-dien").text(`${tienDien.toLocaleString()}đ`);
  $("#chiphi-nuoc").text(`${tienNuoc.toLocaleString()}đ`);
  $("#chiphi-wifi").text(`${tienWifi.toLocaleString()}đ`);
  $("#chiphi-tong").text(`${Math.round(tong).toLocaleString()}đ`);

  $("#tienich-wifi").text(
    phong.amenities.includes("wifi") ? "✔️ Wifi miễn phí" : "❌ Không có Wifi",
  );
  $("#tienich-gac").text(
    phong.amenities.includes("gac_lung")
      ? "✔️ Có gác lửng"
      : "❌ Không gác lửng",
  );
  $("#tienich-maygiat").text(
    phong.amenities.includes("may_giat")
      ? "✔️ Có máy giặt chung"
      : "❌ Không máy giặt",
  );

  $("#lien-he-gia").text(`${phong.price.toLocaleString()}đ`);
  let landlordName = "Chủ trọ",
    landlordPhone = "0901234567";
  if (phong.landlordId) {
    const users = JSON.parse(localStorage.getItem("users"));
    const landlord = users.find((u) => u.id === phong.landlordId);
    if (landlord) {
      landlordName = landlord.name;
      landlordPhone = landlord.phone;
    }
  }
  $("#lien-he-ten").text(landlordName);
  $("#lien-he-btn-goi")
    .off()
    .click(() => alert(`SĐT liên hệ: ${landlordPhone}`));
  $("#lien-he-btn-nhan")
    .off()
    .click(() => alert("Hộp thư đang kết nối trực tuyến"));
  $("#lien-he-btn-datlich")
    .off()
    .click(() => alert("Đặt lịch hẹn xem phòng thành công"));

  const map = L.map("ban-do-chi-tiet").setView([phong.lat, phong.lng], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  L.marker([phong.lat, phong.lng]).addTo(map).bindPopup(phong.title);
}

// ==================== TRANG BẢN ĐỒ ====================
function khoiTaoBanDo() {
  if (!$("#ban-do-chinh").length) return;
  let map = L.map("ban-do-chinh").setView([12.65067, 108.02621], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  let markers = [];

  function capNhatGhim(ds) {
    markers.forEach((m) => map.removeLayer(m));
    markers = [];
    ds.forEach((p) => {
      const m = L.marker([p.lat, p.lng]).addTo(map);
      m.bindPopup(
        `<strong>${p.title}</strong><br>${p.price.toLocaleString()}đ/tháng`,
      );
      m.on("click", () => {
        $("#chon-tag").text(p.tag);
        $("#chon-title").text(p.title);
        $("#chon-address").text(`📍 ${p.address}`);
        $("#chon-area").text(`📐 ${p.area} m²`);
        $("#chon-price").text(`${p.price.toLocaleString()}đ/tháng`);
        $("#chon-link").attr("href", `chi-tiet.html?id=${p.id}`);
        $("#the-phong-chon").fadeIn(200);
      });
      markers.push(m);
    });
    $("#so-luong-ban-do").text(ds.length);
  }
  $("#loc-duong-ban-do").on("change", function () {
    let ds = layDSPhong();
    const loc = $(this).val();
    if (loc !== "all") ds = ds.filter((p) => p.street === loc);
    capNhatGhim(ds);
    $("#the-phong-chon").fadeOut(100);
  });
  $("#nut-dong-the").click(() => $("#the-phong-chon").fadeOut(200));
  capNhatGhim(layDSPhong());
}

// ==================== TRANG ĐĂNG TIN ====================
function khoiTaoDangTin() {
  if (!$("#form-dang-tin").length) return;
  const user = currentUser();
  if (!user || user.role !== "landlord") {
    alert("Vui lòng đăng nhập tài khoản CHỦ TRỌ để đăng tin!");
    window.location.href = "dang-nhap.html";
    return;
  }
  let hinhAnhBase64 = "";
  $("#dang-anh").on("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 600;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        canvas
          .getContext("2d")
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        hinhAnhBase64 = canvas.toDataURL("image/jpeg", 0.7);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
  $("#form-dang-tin").on("submit", function (e) {
    e.preventDefault();
    if (!hinhAnhBase64) {
      alert("Vui lòng tải ảnh phòng trọ!");
      return;
    }
    const phongMoi = {
      id: Date.now(),
      title: $("#dang-tieu-de").val().trim(),
      address: $("#dang-dia-chi").val().trim(),
      street: $("#dang-duong").val(),
      price: parseInt($("#dang-gia").val()),
      deposit: parseInt($("#dang-coc").val()),
      area: parseInt($("#dang-dien-tich").val()),
      type: $("#dang-loai-phong").val(),
      rating: 5.0,
      tag: `Còn ${$("#dang-so-luong").val().trim()} phòng`,
      amenities: $(".tien-ich-dang:checked")
        .map((i, el) => $(el).val())
        .get(),
      image: hinhAnhBase64,
      lat: 12.65067 + (Math.random() - 0.5) * 0.012,
      lng: 108.02621 + (Math.random() - 0.5) * 0.012,
      landlordId: user.id,
      createdAt: Date.now(),
      electricPrice: parseInt($("#dang-gia-dien").val()) || 3500,
      waterPrice: parseInt($("#dang-gia-nuoc").val()) || 100000,
      wifiPrice: parseInt($("#dang-gia-wifi").val()) || 100000,
      parkingPrice: 150000,
    };
    const ds = layDSPhong();
    ds.push(phongMoi);
    localStorage.setItem("rooms", JSON.stringify(ds));
    alert("Đăng tin thành công!");
    window.location.href = "tim-kiem.html";
  });
}

// ==================== TRANG ĐĂNG NHẬP / ĐĂNG KÝ ====================
function khoiTaoDangNhap() {
  if (!$("#khung-dang-nhap").length) return;
  $("#khung-dang-ky").hide();
  $("#link-sang-dang-ky").click((e) => {
    e.preventDefault();
    $("#khung-dang-nhap").hide();
    $("#khung-dang-ky").fadeIn(200);
  });
  $("#link-sang-dang-nhap").click((e) => {
    e.preventDefault();
    $("#khung-dang-ky").hide();
    $("#khung-dang-nhap").fadeIn(200);
  });

  $("#form-dang-ky-truc-tiep").submit((e) => {
    e.preventDefault();
    const ten = $("#ky-ten").val().trim();
    const email = $("#ky-email").val().trim();
    const sdt = $("#ky-sodt").val().trim();
    const pass = $("#ky-mat-khau").val().trim();
    const role = $("#ky-vai-tro").val();
    if (!ten || !email || !sdt || !pass) {
      alert("Nhập đủ thông tin");
      return;
    }
    if (pass.length < 4) {
      alert("Mật khẩu ≥4 ký tự");
      return;
    }
    let users = JSON.parse(localStorage.getItem("users"));
    if (users.find((u) => u.email === email)) {
      alert("Email đã tồn tại");
      return;
    }
    users.push({
      id: Date.now(),
      name: ten,
      email,
      phone: sdt,
      password: btoa(pass),
      role,
    });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Đăng ký thành công! Vui lòng đăng nhập.");
    $("#form-dang-ky-truc-tiep")[0].reset();
    $("#khung-dang-ky").hide();
    $("#khung-dang-nhap").fadeIn(200);
  });

  $("#form-dang-nhap-truc-tiep").submit((e) => {
    e.preventDefault();
    const email = $("#nhap-email").val().trim();
    const pass = $("#nhap-mat-khau").val().trim();
    const users = JSON.parse(localStorage.getItem("users"));
    const user = users.find(
      (u) => u.email === email && u.password === btoa(pass),
    );
    if (user) {
      alert("Đăng nhập thành công");
      sessionStorage.setItem("currentUser", JSON.stringify(user));
      window.location.href = "index.html";
    } else alert("Sai email hoặc mật khẩu");
  });
}

// ==================== TRANG THÔNG TIN CÁ NHÂN ====================
function khoiTaoThongTin() {
  if (!$(".trang-thong-tin").length) return;
  let user = currentUser();
  if (!user) {
    window.location.href = "dang-nhap.html";
    return;
  }
  $("#sua-ten").val(user.name || "");
  $("#sua-email").val(user.email || "");
  $("#sua-sdt").val(user.phone || "");
  $("#hien-doi-tuong").text(user.role === "landlord" ? "Chủ trọ" : "Sinh viên");

  function hienThiAvatar() {
    if (user.avatar)
      $("#hien-thi-avatar").html(`<img src="${user.avatar}" alt="avatar">`);
    else
      $("#hien-thi-avatar").text(
        user.name ? user.name.charAt(0).toUpperCase() : "?",
      );
  }
  hienThiAvatar();

  $("#input-avatar").on("change", function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      user.avatar = e.target.result;
      sessionStorage.setItem("currentUser", JSON.stringify(user));
      hienThiAvatar();
      $("#avatar-header").html(
        `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`,
      );
    };
    reader.readAsDataURL(file);
  });

  $("#btn-luu").click(() => {
    user.name = $("#sua-ten").val().trim();
    user.email = $("#sua-email").val().trim();
    user.phone = $("#sua-sdt").val().trim();
    sessionStorage.setItem("currentUser", JSON.stringify(user));
    let users = JSON.parse(localStorage.getItem("users"));
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) users[idx] = user;
    localStorage.setItem("users", JSON.stringify(users));
    hienThiAvatar();
    $("#thong-bao-luu").fadeIn(200).delay(2000).fadeOut(400);
  });

  $("#btn-dang-xuat").click(() => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      sessionStorage.removeItem("currentUser");
      window.location.href = "index.html";
    }
  });
}

// ==================== KHỞI TẠO THEO TRANG ====================
$(document).ready(() => {
  capNhatHeader();

  // Trang chủ
  if ($("#danh-sach-tro").length) {
    hienThiPhong(layDSPhong(), "#danh-sach-tro");
    $("#btn-tim").click(() => {
      sessionStorage.setItem("duongChuyenTiep", $("#chon-duong").val());
      window.location.href = "tim-kiem.html";
    });
  }

  // Trang tìm kiếm
  if ($("#danh-sach-tim-kiem").length) {
    const duong = sessionStorage.getItem("duongChuyenTiep");
    if (duong) {
      $("#chon-duong").val(duong);
      sessionStorage.removeItem("duongChuyenTiep");
    }
    locVaHienThi();
    $(
      "#chon-duong, #loc-gia-thap, #loc-gia-cao, #sap-xep, .loc-loai-phong, .loc-tien-ich",
    ).on("change keyup", locVaHienThi);
    $("#nut-dat-lai").click(() => {
      $("#chon-duong").val("all");
      $("#loc-gia-thap").val("0");
      $("#loc-gia-cao").val("100000000000");
      $(".loc-loai-phong, .loc-tien-ich").prop("checked", false);
      $("#sap-xep").val("mac-dinh");
      locVaHienThi();
    });
  }

  // Trang bản đồ
  khoiTaoBanDo();

  // Trang đăng tin
  khoiTaoDangTin();

  // Trang đăng nhập
  khoiTaoDangNhap();

  // Trang chi tiết
  if ($("#chi-tiet-trang").length) {
    const id = new URLSearchParams(window.location.search).get("id");
    const phong = layDSPhong().find((p) => String(p.id) === String(id));
    if (!phong) {
      alert("Không tìm thấy phòng trọ");
      window.location.href = "tim-kiem.html";
    } else napChiTiet(phong);
  }

  // Trang thông tin cá nhân
  khoiTaoThongTin();
});
