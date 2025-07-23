# Hướng dẫn khởi tạo dự án

## Bước 1: Cài đặt dependencies

```bash
npm install
```

## Bước 2: Tạo file .env

```bash
cp env.example .env
```

Chỉnh sửa file `.env` với thông tin của bạn:

```env
# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=1d

# App
PORT=3000
NODE_ENV=development
```

## Bước 3: Chạy ứng dụng

```bash
# Development mode
npm run start:dev
```

## Bước 4: Kiểm tra

1. Truy cập Swagger UI: http://localhost:3000/api
2. Test API endpoints:
   - Đăng ký: POST /users/register
   - Đăng nhập: POST /auth/login
   - Profile: GET /users/profile (cần JWT token)

## Lưu ý

- Database SQLite sẽ được tạo tự động khi chạy ứng dụng
- JWT token sẽ được trả về sau khi đăng nhập thành công
- Sử dụng JWT token trong header Authorization: Bearer <token> để truy cập protected routes 