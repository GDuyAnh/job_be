# Hướng dẫn cấu hình Cloudflare R2

## 1. Tạo R2 Bucket

1. Đăng nhập vào Cloudflare Dashboard
2. Vào **R2** từ menu bên trái
3. Click **Create bucket**
4. Đặt tên cho bucket (ví dụ: `topviec-uploads`)
5. Click **Create bucket**

## 2. Lấy thông tin Account ID

1. Vào trang R2 Overview
2. Copy **Account ID** (hiển thị ở bên phải)

## 3. Tạo API Token

1. Trong trang R2, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Đặt tên cho token (ví dụ: `topviec-upload`)
4. Chọn quyền:
   - **Object Read & Write** cho bucket của bạn
5. Click **Create API Token**
6. Copy **Access Key ID** và **Secret Access Key** (lưu lại, sẽ không hiển thị lại)

## 4. Cấu hình Public Access (Optional)

Để file có thể truy cập công khai:

1. Vào bucket settings
2. Vào tab **Settings**
3. Scroll xuống **Public access**
4. Click **Allow Access**
5. Hoặc kết nối Custom Domain:
   - Vào tab **Settings** > **Custom Domains**
   - Click **Connect Domain**
   - Nhập domain của bạn (ví dụ: `cdn.topviec.com`)
   - Follow hướng dẫn để cấu hình DNS

## 5. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
R2_ACCOUNT_ID=your-account-id-here
R2_ACCESS_KEY_ID=your-access-key-id-here
R2_SECRET_ACCESS_KEY=your-secret-access-key-here
R2_BUCKET_NAME=topviec-uploads
R2_PUBLIC_URL=https://pub-xxxxxxxxxx.r2.dev
# Hoặc nếu dùng custom domain:
# R2_PUBLIC_URL=https://cdn.topviec.com
```

## 6. Test Upload

Sau khi cấu hình, khởi động lại server:

```bash
npm run start:dev
```

API endpoints sẽ có sẵn tại:
- POST `/api/upload/cv` - Upload CV
- POST `/api/upload/cover-letter` - Upload cover letter
- POST `/api/upload/avatar` - Upload avatar
- POST `/api/upload/presigned-url` - Get presigned URL cho client upload

## Lưu ý

- R2 tương thích với S3 API
- Free tier: 10GB storage, 1M Class A operations/month
- Files được lưu với tên unique để tránh trùng lặp
- Hỗ trợ CV: PDF, DOC, DOCX (max 5MB)
- Hỗ trợ Avatar: JPEG, PNG (max 3MB)

