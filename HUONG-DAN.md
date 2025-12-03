# Hướng Dẫn Sử Dụng LibraryHub

## Giới Thiệu

LibraryHub là hệ thống quản lý thư viện hiện đại, đẹp mắt với đầy đủ tính năng cho cả **Quản lý viên** và **Người mượn sách**. Hệ thống tích hợp AI để tạo tóm tắt sách và chatbot hỏi đáp thông minh.

## Cài Đặt & Chạy

### Yêu Cầu
- Node.js phiên bản 18 trở lên
- npm (đi kèm với Node.js)

### Các Bước Cài Đặt

1. **Cài đặt thư viện:**
```bash
npm install
```

2. **Chạy ứng dụng:**
```bash
npm run dev
```

3. **Mở trình duyệt:**
Truy cập `http://localhost:5173`

## Tài Khoản Demo

### Tài Khoản Quản Lý
- Email: `manager@library.com`
- Mật khẩu: `manager123`

### Tài Khoản Người Dùng
- Email: `john@example.com`
- Mật khẩu: `john123`

Bạn cũng có thể đăng ký tài khoản mới (sẽ tự động là tài khoản người mượn).

## Tính Năng Chính

### Dành Cho Quản Lý Viên

#### 1. Bảng Điều Khiển (Dashboard)
- Xem tổng quan thống kê thư viện
- Số lượng sách, mượn sách đang hoạt động
- Danh sách yêu cầu mượn gần đây
- Top sách được mượn nhiều

#### 2. Quản Lý Sách
- **Thêm sách mới:** Nhập đầy đủ thông tin (tiêu đề, tác giả, thể loại, ISBN, nhà xuất bản, năm xuất bản, số trang, số lượng, ảnh bìa)
- **Sửa thông tin sách:** Cập nhật mọi thông tin của sách
- **Xóa sách:** Xóa sách khỏi hệ thống
- **Tìm kiếm:** Tìm theo tiêu đề hoặc ISBN
- **Xem chi tiết:** Xem đầy đủ thông tin và ảnh bìa

#### 3. Quản Lý Tác Giả
- Thêm, sửa, xóa tác giả
- Quản lý thông tin: tên, tiểu sử, năm sinh, quốc tịch
- Tìm kiếm tác giả

#### 4. Quản Lý Thể Loại
- Tạo cấu trúc phân cấp (cha-con)
- CRUD đầy đủ cho thể loại
- Mô tả chi tiết cho từng thể loại

#### 5. Quản Lý Mượn - Trả
- **Duyệt yêu cầu:** Phê duyệt yêu cầu mượn sách
- **Theo dõi:** Xem tất cả các lượt mượn
- **Lọc theo trạng thái:**
  - Chờ duyệt
  - Đã duyệt
  - Quá hạn
- **Trả sách:** Đánh dấu sách đã trả
- **Gia hạn:** Cho phép gia hạn tối đa 2 lần
- **Tính tiền phạt:** Tự động tính $1/ngày cho sách quá hạn

#### 6. Quản Lý Đánh Giá
- Xem tất cả đánh giá từ người dùng
- Phê duyệt hoặc từ chối đánh giá
- Kiểm duyệt nội dung không phù hợp

#### 7. Quản Lý Người Dùng
- Danh sách tất cả người dùng
- Thống kê hoạt động của từng người
- Quản lý vai trò (manager/borrower)

#### 8. Báo Cáo & Thống Kê
- Sách được mượn nhiều nhất
- Thống kê tiền phạt
- Xu hướng mượn sách
- Biểu đồ trực quan

### Dành Cho Người Mượn Sách

#### 1. Duyệt Sách
- **Giao diện đẹp:** Hiển thị sách dạng thẻ với ảnh bìa
- **Tìm kiếm:** Tìm theo tên sách, tác giả
- **Lọc:** Lọc theo thể loại
- **Sắp xếp:**
  - Theo tên (A-Z)
  - Theo năm xuất bản
  - Theo tình trạng có sẵn
- **Xem chi tiết:** Click vào sách để xem đầy đủ thông tin

#### 2. Tính Năng AI

##### Tóm Tắt Sách Thông Minh
Chọn 1 trong 3 phong cách:
- **Ngắn gọn:** Tổng quan nhanh
- **Chi tiết:** Phân tích toàn diện
- **Học thuật:** Góc nhìn chuyên môn

**Cách sử dụng:**
1. Mở chi tiết sách bất kỳ
2. Kéo xuống phần "AI Assistant"
3. Tab "AI Summary"
4. Chọn phong cách
5. Nhấn "Generate"

##### Chatbot Hỏi Đáp
Hỏi bất cứ điều gì về nội dung sách!

**Cách sử dụng:**
1. Mở chi tiết sách
2. Tab "Ask Questions"
3. Nhập câu hỏi
4. Nhấn Enter hoặc nút Send

**Ví dụ câu hỏi:**
- "Sách này nói về những chủ đề chính nào?"
- "Ai nên đọc cuốn sách này?"
- "Điểm nổi bật của sách là gì?"

#### 3. Mượn Sách
- **Yêu cầu mượn:** Click "Request to Borrow" trong chi tiết sách
- **Xem lịch sử:** Tất cả lượt mượn của bạn
- **Theo dõi thời hạn:** Xem ngày đến hạn
- **Kiểm tra tiền phạt:** Xem số tiền phạt (nếu có)

#### 4. Quản Lý Mượn Của Tôi
Xem thống kê:
- Đang mượn: Số sách đang có
- Chờ duyệt: Yêu cầu đang chờ
- Đã hoàn thành: Tổng số lượt mượn
- Tiền phạt: Tổng tiền phạt phải trả

