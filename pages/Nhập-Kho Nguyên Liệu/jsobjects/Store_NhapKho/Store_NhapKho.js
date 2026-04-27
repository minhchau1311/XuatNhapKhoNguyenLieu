export default {
	// Khởi tạo mảng rỗng nếu chưa có dữ liệu
	bangTamNK: appsmith.store.bangTamNK || [],

	// ----------------------------------------------------
	// 1. LƯU THỦ CÔNG (Đã fix đồng bộ bảng & Màu sắc)
	// ----------------------------------------------------
	themThuCong: () => {
		const idKho = sel_kho.selectedOptionValue;
		const idDoiTac = sel_don_vi_giao_hang.selectedOptionValue;
		const nguoiGiao = inp_nguoi_giao.text || ""; 

		const idVatTuChon = sel_vat_tu.selectedOptionValue;
		if (!idVatTuChon) return showAlert("❌ Vui lòng chọn Vật tư!", "warning");

		const dsVatTu = get_opt_vat_tu_all.data || [];
		const itemVatTu = dsVatTu.find(item => item.value === idVatTuChon) || {};
		const dvt = itemVatTu.ten_dvt || ""; 
		
		const idMau = sel_mau_sac.selectedOptionValue;
		const tenMau = sel_mau_sac.selectedOptionLabel;
		const soLuong = Number(inp_so_luong_thuc_nhan.text); 

		if (!idKho || !idDoiTac) return showAlert("❌ Vui lòng chọn Kho và Đơn vị giao hàng ở Vỏ phiếu!", "warning");
		if (soLuong <= 0) return showAlert("❌ Vui lòng nhập số lượng > 0!", "warning");

		// TUYỆT CHIÊU ÉP BẢNG PHẢI RENDER LẠI (Tạo mảng mới hoàn toàn)
		let dataMoi = appsmith.store.bangTamNK ? [...appsmith.store.bangTamNK] : [];
		
		dataMoi.push({
			nguon_nhap: "Thủ Công",
			nguoi_giao: nguoiGiao,
			id_kho: idKho,
			id_doi_tac: idDoiTac,
			id_phieu_mua: null,
			id_chi_tiet_mua: null,
			id_vat_tu: idVatTuChon,
			vat_tu: sel_vat_tu.selectedOptionLabel,
			dvt: dvt,
			id_mau_sac: idMau || null, 
			mau_sac: tenMau || "/", 
			so_luong: soLuong,
			ghi_chu: inp_ghi_chu_dong.text || "" 
		});

		// Lưu đè lại vào Store
		storeValue("bangTamNK", dataMoi);
		this.bangTamNK = dataMoi;
		
		resetWidget("sel_vat_tu", true);
		resetWidget("sel_mau_sac", true);
		resetWidget("inp_so_luong_thuc_nhan", true); 
		resetWidget("inp_ghi_chu_dong", true);      
		showAlert("✅ Đã thêm món thủ công!", "success");
	},

	// ----------------------------------------------------
	// 2. LƯU TỪ PHIẾU MUA (MODAL)
	// ----------------------------------------------------
	themTuPhieu: () => {
		const idKho = sel_kho.selectedOptionValue;
		const idDoiTac = sel_don_vi_giao_hang.selectedOptionValue;
		const nguoiGiao = inp_nguoi_giao.text || ""; 
		
		const idPhieuMua = sel_po_nguon.selectedOptionValue;
		const idChiTietChon = sel_modal_vat_tu.selectedOptionValue;
		
		const dsVatTu = get_chi_tiet_phieu_mua.data || [];
		const itemDaChon = dsVatTu.find(item => item.value === idChiTietChon); 
		
		const soLuongNhan = Number(Input1.text); 

		if (!idKho || !idDoiTac) return showAlert("❌ Vui lòng đóng Modal, chọn Kho và Đơn vị giao ở ngoài trước!", "warning");
		if (!idPhieuMua || !itemDaChon || soLuongNhan <= 0) return showAlert("❌ Vui lòng chọn đủ thông tin trong Modal!", "warning");

		const labelPO = sel_po_nguon.selectedOptionLabel || "";
		const maPO_NganGon = labelPO.split(" ||| ")[0]; 

		// TUYỆT CHIÊU ÉP BẢNG PHẢI RENDER LẠI
		let dataMoi = appsmith.store.bangTamNK ? [...appsmith.store.bangTamNK] : [];
		
		dataMoi.push({
			nguon_nhap: "PO: " + maPO_NganGon,
			nguoi_giao: nguoiGiao,
			id_kho: idKho,
			id_doi_tac: idDoiTac,
			id_phieu_mua: idPhieuMua,
			id_chi_tiet_mua: itemDaChon.value, 
			id_vat_tu: itemDaChon.id_vat_tu, 
			vat_tu: itemDaChon.label,
			dvt: itemDaChon.ten_dvt || "",
			id_mau_sac: itemDaChon.id_mau_sac || null, 
			mau_sac: itemDaChon.ten_mau || "/", 
			so_luong: soLuongNhan,
			ghi_chu: inp_modal_ghi_chu.text || ""
		});

		// Lưu đè lại vào Store
		storeValue("bangTamNK", dataMoi);
		this.bangTamNK = dataMoi;
		
		resetWidget("sel_modal_vat_tu", true);
		resetWidget("Input1", true); 
		resetWidget("inp_modal_ghi_chu", true);
		showAlert("✅ Đã thêm từ PO vào nháp!", "success");
	},

	// ----------------------------------------------------
	// 3. NÚT REFRESH TỔNG
	// ----------------------------------------------------
	lamMoiToanBo: () => {
		this.bangTamNK = [];
		storeValue("bangTamNK", []);
		resetWidget("inp_ma_phieu_nhap", true); 
		resetWidget("sel_kho", true);
		resetWidget("sel_don_vi_giao_hang", true);
		resetWidget("inp_nguoi_giao", true);
		resetWidget("sel_vat_tu", true);
		resetWidget("sel_mau_sac", true);
		resetWidget("inp_so_luong_thuc_nhan", true); 
		resetWidget("inp_ghi_chu_dong", true);
		showAlert("🧹 Đã làm mới toàn bộ form nhập liệu", "info");
	},

	// ----------------------------------------------------
	// 4. XÓA 1 DÒNG TRONG BẢNG TẠM
	// ----------------------------------------------------
	xoaDong: (index) => {
		// Clone mảng cũ ra, xóa phần tử, rồi lưu đè lại
		let dataMoi = appsmith.store.bangTamNK ? [...appsmith.store.bangTamNK] : [];
		dataMoi.splice(index, 1);
		
		storeValue("bangTamNK", dataMoi);
		this.bangTamNK = dataMoi;
		showAlert("🗑️ Đã xóa món khỏi danh sách!", "success");
	},

	// ----------------------------------------------------
	// 5. LƯU VÀO DATABASE (KHAI HỎA)
	// ----------------------------------------------------
	luuVaoDatabase: () => {
		let currentData = appsmith.store.bangTamNK || [];
		
		if (currentData.length === 0) {
			return showAlert("❌ Bảng tạm đang trống, hãy thêm vật tư trước!", "warning");
		}
		if (!inp_ma_phieu_nhap.text) {
			return showAlert("❌ Vui lòng gõ Mã Phiếu Nhập ở góc trên cùng!", "warning");
		}

		luu_du_lieu_nhap_kho.run()
			.then(() => {
				showAlert("✅ XUẤT SẮC! Đã lưu dữ liệu vào hệ thống. Người lập: " + appsmith.user.email, "success");
				this.lamMoiToanBo();
			})
			.catch((error) => {
				showAlert("❌ Lỗi khi lưu DB: " + error.message, "error");
			});
	}
};