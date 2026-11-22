p='WORKFLOW.md'
s=open(p,encoding='utf8').read()
add='''### C. Nhân vật thứ 2: Lão giả (đã làm, chọn trong nút DEV)
Ảnh gốc `ref/character/ref_elder.png` (ông già tóc/râu bạc, thanh bào). Trong DEV: "Tóc + gương mặt" (r1 thanh niên / e1 lão giả) và "Trang phục" (hero / elder) chọn **độc lập** được (khóa ảnh `ch-head-e1`, `ch-hm-e1`, `ch-hmv-e1`, `ch-of-elder`; dùng lại bàn tay, hạt châu, mọi CSS).
| Bước | Script | Ghi chú |
|---|---|---|
| C1 | `char9_elder.py` | cắt đầu (hộp 352,0,672,320) -> Qwen Edit vẽ chỉ đầu + râu + tóc bạc + mũ/trâm, **nhắm mắt ngay trong 1 lệnh**; seed 301–304, chốt **302** (`ref/chain/elder_s302.png`) |
| C2 | `char10_elder_seat.py` | tư thế ngồi (ảnh 1 mannequin, ảnh 2 ông già) nhưng **đầu hói, không râu**; seed 311–313, chốt **312** |
| C3 | `char11_elder_outfit.py` | căn tay theo `L_hands.png` (scale 1,043) + bỏ tay (seed 321–323, chốt **322**) -> sao chép thủ công thành `final/character/hero/outfit/B_outfit_elder.png` |
| C4 | `char12_elder_split.py` | đầu đặt vào cùng hộp (303,0,743,440); tách mặt bằng **elip hình học** (tâm 513,150; 63x80) vì râu trắng làm tách theo màu da sai; trâm vàng chỉ ở y<75; lưu thêm `L_headfull_e1.png` (đầu nguyên, không vệt nối) |
| C5 | `char8_build_page.py` | đã mở rộng 2 kiểu đầu (r1,e1) + 2 trang phục; khung (tỉ lệ) tính theo nhân vật gốc để không đổi |

'''
s=s.replace('## 4. Chạy lại / mở rộng',add+'## 4. Chạy lại / mở rộng',1)
open(p,'w',encoding='utf8').write(s)
