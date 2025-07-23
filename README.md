# NestJS Auth API

Dự án API với hệ thống authentication sử dụng NestJS, Passport, JWT và Swagger.

## Tính năng

- ✅ Đăng ký tài khoản
- ✅ Đăng nhập với JWT
- ✅ Bảo vệ route với JWT Guard
- ✅ Swagger API Documentation
- ✅ Validation với class-validator
- ✅ Database với TypeORM (SQLite)
- ✅ Hash password với bcrypt
- ✅ Advanced Logging Middleware với màu sắc
- ✅ Request/Response Interceptor
- ✅ Performance monitoring
- ✅ Error tracking

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Tạo file .env từ env.example
cp env.example .env

# Chỉnh sửa file .env với thông tin của bạn
```

## Chạy ứng dụng

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Endpoints

**Base URL:** `http://localhost:8080/api/v1`

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /users/register` - Đăng ký tài khoản

### Users (Yêu cầu JWT)
- `GET /users/profile` - Lấy thông tin profile
- `GET /users` - Lấy danh sách users

### Demo (Test Logging)
- `GET /demo/test` - Test endpoint cơ bản
- `POST /demo/test-post` - Test POST với body
- `GET /demo/error` - Test endpoint tạo lỗi
- `GET /demo/slow` - Test endpoint chậm (>1s)
- `GET /demo/:id` - Test GET với ID parameter (1, 2, 3 hoặc bất kỳ để test 404)

## Swagger Documentation

Truy cập Swagger UI tại: `http://localhost:8080/api`

## Cấu trúc dự án

```
src/
├── modules/             # Business modules
│   ├── auth/           # Authentication module
│   │   ├── guards/     # Passport guards
│   │   ├── strategies/ # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/          # Users module
│   │   ├── dto/        # Data Transfer Objects
│   │   ├── user.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── demo/           # Demo module
│   │   ├── demo.controller.ts
│   │   └── demo.module.ts
│   └── index.ts        # Export all modules
├── common/             # Shared components
│   ├── interceptors/   # Global interceptors
│   └── middleware/     # Global middleware
├── config/             # Configuration files
├── app.module.ts       # Root module
└── main.ts            # Application entry point
```

## Biến môi trường

Tạo file `.env` với các biến sau:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=jobedu

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=1d

# App
PORT=8080
NODE_ENV=development
```

## Sử dụng API

### 1. Đăng ký tài khoản

```bash
curl -X POST http://localhost:8080/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username123",
    "password": "password123",
    "fullName": "Nguyễn Văn A"
  }'
```

### 2. Đăng nhập

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "username123",
    "password": "password123"
  }'
```

### 3. Truy cập protected route

```bash
curl -X GET http://localhost:8080/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Test Logging

```bash
# Test endpoint cơ bản
curl -X GET http://localhost:8080/api/v1/demo/test

# Test POST với body
curl -X POST http://localhost:8080/api/v1/demo/test-post \
  -H "Content-Type: application/json" \
  -d '{"test": "data", "number": 123}'

# Test endpoint lỗi
curl -X GET http://localhost:8080/api/v1/demo/error

# Test endpoint chậm
curl -X GET http://localhost:8080/api/v1/demo/slow

# Test GET với ID (thành công)
curl -X GET http://localhost:8080/api/v1/demo/1
curl -X GET http://localhost:8080/api/v1/demo/2

# Test GET với ID (404 error)
curl -X GET http://localhost:8080/api/v1/demo/999
```

## Scripts

- `npm run start:dev` - Chạy development server với hot reload
- `npm run start:dev:paths` - Chạy với path alias support
- `npm run build` - Build ứng dụng
- `npm run start:prod` - Chạy production server
- `npm run test` - Chạy tests
- `npm run lint` - Kiểm tra code style

## Cấu trúc Modules

Dự án được tổ chức theo mô hình modules để dễ dàng mở rộng và bảo trì:

### Quy tắc tổ chức modules:
1. **Tất cả business logic được đặt trong `src/modules/`**
2. **Mỗi module có cấu trúc nhất quán:**
   - `dto/` - Data Transfer Objects
   - `entities/` - Database entities  
   - `*.controller.ts` - API endpoints
   - `*.service.ts` - Business logic
   - `*.module.ts` - Module configuration
   - `guards/` - Module-specific guards (nếu cần)

3. **Import/Export:**
   - Sử dụng `@/modules/module-name` để import
   - Export tất cả modules qua `src/modules/index.ts`

### Thêm module mới:
1. Tạo thư mục module trong `src/modules/`
2. Tạo các file cần thiết theo cấu trúc chuẩn
3. Thêm export vào `src/modules/index.ts`
4. Import và sử dụng trong `src/app.module.ts`

## Path Alias

Dự án sử dụng path alias để import dễ dàng hơn:

```typescript
// Thay vì
import { UsersService } from '../users/users.service';

// Sử dụng
import { UsersService } from '@users/users.service';
```

### Các alias có sẵn:
- `@/*` - src/*
- `@common/*` - src/common/*
- `@modules/*` - src/modules/*
- `@config/*` - src/config/*