# Ngọc Hành Trình – quy trình vẽ lại asset bằng ComfyUI (A → Z)

Tài liệu cho phiên làm việc mới. Mục tiêu: vẽ lại **toàn bộ ảnh của trang game** `f-ngoc-hanh-trinh.html` bằng ComfyUI (không dùng SVG), gồm
(A) 84 ảnh element (công trình, vật phẩm, kỹ năng, cảnh, đệ tử, thú cưỡi…) và (B) **nhân vật chính tách layer** có chuyển động bằng CSS.

> Tất cả lệnh chạy **từ thư mục `v2/gen`** (đường dẫn trong script là tương đối so với thư mục này).
> Trang đích: `../../f-ngoc-hanh-trinh.html`. Mọi ảnh nằm trong code HTML dưới dạng base64 (`window.IMG`), không có thư mục ảnh riêng khi chạy.

---------------------------------------------------------------------------------------------------

## 0. Quy tắc bắt buộc (người dùng đã nhấn mạnh)

1. **Không bao giờ xóa ảnh nào đã nhúng vào HTML, và ảnh nguồn của nó.** Muốn dọn dẹp: liệt kê trước, chờ người dùng đồng ý. (Từng xóa nhầm `final/elements` -> người dùng rất bực; phải khôi phục từ thư mục output của ComfyUI.)
2. **Không dùng SVG** làm asset.
2b. **Ảnh trong `final/` (ảnh đưa lên game) chỉ để dạng `.webp` lossless, không giữ PNG** (tránh nhầm). Script gen ghi webp ngay (`scripts/webpio.py: save_webp`); ComfyUI trả PNG thì đổi ngay lúc lưu. Ảnh trung gian trong `ref/` vẫn là PNG (làm đầu vào cho ComfyUI).
3. Chỉ xóa thứ chắc chắn thừa (ảnh xem trước, seed không chọn, file tạm). Mọi lần xóa phải kiểm tra lại số file thực tế.
4. Nhân vật cho phép người chơi tùy biến (sau này): **kiểu tóc, trang phục, gương mặt**, theo **4 độ tuổi** (thiếu niên ~16, thanh niên 20–30, trung niên 40–50, lão giả 70+); chỉ được đổi tóc/đồ **trong cùng độ tuổi** (xem 3b). Vì vậy nhân vật là các layer rời.
5. Ảnh có kênh trong suốt (alpha) ngay từ lúc vẽ; mắt nhân vật **luôn nhắm** (tư thế thiền); camera/nhân vật **không** nhấp nhô lên xuống, không zoom.
6. Trình duyệt trong app **không mở được `file://`** và không được phép chạy máy chủ cục bộ => không xem trang trực tiếp được. Kiểm tra bằng: `node --check` cho JS + ảnh ghép/xem trước bằng Python; người dùng tự mở trang để xem chuyển động.

## 1. Môi trường

