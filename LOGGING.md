# Hệ thống Logging

## 📊 Tính năng Logging

Dự án này có hệ thống logging nâng cao với các tính năng sau:

### 1. **LoggerMiddleware** (`src/common/middleware/logger.middleware.ts`)
- Log tất cả HTTP requests và responses
- Hiển thị thông tin chi tiết: method, URL, status code, response time
- Màu sắc phân biệt cho các HTTP methods và status codes
- Sanitize sensitive data (password, token, etc.)
- Request ID tracking
- IP address detection
- User agent logging

### 2. **LoggingInterceptor** (`src/common/interceptors/logging.interceptor.ts`)
- Performance monitoring
- Slow request detection (>1000ms)
- Error tracking với stack trace
- Request/response timing

## 🎨 Màu sắc trong Terminal

### HTTP Methods:
- 🟢 **GET** - Xanh lá
- 🔵 **POST** - Xanh dương  
- 🟡 **PUT** - Vàng
- 🔴 **DELETE** - Đỏ
- 🟣 **PATCH** - Tím

### Status Codes:
- 🟢 **2xx** - Xanh lá (Success)
- 🟡 **3xx** - Vàng (Redirect)
- 🔴 **4xx** - Đỏ (Client Error)
- 🟣 **5xx** - Tím (Server Error)

## 📝 Ví dụ Log Output

### Request thành công:
```
🚀 GET /demo/test - 127.0.0.1 - req_1703123456789_abc123def
✅ GET /demo/test - 200 - 45ms - req_1703123456789_abc123def
📤 GET /demo/test - 200 - 45ms
```

### Request với body:
```
🚀 POST /demo/test-post - 127.0.0.1 - req_1703123456790_xyz789ghi
📤 Request Body: {
  "test": "data",
  "number": 123
}
✅ POST /demo/test-post - 201 - 67ms - req_1703123456790_xyz789ghi
📤 POST /demo/test-post - 201 - 67ms
```

### Request lỗi:
```
🚀 GET /demo/error - 127.0.0.1 - req_1703123456791_err456
❌ GET /demo/error - 500 - 23ms - Đây là lỗi test
✅ GET /demo/error - 500 - 23ms - req_1703123456791_err456
```

### Request chậm:
```
🚀 GET /demo/slow - 127.0.0.1 - req_1703123456792_slow789
🐌 Slow Request: GET /demo/slow took 1503ms
✅ GET /demo/slow - 200 - 1503ms - req_1703123456792_slow789
📤 GET /demo/slow - 200 - 1503ms
```

## 🔧 Cấu hình

### Middleware được áp dụng globally trong `app.module.ts`:
```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*'); // Áp dụng cho tất cả routes
  }
}
```

### Interceptor được áp dụng globally trong `main.ts`:
```typescript
app.useGlobalInterceptors(new LoggingInterceptor());
```

## 🛡️ Bảo mật

### Sanitize Sensitive Data:
- Password fields
- Authorization tokens
- Secret keys
- JWT tokens (chỉ hiển thị 10 ký tự đầu và cuối)

### IP Detection:
- X-Forwarded-For header
- X-Real-IP header
- Connection remote address
- Socket remote address

## 🚀 Test Logging

Sử dụng các endpoint demo để test:

```bash
# Test cơ bản
curl http://localhost:3000/demo/test

# Test với body
curl -X POST http://localhost:3000/demo/test-post \
  -H "Content-Type: application/json" \
  -d '{"password": "secret123", "data": "test"}'

# Test lỗi
curl http://localhost:3000/demo/error

# Test chậm
curl http://localhost:3000/demo/slow
```

## 📊 Monitoring

Hệ thống tự động phát hiện:
- ✅ Requests thành công
- ⚠️ Requests chậm (>1000ms)
- ❌ Requests lỗi
- 🔍 Performance metrics
- 📍 Request tracking với ID 