**Thông tin mỗi lượt mượn:**
- Ảnh bìa và tên sách
- Ngày yêu cầu
- Ngày đến hạn
- Trạng thái (chờ/đang mượn/quá hạn/đã trả)
- Số lần gia hạn (x/2)
- Tiền phạt (nếu có)

#### 5. Đánh Giá Sách
- Viết đánh giá cho sách đã mượn
- Cho điểm từ 1-5 sao
- Thêm nhận xét chi tiết
- Chỉnh sửa đánh giá đang chờ duyệt

#### 6. Hồ Sơ Cá Nhân
- Xem thông tin tài khoản
- Cập nhật thông tin cá nhân
- Đổi mật khẩu
- Thống kê hoạt động

## Quy Định Mượn Sách

### Thời Hạn
- **Mượn lần đầu:** 14 ngày
- **Gia hạn:** Tối đa 2 lần, mỗi lần 14 ngày
- **Tổng thời gian tối đa:** 42 ngày (14 + 14 + 14)

### Tiền Phạt
- **Quá hạn:** $1 cho mỗi ngày trễ
- **Thanh toán:** Tại quầy thư viện

### Giới Hạn
- Mỗi người tối đa 5 sách cùng lúc
- Gia hạn chỉ khi không có người chờ

## Giao Diện & Trải Nghiệm

### Thiết Kế
- **Màu sắc:** Gradient từ teal đến cyan, hiện đại và chuyên nghiệp
- **Responsive:** Hoạt động mượt trên mọi thiết bị (mobile/tablet/desktop)
- **Animation:** Hiệu ứng mượt mà, không giật lag
- **Icons:** Sử dụng Lucide React, rõ ràng và đẹp mắt

### Điều Hướng
- **Sidebar:** Menu bên trái (desktop)
- **Topbar:** Thanh tìm kiếm và thông báo
- **Mobile:** Menu hamburger, dễ sử dụng

## Cấu Trúc Dự Án

```
src/
├── components/          # Các component tái sử dụng
│   ├── ai/             # Tính năng AI
│   ├── layout/         # Layout chính
│   └── ui/             # UI components
├── contexts/           # React Context
├── data/               # Mock data
├── pages/              # Các trang chính
│   ├── borrower/      # Trang người mượn
│   └── manager/       # Trang quản lý
└── App.tsx            # Component chính
```

## Lệnh Hữu Ích

```bash
# Chạy ứng dụng phát triển
npm run dev

# Build cho production
npm run build

# Preview bản build
npm run preview

# Kiểm tra lỗi code
npm run lint

# Kiểm tra TypeScript
npm run typecheck
```

## Dữ Liệu Mẫu

Hệ thống đã có sẵn:
- 3 người dùng (1 manager, 2 borrower)
- 4 tác giả
- 5 thể loại
- 5 quyển sách
- 4 lượt mượn
- 3 đánh giá
- 3 tóm tắt AI

**Lưu ý:** Dữ liệu chỉ lưu trong bộ nhớ, sẽ reset khi refresh trang.

## Phát Triển Thêm

Để chuyển thành ứng dụng thực tế:

1. **Backend:** Tạo API server (Node.js/Express)
2. **Database:** Sử dụng PostgreSQL/MySQL (có file `database.sql`)
3. **AI thật:** Tích hợp OpenAI API
4. **Upload ảnh:** Tích hợp AWS S3 hoặc Cloudinary
5. **Email:** Gửi thông báo tự động
6. **Payment:** Tích hợp thanh toán online

## Hỗ Trợ

### Tài Liệu Tiếng Anh
- `README.md` - Hướng dẫn chi tiết
- `FEATURES.md` - Danh sách tính năng đầy đủ
- `database.sql` - Schema cơ sở dữ liệu

### Liên Hệ
- Mở issue trên repository
- Email: support@libraryhub.com (demo)

## Mẹo Sử Dụng

### Cho Quản Lý Viên
1. ✅ Duyệt yêu cầu mượn nhanh chóng
2. ✅ Kiểm tra sách quá hạn mỗi ngày
3. ✅ Cập nhật thông tin sách thường xuyên
4. ✅ Theo dõi báo cáo để hiểu xu hướng

### Cho Người Mượn
1. ✅ Trả sách đúng hạn tránh phạt
2. ✅ Sử dụng tính năng AI để tìm hiểu sách
3. ✅ Viết đánh giá giúp người khác
4. ✅ Đặt nhắc nhở cho ngày đến hạn
5. ✅ Gia hạn sớm trước khi hết hạn

## Câu Hỏi Thường Gặp

**Q: Làm sao để đăng ký tài khoản?**
A: Click "Register here" ở trang đăng nhập, điền thông tin và submit.

**Q: Quên mật khẩu thì sao?**
A: Hiện tại dùng mock data, vui lòng dùng tài khoản demo hoặc tạo mới.

**Q: Có thể mượn bao nhiêu sách cùng lúc?**
A: Tối đa 5 sách/người (trong version thật).

**Q: AI có thật không?**
A: Đây là demo với responses được lập trình sẵn. Để dùng AI thật cần tích hợp OpenAI API.

**Q: Dữ liệu có lưu không?**
A: Không, dữ liệu mock sẽ reset khi refresh. Cần database thật cho production.

**Q: Mobile app có không?**
A: Chưa có, nhưng web responsive hoạt động tốt trên mobile.

## Kết Luận

LibraryHub là một hệ thống quản lý thư viện đầy đủ, hiện đại, sẵn sàng cho demo hoặc làm nền tảng phát triển ứng dụng thực tế. Với giao diện đẹp, tính năng phong phú và code được tổ chức tốt, đây là giải pháp lý tưởng cho các thư viện nhỏ đến vừa.

---

Chúc bạn sử dụng vui vẻ! 🚀📚