| Thứ | Giá trị |
|---|---|
| ComfyUI | `http://127.0.0.1:8000` (biến `COMFYUI_URL`; comfy-mcp trỏ vào đây). GPU RTX 4070 Ti SUPER 16 GB |
| comfy-cli | 1.28 (`comfy --skip-prompt run --workflow X.json --host 127.0.0.1 --port 8000 --wait`) |
| Model chính | `qwen_image_2.1_turbo_int8_convrot.safetensors` (bản repack Comfy-Org, 6,76 GB; link: https://huggingface.co/Comfy-Org/Qwen-Image-2.1/resolve/main/diffusion_models/qwen_image_2.1_turbo_int8_convrot.safetensors). File dạng torchao/diffusers sẽ lỗi "Could not detect model type" |
| Text encoder / VAE | `qwen3vl_8b_int8_convrot`, `qwen3.5_9b_qwen_image_2.1_pe_i2i.int8_convrot` (chỉ cần tồn tại, prompt-enhancer tắt), `qwen_image_2.1_vae_bf16` |
| Python | 3.11 + Pillow, numpy, opencv-python (cv2). Node.js (chỉ để `node --check`) |
| Template ComfyUI | `image_qwen_image_2_1_turbo_t2i` -> `scripts/qwen_t2i.json`; `image_qwen_image_2_1_turbo_image_edit` -> `scripts/qwen_edit.json` (lấy bằng `fetch_template` của comfy-mcp; định dạng UI, có subgraph) |

Mẹo Qwen Image 2.1 đã kiểm chứng:
* Viết **"transparent background, output a PNG image with alpha channel"** trong prompt => ảnh RGBA thật, nền trong suốt sạch (không cần xóa nền).
* Template **Edit nhận 2 ảnh ref** (`<Picture 1>`, `<Picture 2>`). Script `edit2.py` thêm node LoadImage thứ 2 vào subgraph (id 9001, nối vào input `images.image_2`).
* "Chỉ vẽ riêng tóc/đồ" từ ref cả người **không ổn định** (lúc ra riêng, lúc ra cả người). Cách chắc chắn: vẽ phần cần + loại bỏ phần còn lại bằng lệnh rõ ràng ("Draw ONLY the head... remove neck, body"), hoặc vẽ bản đầy đủ rồi tách bằng so sánh/mặt nạ.
* Ép nhắm mắt: ghi "eyes fully shut, a single thin dark eyelash line, no eyeball/iris/pupil".
* Tay/chân vẽ trong cả ảnh dễ lỗi ngón -> vẽ riêng tay ở khổ lớn rồi thu nhỏ đặt lại.
* Cảnh/nền (dd-*) vẽ đầy khung (không trong suốt); ảnh khác trong suốt.

## 2. Cấu trúc thư mục `v2/gen`

```
scripts/         toàn bộ file .py và .json của quy trình (xem mục 3)
ref/             ảnh dùng làm đầu vào cho AI + ảnh trung gian của chuỗi gen nhân vật
  character/       ref_standing.png        nhân vật gốc người dùng gửi (ref trang phục + khuôn mặt)
  pose/            mannequin_body*.png     khung thân ngồi thiền (ref tư thế)
  chain/           seat_s82, bald_s91, A_full, A_outfit, head_ref, head_s32, headc_s202, crops.json
final/           ảnh chắc chắn đưa lên game (đã nhúng vào HTML)
  character/       mọi thứ liên quan nhân vật
    hero/hair/       L_face_r1, L_hair_r1, L_orn_r1   đầu = mặt + tóc + trang sức (nhắm mắt)
    hero/outfit/     B_outfit.webp                      trang phục, đầu hói, KHÔNG có bàn tay
    hands/           L_hands.webp                       hai bàn tay
    orb/             glow.webp (xanh ngọc), glow_gold.webp (vàng cam)
    _superseded/hair/  đầu cũ (mắt hé) – còn nhúng trong trang sao lưu hero-v1
  elements/        86 ảnh gốc khổ lớn của các element game (it-*, sk-*, bd-*, dd-*, de-*, mt-*, mo-*, cau-*, dai-da)
  (final/character/elder/  lão giả: outfit/O_e1.webp (chỉ cổ, không tay), hair/H_e1.webp (cả đầu), hair/F_e1.webp (mặt nạ mặt))
demo/            nhân vật DEMO cũ (không dùng chạy thật). Còn nhúng trong f-ngoc-hanh-trinh.demo-char.html -> không xóa
```

Các trang HTML ở `demo/` (thư mục cha `../..`):
| File | Ý nghĩa |
|---|---|
| `f-ngoc-hanh-trinh.html` | **trang hiện tại** (nhân vật mới) |
| `f-ngoc-hanh-trinh.html.bak` | bản gốc ban đầu (ảnh cũ của người dùng) |
| `f-ngoc-hanh-trinh.html.bak2` | **trang nền để dựng nhân vật**: đã nhúng 84 element mới, CHƯA có nhân vật. `char8_build_page.py` luôn copy từ file này |
| `f-ngoc-hanh-trinh.demo-char.html` | trang với nhân vật demo (đang dùng 4 kiểu tóc bạc) |
| `f-ngoc-hanh-trinh.elder-v1.html` | bản lão giả v1 (lỗi lệch, chỉ để lưu ảnh đã nhúng) |
| `f-ngoc-hanh-trinh.hero-v1.html` | nhân vật mới bản mắt hé (trước khi sửa nhắm mắt) |

## 3. Script (thư mục `scripts/`)

Chạy dạng `python scripts/<tên>.py` từ `v2/gen`.

| Script | Việc |
|---|---|
| `edit2.py` | thư viện: Qwen Edit với 1–2 ảnh ref (`edit2(ref1, prompt, out, ref2=None, seed, size)`). Bỏ qua nếu file đầu ra đã tồn tại |
| `qwen_t2i.json`, `qwen_edit.json` | 2 template ComfyUI ở trên. Chỉ số widget của subgraph node 459: t2i: `[0]=prompt, [8]=seed, [9]=unet, [12]=clip PE`; edit: `[1]=prompt, [8],[9]=rộng/cao, [11]=seed, [12]=unet, [17]=clip PE`. Node 13 = ResolutionSelector, node 461 = tiền tố tên file lưu, node 470 = LoadImage (ảnh 1) |

### A. Element game (84 ảnh trong trang, 86 ảnh gốc)
| Bước | Script | Mô tả |
|---|---|---|
| A0 | `elem_prompts.py` | từ điển 86 prompt + kích thước + loại (`icon`/`scene`) cho từng ảnh |
| A1 | `elem1_gen.py [tên...]` | vẽ bằng Qwen Turbo t2i (8 bước). Nền trong suốt trừ cảnh `dd-*`. Seed = 1000 + chỉ số. Ra `final/elements/<tên>.webp` (1024px, bỏ qua file đã có). ~18 s/ảnh |
| A2 | `elem2_embed.py [--write] [--base]` | thu nhỏ đúng kích thước hiển thị của từng khóa trong `window.IMG` (icon: cắt lề trong suốt, đặt vào khung với lề 5%; cảnh: phủ kín + cắt giữa) rồi nhúng webp. Chạy không tham số = chạy thử, chỉ so sánh. `--write` ghi vào trang hiện tại, `--write --base` ghi vào `.bak2` |

Lưu ý: `dai-da` (bục đá xám) không còn trong trang theo yêu cầu người dùng, nhưng ảnh gốc vẫn giữ.

### B. Nhân vật chính (tách layer)
Ý tưởng: trang vẽ nhân vật bằng `<div class="doll3">` gồm các lớp xếp chồng cùng khung 640x640:
outfit (không tay) -> đầu (mặt + tóc, vẽ 2 lần: 1 bản đứng yên + 1 bản chỉ phần tóc đung đưa) -> hạt châu (quầng sáng sau, ảnh xoay, lõi sáng trước) -> hai bàn tay. Nhân vật **ngồi thiền**, không vũ khí.

| Bước | Script | Vào -> ra | Ghi chú / lựa chọn đã chốt |
|---|---|---|---|
| B1 | `char1_seat.py` | `ref/pose/mannequin_body_w.png` (ảnh 1: tư thế) + `ref/character/ref_standing.png` (ảnh 2: trang phục) -> `ref/chain/seat_s81..83.png` | chốt **seed 82**. Lệnh: nhân vật của Picture 2 ngồi đúng tư thế Picture 1, không vũ khí, giữ mọi chi tiết trang phục |
| B2 | `char2_bald.py` | `seat_s82` -> `bald_s91/92` | chốt **s91**: cùng hình nhưng đầu hói (giữ lông mày), giữ nguyên áo |
| B3 | `char3_align.py` | `bald_s91`, `seat_s82` -> `A_outfit.png`, `A_full.png` | căn tỉ lệ (1,013) + dịch để hai bàn tay khớp bàn tay có sẵn `L_hands.webp` |
| B4 | `char4_nohand.py` | `A_outfit` -> `ref/chain/nohand_s101..103.png` | chốt **s103**, sau đó **sao chép thủ công** thành `final/character/hero/outfit/B_outfit.webp` (script không tự sao chép). Lệnh: xóa cả hai bàn tay, găng áo kết thúc ở cổ tay |
| B5 | `char5_head.py` | cắt đầu từ `A_full` (hộp `303,0,743,440`, lưu `ref/chain/crops.json`) -> `head_ref.png` -> `head_s31..33.png` | chốt **s32**. Lệnh: chỉ vẽ MẶT + TÓC, bỏ cổ/vai/thân; giữ trâm vàng, tóc đen dài |
| B6 | `char6_eyes.py` | `head_s32` -> `headc_s201..204.png` | chốt **s202** (nhắm mắt hẳn) |
| B7 | `char7_split.py` | `headc_s202.png` + `crops.json` -> `final/character/hero/hair/L_face_r1.webp`, `L_hair_r1.webp`, `L_orn_r1.webp` | đặt đầu lên canvas 1024, làm mờ đuôi tóc bị cắt ở mép hộp, tách: mặt (vùng da + tai), tóc, trang sức vàng. Ảnh đầu gộp lại + mặt nạ tóc sẽ dùng cho CSS |
| B8 | `char8_build_page.py` | `.bak2` + các ảnh trên -> ghi đè `f-ngoc-hanh-trinh.html` | nhúng ảnh (`ch-of-hero`, `ch-hands`, `ch-head-r1`, `ch-hm-r1` mặt nạ tóc, `ch-hmv-r1` mặt nạ phần tóc cho đung đưa, `ch-glow-teal/gold`, `nv-nam` ảnh nhỏ), thêm CSS/JS/nút DEV |
| – | `char_orb.py [--force]` | -> `final/character/orb/glow.webp`, `glow_gold.webp` | hạt châu xanh ngọc (seed 31) và vàng cam (seed 33); nếu đã có thì bỏ qua |

> Các seed không chọn đã được xóa để gọn; chỉ còn seed đã chốt trong `ref/chain/` (nếu chạy lại script, các seed sẽ được vẽ lại).

**Bàn tay** (`final/character/hands/L_hands.webp`) được làm ở giai đoạn demo, không có script riêng: cắt mỗi tay 170x170 từ ảnh ngồi, phóng lên 1024, Qwen Edit (seed 41) với lệnh: *"Draw ONLY this one hand in high detail, nothing else: an elegant slender hand in a calm meditation mudra, thumb tip and index finger touching to form a small circle, other three fingers relaxed, exactly five well-shaped fingers with visible knuckles, natural fingernails, soft realistic skin shading... remove the sleeve, bracer, robe, knee (transparent); the hand ends cleanly at the wrist."* rồi thu nhỏ đặt lại đúng chỗ (tay trái ~ (194,715), tay phải ~ (828,716) trên canvas 1024). Người dùng đã đồng ý **giữ nguyên ảnh tay này** cho nhân vật mới.

### Hiệu ứng CSS của nhân vật (do `char8_build_page.py` sinh ra)
| Thứ | Cách làm |
|---|---|
| Tóc đung đưa, mặt/tai đứng yên | 2 bản ảnh đầu: bản dưới đứng yên, bản trên áp mặt nạ `ch-hmv` (chỉ phần tóc) xoay ±0,6° quanh đỉnh đầu, 4,5 s. Kiểu đầu đinh không đung đưa |
| Tà áo | 2 vùng ở hai vạt áo dưới đất, mặt nạ radial-gradient, xoay ±1,6°, 3,6 s, lệch nhịp |
| Ngực thở | vùng ngực của ảnh outfit phồng scale (1,014; 1,024), 4,2 s (đã giảm vì quá nhiều) |
| Hạt châu | ảnh xoay 7 s + quầng sáng sau (`.hal`, rộng, tỏa) + lõi sáng trước (`.hco`, nhỏ, trắng) cùng "hô hấp" 3,8 s bằng opacity/scale (KHÔNG animate `filter` vì gây chớp). Bản vàng cam sáng/rộng hơn |
| Bóng | bóng elip mờ dưới chỗ ngồi (`.shd`) |
| Nút DEV | góc trên phải: chọn trang phục, kiểu tóc (đang khóa), hạt châu (Thanh ngọc/Kim hỏa), gương mặt (khóa). Trạng thái ở `window.CH`, hàm `setCH`, `refreshDoll`, `dollHTML` |

Không làm (đã thử và bỏ): nhuộm màu tóc bằng CSS (nhìn xấu, viền sáng), dòng linh khí cuộn quanh người (xấu), nhấp nhô cả người, video MiniMax/Wan (xem mục 5).

## 3b. Độ tuổi + cách làm nhân vật MỚI từ một ảnh full body (cách chuẩn, dùng cho mọi độ tuổi)

**4 độ tuổi** (yêu cầu người dùng): Thiếu niên ~16 · Thanh niên 20–30 (đã có: `r1` + `hero`) · Trung niên 40–50 · Lão giả 70+ (đã có: `e1` + `e1`).
**Chỉ đổi tóc/đồ trong cùng độ tuổi**: thanh niên chỉ thấy tóc + đồ thanh niên, lão giả chỉ thấy tóc + đồ lão giả. Trong DEV: chọn "Độ tuổi" trước (độ tuổi chưa có thì bị khóa), danh sách "Tóc + gương mặt" và "Trang phục" lọc theo `window.AGES` trong `char8_build_page.py`.

**Cách làm (đã kiểm chứng với lão giả, scripts `elder1..elder4`)**. Ý chính: vẽ **cả người ngồi thiền trong 1 ảnh**, rồi từ chính ảnh đó tách ra (a) outfit **không đầu, chỉ còn cổ** và (b) đầu. Vì cùng một ảnh nên cổ, tóc và vai **khớp tuyệt đối**.
| Bước | Script | Vào -> ra | Lão giả đã chốt |
|---|---|---|---|
| 1 | `elder1_seat.py` | ảnh 1 `ref/pose/mannequin_body_w.png` + ảnh 2 ảnh người dùng gửi (`ref/character/ref_elder.png`) -> `ref/chain/elder_full_s*.png`: nguyên người, tóc, râu, mũ, **nhắm mắt luôn trong prompt**, có tay, không vũ khí | seed **333** (thử 331–334) |
| 2 | `elder2_align_neck.py` | căn theo 2 bàn tay chung `L_hands.webp` (scale 1,017) -> `elder_A_full.png`; rồi Qwen Edit **xóa cả đầu, chỉ giữ cổ** (vẽ lại cổ áo/ngực chỗ râu che) -> `elder_neck_s*.png` | seed **342** |
| 3 | `elder3_nohand.py` | xóa 2 bàn tay -> `elder_nohand_s*.png`; in ra độ lệch so với ảnh trước (phase correlation, phải ≈ 0 px) | seed **351** (lệch < 0,1 px) |
| 4 | `elder4_head.py` | **không vẽ lại đầu**: so `elder_A_full` với ảnh chỉ-cổ -> mặt nạ đầu (phần nằm trên cổ + chỗ khác màu do tóc/râu đè lên áo), đóng phần râu trắng trên áo trắng bằng **bao lồi** từ cằm xuống; elip mặt + tai từ vùng da. Ghi `final/character/elder/outfit/O_e1.webp`, `hair/H_e1.webp` (cả đầu), `hair/F_e1.webp` (mặt nạ mặt), `ref/chain/elder_head.json` | – |
| 5 | `char8_build_page.py` | nhúng `ch-of-e1`, `ch-head-e1`, `ch-hmv-e1` (= đầu trừ elip mặt: phần tóc/râu/mũ đung đưa), tâm xoay ở đỉnh trán; khung 640 tính theo nhân vật thanh niên để hai bản cùng tỉ lệ | – |

Làm độ tuổi khác (thiếu niên, trung niên): copy 4 script `elder*`, đổi ảnh ref, prompt (tuổi, tóc, râu, đồ), tên file và seed; chọn seed bằng cách xem ảnh. Thêm vào `L` và `AGES` trong `char8_build_page.py` (khóa ảnh `ch-of-<id>`, `ch-head-<id>`, `ch-hmv-<id>`, CSS tâm xoay `.hair.s-<id>`).
Thêm tóc/đồ mới cho **cùng** độ tuổi: phải giữ đúng vị trí cổ -> dùng `elder_A_full` (hoặc ảnh outfit-chỉ-cổ) của độ tuổi đó làm ảnh 1 khi vẽ.

Đã thử và bỏ:
* (lão giả v1) cắt đầu từ ảnh **đứng** rồi đặt lên outfit **đầu hói**: tóc lệch vai, mặt hói lộ phía sau -> người dùng chê "rất không ổn". Script cũ ở `scripts/_superseded/`, ảnh ở `ref/chain/_elder_v1/` và `final/character/_superseded/elder_v1/` (vẫn nhúng trong trang sao lưu `f-ngoc-hanh-trinh.elder-v1.html`, không xóa).
* Qwen Edit "chỉ vẽ đầu" trên cả khung 1024: model **phóng to đầu** ra giữa khung, mất vị trí (lệch 50–60 px).
* Bàn tay: vẫn dùng chung `L_hands.webp` cho mọi độ tuổi.

### D. Ảnh webp (bắt buộc)
* **Gen ảnh -> ra webp ngay**: `elem1_gen.py`, `char_orb.py` nhận PNG từ ComfyUI và lưu thẳng `final/...webp` (lossless, giữ alpha, đúng từng pixel); `char7_split.py`, `elder4_head.py` lưu `final/...webp`. Mọi script đọc ảnh final đều đọc `.webp`.
* **Có PNG nào lọt vào `final/`** (chép tay, tool khác): chạy `python scripts/final_to_webp.py` -> đổi sang webp lossless, mở lại so từng pixel, **giống hệt mới xóa PNG** (không giống thì giữ PNG và báo). `--keep-png` để không xóa. Lần chạy 2026-11-23: 96 PNG -> 96 webp, 0 khác, xóa 96 PNG; `final/` 119 MB -> 77 MB.
* Bước B4/C3 "sao chép thủ công" ảnh chọn từ `ref/chain` vào `final/`: chép xong chạy `final_to_webp.py`.
* `python scripts/export_webp.py` (tùy chọn, chỉ khi cần xem): xuất bản nhỏ đang nhúng trong trang ra `webp/` — đây là bản sao thu nhỏ của `final/`, xem xong xóa đi, không giữ.

## 4. Chạy lại / mở rộng

* **Vẽ lại element mới/sửa**: `python scripts/elem1_gen.py it-kiem` (xóa file cũ trước hoặc dùng tên mới) -> `python scripts/elem2_embed.py --write --base` rồi `python scripts/char8_build_page.py` (vì trang nhân vật luôn dựng từ `.bak2`).
* **Đổi nhân vật/đầu**: làm lại B5–B7, rồi B8.
* **Thêm kiểu tóc**: lấy `ref/chain/head_ref.png` làm ảnh 1 -> Qwen Edit "Change the hairstyle to ... (màu bạc/đen), ornaments bright polished gold. Draw ONLY the head..." -> tách bằng `char7_split.py` (đổi tên ảnh vào/ra theo kiểu tóc) -> thêm khóa `ch-head-<id>`, `ch-hm-<id>`, `ch-hmv-<id>` và tùy chọn trong JS/DEV của `char8_build_page.py`. Muốn tóc màu khác: **vẽ sẵn từng màu**, đừng nhuộm bằng CSS.
* **Thêm trang phục**: Qwen Edit với `ref/chain/bald_s91.png` (đầu hói, đúng tư thế) làm ảnh 1 và ảnh mô tả/ref trang phục làm ảnh 2, rồi bước "bỏ tay" (B4), căn theo tay (B3).
* Sau mọi thay đổi: `python scripts/char8_build_page.py`, `node --check` trên script cuối của trang (đoạn lệnh có trong lịch sử: lấy `<script>...</script>` cuối trang ghi ra `_chk.js`).

## 5. Bài học (đừng lặp lại)

* Video làm chuyển động (MiniMax H3, Wan 2.2) đã thử: H3 giữ được nhân vật tốt, đặt `last_frame = first_frame` để loop mượt, nền **trắng đặc** thì giữ nền, nhưng tách nền từng frame còn viền xấu và file nặng; Wan 5B template bỏ qua ảnh đầu vào. Người dùng chọn hướng **layer + CSS**.
* Model hay "bù" camera: lệnh "static camera" bị bỏ qua nếu frame đầu ≠ frame cuối (đo thấy zoom 3–4%).
* Cắt đầu bằng mặt nạ elip: nới vùng mặt để trùm **cả hai tai** (nếu không tai bị đung đưa theo tóc). Phía sau đầu cần có bản tóc đứng yên (không để hở sau cổ khi tóc xoay).
* Đừng lấp da lên sợi tóc vắt ngang má bằng inpaint (tạo mảng da kỳ quặc); giữ nguyên ảnh gốc.
* `rm` trong Git Bash không xử lý đường dẫn có `\`; dùng Python `os.remove` và kiểm tra lại số file.
* Có thể có phiên khác cùng sửa thư mục (đã gặp: session "btw") -> kiểm tra `ListAgents` trước khi ghi đè `ref/chain`.
* ComfyUI lưu mọi ảnh đã vẽ trong `C:\Users\My-PC\Downloads\New folder (3)\output` (tiền tố `fnht_*`): nơi khôi phục nếu lỡ xóa.
