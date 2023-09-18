# Khởi tạo dự án

```sh
npm install
```

# Thiết lập biến môi trường cho dự án

- Tạo file .env lấy mẫu từ .env.example
- Điền giá trị cho các biến

MONGODB_URL= đường dẫn để kết nối database mongo
SERVER_URL= đường dẫn của server
CLIENT_URL= đường dẫn của client

JWT_ACCESS_KEY= khóa cho access token
JWT_REFRESH_KEY= khóa cho refresh token

// Sử dụng để đăng nhập bằng github
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

// Sử dụng để lấy vị trí của ip

- Bước 1: Truy cập để đăng ký tài khoản https://www.maxmind.com/en/geolite2/signup
- Bước 2: Truy cập vào đây để tạo key https://www.maxmind.com/en/accounts/<idtaikhoan>/license-key

  GEOIP2_ACCOUNT_ID=
  GEOIP2_LICENSE_KEY=

// Sử dụng để gửi email
GMAIL_KEY=
JWT_EMAIL_KEY=
