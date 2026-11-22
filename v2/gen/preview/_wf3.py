p = 'WORKFLOW.md'
s = open(p, encoding='utf8').read()
for n in ('B_outfit', 'L_hands', 'glow_gold', 'glow', 'O_e1', 'H_e1', 'F_e1', 'L_face_r1', 'L_hair_r1', 'L_orn_r1'):
    s = s.replace(n + '.png', n + '.webp')
s = s.replace('final/elements/<tên>.png', 'final/elements/<tên>.webp')
s = s.replace("2. **Không dùng SVG** làm asset.",
              "2. **Không dùng SVG** làm asset.\n2b. **Ảnh trong `final/` (ảnh đưa lên game) chỉ để dạng `.webp` lossless, không giữ PNG** (tránh nhầm). Script gen ghi webp ngay (`scripts/webpio.py: save_webp`); ComfyUI trả PNG thì đổi ngay lúc lưu. Ảnh trung gian trong `ref/` vẫn là PNG (làm đầu vào cho ComfyUI).")
a = s.index('### D. Xuất ảnh game ra file webp'); b = s.index('## 4. Chạy lại / mở rộng')
s = s[:a] + '''### D. Ảnh webp (bắt buộc)
* **Gen ảnh -> ra webp ngay**: `elem1_gen.py`, `char_orb.py` nhận PNG từ ComfyUI và lưu thẳng `final/...webp` (lossless, giữ alpha, đúng từng pixel); `char7_split.py`, `elder4_head.py` lưu `final/...webp`. Mọi script đọc ảnh final đều đọc `.webp`.
* **Có PNG nào lọt vào `final/`** (chép tay, tool khác): chạy `python scripts/final_to_webp.py` -> đổi sang webp lossless, mở lại so từng pixel, **giống hệt mới xóa PNG** (không giống thì giữ PNG và báo). `--keep-png` để không xóa. Lần chạy 2026-11-23: 96 PNG -> 96 webp, 0 khác, xóa 96 PNG; `final/` 119 MB -> 77 MB.
* Bước B4/C3 "sao chép thủ công" ảnh chọn từ `ref/chain` vào `final/`: chép xong chạy `final_to_webp.py`.
* `python scripts/export_webp.py` (tùy chọn): xuất các ảnh đang nhúng trong trang ra `webp/<khóa>.webp` (ảnh trong trang vốn đã là webp q90).

''' + s[b:]
open(p, 'w', encoding='utf8').write(s)
print('ok', s.count('.webp'))
