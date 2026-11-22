p = 'WORKFLOW.md'
s = open(p, encoding='utf8').read()
a = s.index('## 3b. Làm nhân vật MỚI'); b = s.index('## 4. Chạy lại / mở rộng')
NEW = '''## 3b. Độ tuổi + cách làm nhân vật MỚI từ một ảnh full body (cách chuẩn, dùng cho mọi độ tuổi)

**4 độ tuổi** (yêu cầu người dùng): Thiếu niên ~16 · Thanh niên 20–30 (đã có: `r1` + `hero`) · Trung niên 40–50 · Lão giả 70+ (đã có: `e1` + `e1`).
**Chỉ đổi tóc/đồ trong cùng độ tuổi**: thanh niên chỉ thấy tóc + đồ thanh niên, lão giả chỉ thấy tóc + đồ lão giả. Trong DEV: chọn "Độ tuổi" trước (độ tuổi chưa có thì bị khóa), danh sách "Tóc + gương mặt" và "Trang phục" lọc theo `window.AGES` trong `char8_build_page.py`.

**Cách làm (đã kiểm chứng với lão giả, scripts `elder1..elder4`)**. Ý chính: vẽ **cả người ngồi thiền trong 1 ảnh**, rồi từ chính ảnh đó tách ra (a) outfit **không đầu, chỉ còn cổ** và (b) đầu. Vì cùng một ảnh nên cổ, tóc và vai **khớp tuyệt đối**.
| Bước | Script | Vào -> ra | Lão giả đã chốt |
|---|---|---|---|
| 1 | `elder1_seat.py` | ảnh 1 `ref/pose/mannequin_body_w.png` + ảnh 2 ảnh người dùng gửi (`ref/character/ref_elder.png`) -> `ref/chain/elder_full_s*.png`: nguyên người, tóc, râu, mũ, **nhắm mắt luôn trong prompt**, có tay, không vũ khí | seed **333** (thử 331–334) |
| 2 | `elder2_align_neck.py` | căn theo 2 bàn tay chung `L_hands.png` (scale 1,017) -> `elder_A_full.png`; rồi Qwen Edit **xóa cả đầu, chỉ giữ cổ** (vẽ lại cổ áo/ngực chỗ râu che) -> `elder_neck_s*.png` | seed **342** |
| 3 | `elder3_nohand.py` | xóa 2 bàn tay -> `elder_nohand_s*.png`; in ra độ lệch so với ảnh trước (phase correlation, phải ≈ 0 px) | seed **351** (lệch < 0,1 px) |
| 4 | `elder4_head.py` | **không vẽ lại đầu**: so `elder_A_full` với ảnh chỉ-cổ -> mặt nạ đầu (phần nằm trên cổ + chỗ khác màu do tóc/râu đè lên áo), đóng phần râu trắng trên áo trắng bằng **bao lồi** từ cằm xuống; elip mặt + tai từ vùng da. Ghi `final/character/elder/outfit/O_e1.png`, `hair/H_e1.png` (cả đầu), `hair/F_e1.png` (mặt nạ mặt), `ref/chain/elder_head.json` | – |
| 5 | `char8_build_page.py` | nhúng `ch-of-e1`, `ch-head-e1`, `ch-hmv-e1` (= đầu trừ elip mặt: phần tóc/râu/mũ đung đưa), tâm xoay ở đỉnh trán; khung 640 tính theo nhân vật thanh niên để hai bản cùng tỉ lệ | – |

Làm độ tuổi khác (thiếu niên, trung niên): copy 4 script `elder*`, đổi ảnh ref, prompt (tuổi, tóc, râu, đồ), tên file và seed; chọn seed bằng cách xem ảnh. Thêm vào `L` và `AGES` trong `char8_build_page.py` (khóa ảnh `ch-of-<id>`, `ch-head-<id>`, `ch-hmv-<id>`, CSS tâm xoay `.hair.s-<id>`).
Thêm tóc/đồ mới cho **cùng** độ tuổi: phải giữ đúng vị trí cổ -> dùng `elder_A_full` (hoặc ảnh outfit-chỉ-cổ) của độ tuổi đó làm ảnh 1 khi vẽ.

Đã thử và bỏ:
* (lão giả v1) cắt đầu từ ảnh **đứng** rồi đặt lên outfit **đầu hói**: tóc lệch vai, mặt hói lộ phía sau -> người dùng chê "rất không ổn". Script cũ ở `scripts/_superseded/`, ảnh ở `ref/chain/_elder_v1/` và `final/character/_superseded/elder_v1/` (vẫn nhúng trong trang sao lưu `f-ngoc-hanh-trinh.elder-v1.html`, không xóa).
* Qwen Edit "chỉ vẽ đầu" trên cả khung 1024: model **phóng to đầu** ra giữa khung, mất vị trí (lệch 50–60 px).
* Bàn tay: vẫn dùng chung `L_hands.png` cho mọi độ tuổi.

'''
s = s[:a] + NEW + s[b:]
s = s.replace("4. Nhân vật cho phép người chơi tùy biến (sau này): **kiểu tóc, màu tóc, trang phục, gương mặt**. Vì vậy nhân vật là các layer rời.",
              "4. Nhân vật cho phép người chơi tùy biến (sau này): **kiểu tóc, trang phục, gương mặt**, theo **4 độ tuổi** (thiếu niên ~16, thanh niên 20–30, trung niên 40–50, lão giả 70+); chỉ được đổi tóc/đồ **trong cùng độ tuổi** (xem 3b). Vì vậy nhân vật là các layer rời.")
s = s.replace("demo/            nhân vật DEMO cũ", "  (final/character/elder/  lão giả: outfit/O_e1.png (chỉ cổ, không tay), hair/H_e1.png (cả đầu), hair/F_e1.png (mặt nạ mặt))\ndemo/            nhân vật DEMO cũ")
s = s.replace("| `f-ngoc-hanh-trinh.hero-v1.html` |", "| `f-ngoc-hanh-trinh.elder-v1.html` | bản lão giả v1 (lỗi lệch, chỉ để lưu ảnh đã nhúng) |\n| `f-ngoc-hanh-trinh.hero-v1.html` |")
open(p, 'w', encoding='utf8').write(s)
print('ok')
