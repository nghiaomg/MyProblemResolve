# Giải Pháp Upload File Dung Lượng Lớn (Heavy File Uploading)

Mini-project này trình bày một giải pháp để xử lý việc upload các file có dung lượng rất lớn (lên tới 1GB - 10GB) bằng Node.js / Express.js mà không làm sập server vì cạn kiệt RAM (Out of Memory). 

Giải pháp cốt lõi ở đây là sử dụng **Streams** thông qua thư viện `Busboy`. Thay vì buffer (tải toàn bộ) file vào RAM của server trước khi lưu vào ổ cứng, ứng dụng sẽ `pipe` trực tiếp luồng dữ liệu (stream) từ client thẳng vào file stream ghi xuống ổ đĩa cứng.

## Các Tính Năng Chính
- **Tối ưu hóa RAM tối đa:** Lượng RAM tiêu thụ cao nhất (Peak RAM) cho một tác vụ upload luôn duy trì ổn định ở mức ~128KB, bất kể dung lượng file tải lên là bao nhiêu (1MB, 1GB hay 100GB).
  - Gồm 64KB cho luồng đọc (readable stream từ client).
  - Và 64KB cho luồng ghi (writable stream chờ ghi xuống đĩa cứng).
- **Tránh nút thắt cổ chai (Bottlenecks):** Dữ liệu được push thẳng vào hệ thống tệp file system trực tiếp.
- **Giới hạn kích thước file:** Hỗ trợ tính năng ngắt upload nếu file vượt qua định mức quy định.
- **Xử lý thư mục:** Tự động tạo thư mục `./uploads` nếu chưa tồn tại.

## Cấu Trúc Thư Mục / File
- `index.ts`: File backend chính chạy Express server. Cung cấp API endpoint (`POST /upload`) để stream và lưu file.
- `index.html`: Giao diện frontend HTML demo đơn giản. Gồm một `<form>` với nút chọn file và gửi đi.
- `package.json`: Chứa cấu hình thư viện và script chạy (Busboy, Express, TypeScript).

## Hướng Dẫn Cài Đặt và Sử Dụng

1. **Cài đặt các gói phụ thuộc (dependencies):**
   Mở terminal tại thư mục gốc của project này và chạy lệnh:
   ```bash
   npm install
   ```

2. **Khởi động Server Backend:**
   Dùng lệnh sau để bắt đầu tiến trình chạy server (Sử dụng `ts-node`):
   ```bash
   npm start
   ```
   > 💡 Server của bạn sẽ lắng nghe tại `http://localhost:3000`. Cửa sổ console sẽ hiển thị thông báo "Server chạy port 3000".

3. **Chạy Thực Tế / Thử Nghiệm Upload:**
   - Bạn có thể mở trực tiếp file `index.html` bằng trình duyệt để hiện ra giao diện tải file lên.
   - Chọn một file bất kỳ (đặc biệt là các file nặng dung lượng hàng GB) và bấm **"Upload"**.
   - Các file được upload thành công sẽ nằm gọn trong thư mục `uploads/` cùng cấp với mã nguồn.

## Công Nghệ Sử Dụng
- [Express.js](https://expressjs.com/) (v5)
- [Busboy](https://github.com/mscdex/busboy) - Trình phân tích luồng HTML form dữ liệu `multipart/form-data`.
- TypeScript
