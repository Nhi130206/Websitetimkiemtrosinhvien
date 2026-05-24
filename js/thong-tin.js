$(document).ready(function () {
  var currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

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
});
