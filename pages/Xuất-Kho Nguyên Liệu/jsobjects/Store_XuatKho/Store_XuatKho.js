export default {
    // =======================================================
    // HÀM KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT (Yêu cầu số 1)
    // =======================================================
    kiemTraThongTinPhieu: () => {
        if (!sel_kho_xuat.selectedOptionValue || !sel_xuong_nhan.selectedOptionValue || !sel_don_hang.selectedOptionValue) {
            showAlert("BẮT BUỘC: Vui lòng chọn Kho Xuất, Xưởng Nhận và Mã Đơn Hàng trước khi thêm vật tư!", "error");
            return false;
        }
        return true;
    },

    // =======================================================
    // 1. THÊM TỪ B.O.M
    // =======================================================
    themTuBOM: async () => {
        if (!Store_XuatKho.kiemTraThongTinPhieu()) return;

        let sl_BTP = parseFloat(inp_sl_btp_bom.text) || 0;
        let idBTP = sel_btp_bom.selectedOptionValue;
        if (!idBTP || sl_BTP <= 0 || !sel_ly_do_bom.selectedOptionValue) return showAlert("Nhập đủ thông tin BTP và Lý do!", "warning");

        let dsCon = get_bom_con_theo_btp.data || [];
        if (dsCon.length === 0) return showAlert("BTP này không có nguyên liệu con!", "warning");

        let slDonHang = 0;
        try { 
            let dtDonHang = await get_chi_tiet_don_hang.run() || []; 
            if (dtDonHang.length > 0) slDonHang = parseFloat(dtDonHang[0].so_luong) || 0; 
        } catch (e) {
            console.error("Lỗi lấy SL đơn hàng: ", e);
        }

        let bangTam = appsmith.store.bangTamXK ? [...appsmith.store.bangTamXK] : [];
        let tenNguon = "BTP: " + sel_btp_bom.selectedOptionLabel; 
        let tenLyDo = sel_ly_do_bom.selectedOptionLabel;

        dsCon.forEach(item => {
            let dinhMuc = parseFloat(item.dinh_muc_1_sp || item.dinh_muc) || 0;
            let slThem = parseFloat((dinhMuc * sl_BTP).toFixed(4));
            let idVT = String(item.id_vat_tu).trim();
            let idMau = item.id_mau_sac ? String(item.id_mau_sac).trim() : "NONE";
            
            let tongCanBomGoc = slDonHang > 0 ? (dinhMuc * slDonHang) : 0;
            let idx = bangTam.findIndex(x => String(x.id_vat_tu).trim() === idVT && (x.id_mau_sac ? String(x.id_mau_sac).trim() : "NONE") === idMau && x.nguon_du_lieu === tenNguon && x.ly_do === tenLyDo);

            if (idx > -1) {
                bangTam[idx].yeu_cau_xuat = (parseFloat(bangTam[idx].yeu_cau_xuat) || 0) + slThem;
            } else {
                bangTam.push({
                    id_tam: "_" + Math.random().toString(36).substr(2, 9), id_btp: idBTP, nguon_du_lieu: tenNguon, is_bom: true,
                    id_vat_tu: item.id_vat_tu, vat_tu: item.ma_vat_tu + ' - ' + item.ten_vat_tu,
                    id_mau_sac: item.id_mau_sac, mau_sac: item.ten_mau || item.mau_sac || "NR", 
                    dinh_muc: dinhMuc, yeu_cau_xuat: slThem, thuc_xuat: 0, 
                    tong_can_bom: tongCanBomGoc, dvt: item.ten_dvt || item.dvt || "-",
                    ly_do: tenLyDo, ghi_chu: ""
                });
            }
        });
        await storeValue("bangTamXK", bangTam); 
        await Store_XuatKho.kiemTraDoiChung(); 
        resetWidget("sel_btp_bom", true); resetWidget("inp_sl_btp_bom", true);
    },

    // =======================================================
    // 2. THÊM TỪ THỦ CÔNG
    // =======================================================
    themThuCong: async () => {
        if (!Store_XuatKho.kiemTraThongTinPhieu()) return;
        if (!sel_btp_thu_cong.selectedOptionValue) return showAlert("Chọn Bán Thành Phẩm!", "warning");

        let idBom = sel_vt_thu_cong.selectedOptionValue; 
        let slXuat = parseFloat(inp_sl_thu_cong.text) || 0;
        if (!idBom || slXuat <= 0 || !sel_ly_do_thu_cong.selectedOptionValue) return showAlert("Nhập đủ thông tin Vật tư và Số lượng!", "warning");

        let itemVT = (get_nl_thu_cong.data || []).find(x => x.id_bom === idBom);
        let bangTam = appsmith.store.bangTamXK ? [...appsmith.store.bangTamXK] : [];
        let tenNguon = "Thủ Công"; 
        let tenLyDo = sel_ly_do_thu_cong.selectedOptionLabel;

        let idx = bangTam.findIndex(x => String(x.id_vat_tu).trim() === String(itemVT.id_vat_tu).trim() && (x.id_mau_sac ? String(x.id_mau_sac).trim() : "NONE") === (itemVT.id_mau_sac ? String(itemVT.id_mau_sac).trim() : "NONE") && x.nguon_du_lieu === tenNguon && x.ly_do === tenLyDo);

        if (idx > -1) { 
            bangTam[idx].yeu_cau_xuat = (parseFloat(bangTam[idx].yeu_cau_xuat) || 0) + slXuat; 
        } else {
            bangTam.push({
                id_tam: "_" + Math.random().toString(36).substr(2, 9), id_btp: sel_btp_thu_cong.selectedOptionValue, nguon_du_lieu: tenNguon, is_bom: false,
                id_vat_tu: itemVT.id_vat_tu, vat_tu: itemVT.ten_vat_tu, id_mau_sac: itemVT.id_mau_sac, mau_sac: itemVT.mau_sac,
                dinh_muc: parseFloat(itemVT.dinh_muc) || 0, yeu_cau_xuat: slXuat, thuc_xuat: 0, 
                tong_can_bom: 0, dvt: itemVT.dvt || "-", ly_do: tenLyDo, ghi_chu: "" 
            });
        }
        await storeValue("bangTamXK", bangTam); 
        await Store_XuatKho.kiemTraDoiChung(); 
        resetWidget("sel_vt_thu_cong", true); resetWidget("inp_sl_thu_cong", true); 
    },

    // =======================================================
    // 3. THÊM TỪ KHÁC
    // =======================================================
    themKhac: async () => {
        if (!Store_XuatKho.kiemTraThongTinPhieu()) return;

        let idVatTu = sel_vt_khac.selectedOptionValue; 
        let slXuat = parseFloat(inp_sl_khac.text) || 0;
        if (!idVatTu || slXuat <= 0 || !sel_ly_do_khac.selectedOptionValue) return showAlert("Nhập đủ thông tin Vật tư và Số lượng!", "warning");

        let bangTam = appsmith.store.bangTamXK ? [...appsmith.store.bangTamXK] : [];
        let tenNguon = "Khác"; 
        let tenLyDo = sel_ly_do_khac.selectedOptionLabel;
        let idMau = sel_mau_khac.selectedOptionValue ? String(sel_mau_khac.selectedOptionValue).trim() : "NONE";

        let idx = bangTam.findIndex(x => String(x.id_vat_tu).trim() === String(idVatTu).trim() && (x.id_mau_sac ? String(x.id_mau_sac).trim() : "NONE") === idMau && x.nguon_du_lieu === tenNguon && x.ly_do === tenLyDo);

        if (idx > -1) { 
            bangTam[idx].yeu_cau_xuat = (parseFloat(bangTam[idx].yeu_cau_xuat) || 0) + slXuat; 
        } else {
            bangTam.push({
                id_tam: "_" + Math.random().toString(36).substr(2, 9), id_btp: null, nguon_du_lieu: tenNguon, is_bom: false,
                id_vat_tu: idVatTu, vat_tu: sel_vt_khac.selectedOptionLabel, id_mau_sac: sel_mau_khac.selectedOptionValue || null, mau_sac: sel_mau_khac.selectedOptionLabel || "NR",
                dinh_muc: 0, yeu_cau_xuat: slXuat, thuc_xuat: 0, 
                tong_can_bom: 0, dvt: "N/A", ly_do: tenLyDo, ghi_chu: inp_ghi_chu_khac.text || ""
            });
        }
        await storeValue("bangTamXK", bangTam); 
        await Store_XuatKho.kiemTraDoiChung(); 
        resetWidget("sel_vt_khac", true); resetWidget("sel_mau_khac", true); resetWidget("inp_sl_khac", true);
    },

    // =======================================================
    // 4. XÓA DÒNG TẠM
    // =======================================================
    xoaDong: async (idTam) => {
        let bangTam = appsmith.store.bangTamXK ? [...appsmith.store.bangTamXK] : [];
        await storeValue("bangTamXK", bangTam.filter(x => x.id_tam !== idTam));
        await Store_XuatKho.kiemTraDoiChung(); 
    },

    // =======================================================
    // 5. BỘ NÃO ĐỐI CHỨNG: KẾ THỪA TỒN KHO & NHUỘM MÀU
    // =======================================================
    kiemTraDoiChung: async () => {
        let dataDoiChung = []; let coLoiDo = false; 
        try { dataDoiChung = await get_ton_kho_va_da_xuat.run() || []; } catch (e) {
            console.error("Lỗi đối chứng tồn kho: ", e);
        }

        let bangTam = appsmith.store.bangTamXK ? [...appsmith.store.bangTamXK] : [];
        let quyTonKho = {};
        
        dataDoiChung.forEach(d => {
            let idVT = String(d.id_vat_tu).trim();
            let idMau = d.id_mau_sac_clean ? String(d.id_mau_sac_clean).trim() : "NONE";
            let key = idVT + '_' + idMau;
            quyTonKho[key] = {
                ton_thuc_te: parseFloat(d.ton_thuc_te) || 0,
                da_xuat: parseFloat(d.da_xuat) || 0,
                kha_dung_con_lai: parseFloat(d.ton_kha_dung) || 0 
            };
        });

        bangTam.forEach(row => {
            let key = String(row.id_vat_tu).trim() + '_' + (row.id_mau_sac ? String(row.id_mau_sac).trim() : "NONE");
            let ton = quyTonKho[key] || { ton_thuc_te: 0, kha_dung_con_lai: 0, da_xuat: 0 };
            
            row.ton_thuc_te = ton.ton_thuc_te;
            row.da_xuat = ton.da_xuat;
            row.ton_kha_dung_hien_tai = ton.kha_dung_con_lai;

            let yeuCau = parseFloat(row.yeu_cau_xuat) || 0;
            let thucXuatDuKien = yeuCau;
            row.mau_nen = "#ffffff"; 
            let biGiamDoBOM = false;
            let tongCanBom = parseFloat(row.tong_can_bom) || 0;

            let isSX = String(row.ly_do).toUpperCase().includes("SX") || String(row.ly_do).toUpperCase().includes("SẢN XUẤT");
            if (isSX && tongCanBom > 0) {
                let maxChoPhep = Math.max(0, tongCanBom - ton.da_xuat);
                if (thucXuatDuKien > maxChoPhep) {
                    thucXuatDuKien = maxChoPhep;
                    biGiamDoBOM = true; 
                }
            }

            if (thucXuatDuKien > ton.kha_dung_con_lai) {
                row.thuc_xuat = ton.kha_dung_con_lai; 
                ton.kha_dung_con_lai = 0; 
                row.mau_nen = "#fee2e2"; 
                coLoiDo = true; 
            } else {
                row.thuc_xuat = thucXuatDuKien;
                ton.kha_dung_con_lai -= thucXuatDuKien; 
                if (biGiamDoBOM) row.mau_nen = "#dcfce3"; 
            }
        });

        await storeValue("bangTamXK", bangTam);
        await storeValue("khoa_nut_luu", coLoiDo); 
    },

    // =======================================================
    // 6. LÀM MỚI BẢNG REAL-TIME
    // =======================================================
    lamMoiTonKho: async () => {
        if (!sel_kho_xuat.selectedOptionValue) {
            return showAlert("Vui lòng chọn Kho Xuất trước khi làm mới!", "warning");
        }
        try {
            await get_ton_kho_va_da_xuat.run({ id_kho_param: sel_kho_xuat.selectedOptionValue });
            await Store_XuatKho.kiemTraDoiChung();
            showAlert("Đã cập nhật Tồn Kho mới nhất!", "success");
        } catch (error) { 
            showAlert("Lỗi làm mới: " + error.message, "error"); 
        }
    },
        
    // =======================================================
    // 7. LƯU PHIẾU XUẤT KHO VÀO DATABASE (ĐÃ FIX LỖI ẢO)
    // =======================================================
    luuPhieu: async () => {
        if (!inp_ma_phieu_xuat.text || !sel_kho_xuat.selectedOptionValue || !sel_xuong_nhan.selectedOptionValue) {
            return showAlert("Vui lòng điền đủ Mã phiếu, Kho xuất và Xưởng nhận!", "error");
        }
        
        let bangTam = appsmith.store.bangTamXK || []; 
        let dsLuu = bangTam.filter(x => parseFloat(x.thuc_xuat) > 0);
        
        if (dsLuu.length === 0) return showAlert("Tất cả các dòng đều có số lượng xuất = 0. Không có gì để lưu!", "error");
        
        try {
            // Chạy query lưu phiếu xuống Database
            await ins_phieu_xuat_kho.run({ chi_tiet: dsLuu }); 
            showAlert("🎉 Lưu Phiếu Xuất Kho thành công!", "success");
            
            // Dọn dẹp bảng tạm và giao diện sau khi lưu xong
            await storeValue("bangTamXK", []); 
            resetWidget("inp_ghi_chu_phieu", true); 
            resetWidget("inp_nguoi_nhan", true);
            
        } catch (error) { 
            // ĐÃ SỬA: Hiển thị ĐÚNG nội dung mà Database "chửi" ra màn hình
            console.error("Lỗi gốc từ Database:", error);
            showAlert("Lỗi Database: " + (error.message || "Không thể lưu phiếu"), "error"); 
        }
    }
}