export interface DefaultEmailTemplate {
  code: string;
  name: string;
  description: string;
  subject: string;
  htmlBody: string;
  variables: string[];
  isActive?: boolean;
}

const wrapBody = (title: string, innerHtml: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .btn { display: inline-block; background-color: #3b82f6; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
    .credentials { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
    .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header"><h1>${title}</h1></div>
  <div class="content">${innerHtml}</div>
  <div class="footer">
    <p>Email này được gửi tự động, vui lòng không trả lời.</p>
    <p>&copy; {{year}} {{siteName}}. All rights reserved.</p>
  </div>
</body>
</html>`;

export const DEFAULT_EMAIL_TEMPLATES: DefaultEmailTemplate[] = [
  {
    code: 'SMTP_TEST',
    name: 'Kiểm tra SMTP',
    description: 'Gửi khi admin bấm "Gửi email thử" trên trang cài đặt SMTP.',
    subject: 'Kiểm tra cấu hình email - {{siteName}}',
    htmlBody: wrapBody(
      'Kiểm tra SMTP',
      `<p>Xin chào,</p>
<p>Đây là email kiểm tra cấu hình SMTP từ trang quản trị {{siteName}}.</p>
<p>Nếu bạn nhận được email này, cấu hình gửi mail đang hoạt động.</p>
<p>Thời gian gửi: {{sentAt}}</p>`,
    ),
    variables: ['siteName', 'sentAt', 'year'],
  },
  {
    code: 'ACCOUNT_CREDENTIALS_CANDIDATE',
    name: 'Tài khoản ứng viên mới',
    description:
      'Gửi khi tạo tài khoản ứng viên (đăng ký hoặc ứng tuyển lần đầu). Chứa mật khẩu dạng plaintext — chỉ dùng cho luồng nghiệp vụ hiện tại.',
    subject: 'Thông tin tài khoản của bạn - {{siteName}}',
    htmlBody: wrapBody(
      'Chào mừng đến với {{siteName}}!',
      `<p>Xin chào <strong>{{fullName}}</strong>,</p>
<p>Tài khoản của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập:</p>
<div class="credentials">
  <p><strong>Email:</strong> {{email}}</p>
  <p><strong>Tên đăng nhập:</strong> {{username}}</p>
  <p><strong>Mật khẩu:</strong> {{password}}</p>
</div>
<div class="warning">
  <strong>Lưu ý:</strong> Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu. Không chia sẻ thông tin đăng nhập với bất kỳ ai.
</div>
<p>Bạn có thể đăng nhập tại: <a href="{{loginUrl}}">{{loginUrl}}</a></p>
<p>Trân trọng,<br><strong>Đội ngũ {{siteName}}</strong></p>`,
    ),
    variables: [
      'fullName',
      'email',
      'username',
      'password',
      'loginUrl',
      'siteName',
      'year',
    ],
  },
  {
    code: 'ACCOUNT_CREDENTIALS_EMPLOYER',
    name: 'Tài khoản nhà tuyển dụng mới',
    description:
      'Gửi khi tạo tài khoản nhà tuyển dụng (role COMPANY). Chứa mật khẩu dạng plaintext.',
    subject: 'Tài khoản nhà tuyển dụng - {{siteName}}',
    htmlBody: wrapBody(
      'Chào mừng nhà tuyển dụng!',
      `<p>Xin chào <strong>{{fullName}}</strong>,</p>
<p>Tài khoản nhà tuyển dụng của bạn đã được tạo. Thông tin đăng nhập:</p>
<div class="credentials">
  <p><strong>Email:</strong> {{email}}</p>
  <p><strong>Tên đăng nhập:</strong> {{username}}</p>
  <p><strong>Mật khẩu:</strong> {{password}}</p>
</div>
<div class="warning">
  <strong>Lưu ý:</strong> Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu.
</div>
<p>Đăng nhập tại: <a href="{{loginUrl}}">{{loginUrl}}</a></p>
<p>Truy cập dashboard: <a href="{{dashboardUrl}}">{{dashboardUrl}}</a></p>
<p>Trân trọng,<br><strong>Đội ngũ {{siteName}}</strong></p>`,
    ),
    variables: [
      'fullName',
      'email',
      'username',
      'password',
      'loginUrl',
      'dashboardUrl',
      'siteName',
      'year',
    ],
  },
  {
    code: 'APPLICATION_CONFIRMATION',
    name: 'Xác nhận ứng tuyển',
    description: 'Gửi cho ứng viên sau khi nộp hồ sơ thành công.',
    subject: 'Xác nhận ứng tuyển: {{jobTitle}} - {{siteName}}',
    htmlBody: wrapBody(
      'Ứng tuyển thành công',
      `<p>Xin chào <strong>{{applicantName}}</strong>,</p>
<p>Chúng tôi đã nhận được hồ sơ ứng tuyển của bạn cho vị trí <strong>{{jobTitle}}</strong> tại <strong>{{companyName}}</strong>.</p>
<p>Ngày nộp: {{applicationDate}}</p>
<p>Nhà tuyển dụng sẽ xem xét và liên hệ với bạn nếu phù hợp.</p>
<p>Trân trọng,<br><strong>{{siteName}}</strong></p>`,
    ),
    variables: [
      'applicantName',
      'jobTitle',
      'companyName',
      'applicationDate',
      'siteName',
      'year',
    ],
  },
  {
    code: 'NEW_APPLICATION_EMPLOYER',
    name: 'Hồ sơ ứng tuyển mới (NTD)',
    description: 'Gửi cho host công ty khi có ứng viên nộp hồ sơ mới.',
    subject: 'Hồ sơ mới: {{jobTitle}} - {{applicantName}}',
    htmlBody: wrapBody(
      'Hồ sơ ứng tuyển mới',
      `<p>Xin chào,</p>
<p>Bạn có hồ sơ ứng tuyển mới cho tin <strong>{{jobTitle}}</strong>.</p>
<p><strong>Ứng viên:</strong> {{applicantName}}</p>
<p><strong>Email:</strong> {{applicantEmail}}</p>
<p><strong>Ngày nộp:</strong> {{applicationDate}}</p>
<p><a class="btn" href="{{dashboardUrl}}">Xem hồ sơ trên dashboard</a></p>`,
    ),
    variables: [
      'jobTitle',
      'applicantName',
      'applicantEmail',
      'applicationDate',
      'dashboardUrl',
      'siteName',
      'year',
    ],
  },
  {
    code: 'COMPANY_PENDING_ADMIN',
    name: 'Công ty chờ duyệt (Admin)',
    description: 'Gửi cho tất cả admin khi có công ty mới chờ duyệt.',
    subject: '[Admin] Công ty mới chờ duyệt: {{companyName}}',
    htmlBody: wrapBody(
      'Công ty chờ duyệt',
      `<p>Công ty <strong>{{companyName}}</strong> (MST: {{companyMst}}) vừa được đăng ký và đang chờ duyệt.</p>
<p><a class="btn" href="{{adminDashboardUrl}}">Mở trang quản trị</a></p>`,
    ),
    variables: [
      'companyName',
      'companyMst',
      'adminDashboardUrl',
      'siteName',
      'year',
    ],
  },
  {
    code: 'COMPANY_PENDING_EMPLOYER',
    name: 'Công ty chờ duyệt (NTD)',
    description:
      'Gửi cho user NTD khi đăng ký / được gắn vào công ty đang chờ admin duyệt.',
    subject: 'Công ty {{companyName}} đang chờ duyệt - {{siteName}}',
    htmlBody: wrapBody(
      'Đăng ký công ty thành công',
      `<p>Xin chào <strong>{{fullName}}</strong>,</p>
<p>Công ty <strong>{{companyName}}</strong> (MST: {{companyMst}}) đã được đăng ký trên {{siteName}} và đang chờ quản trị viên phê duyệt.</p>
<p>Bạn sẽ nhận email thông báo khi công ty được duyệt. Trong thời gian chờ, bạn có thể đăng nhập tại: <a href="{{loginUrl}}">{{loginUrl}}</a></p>
<p>Trân trọng,<br><strong>Đội ngũ {{siteName}}</strong></p>`,
    ),
    variables: [
      'fullName',
      'companyName',
      'companyMst',
      'loginUrl',
      'siteName',
      'year',
    ],
  },
  {
    code: 'COMPANY_APPROVED',
    name: 'Công ty được duyệt',
    description:
      'Gửi cho tất cả user NTD đang hoạt động thuộc công ty khi admin duyệt công ty.',
    subject: 'Công ty {{companyName}} đã được duyệt - {{siteName}}',
    htmlBody: wrapBody(
      'Công ty đã được duyệt',
      `<p>Xin chào <strong>{{fullName}}</strong>,</p>
<p>Công ty <strong>{{companyName}}</strong> của bạn đã được phê duyệt trên {{siteName}}.</p>
<p>Bạn có thể đăng tin tuyển dụng tại: <a href="{{dashboardUrl}}">{{dashboardUrl}}</a></p>`,
    ),
    variables: ['fullName', 'companyName', 'dashboardUrl', 'siteName', 'year'],
  },
  {
    code: 'COMPANY_REJECTED',
    name: 'Công ty bị từ chối',
    description:
      'Gửi cho tất cả user NTD đang hoạt động thuộc công ty khi admin từ chối / xóa mềm.',
    subject: 'Thông báo về công ty {{companyName}} - {{siteName}}',
    htmlBody: wrapBody(
      'Công ty chưa được duyệt',
      `<p>Xin chào <strong>{{fullName}}</strong>,</p>
<p>Rất tiếc, công ty <strong>{{companyName}}</strong> chưa được phê duyệt trên {{siteName}}.</p>
<p>{{rejectReason}}</p>
<p>Nếu cần hỗ trợ, vui lòng liên hệ quản trị viên.</p>`,
    ),
    variables: [
      'fullName',
      'companyName',
      'rejectReason',
      'siteName',
      'year',
    ],
  },
  {
    code: 'JOB_PENDING_ADMIN',
    name: 'Tin tuyển dụng chờ duyệt (Admin)',
    description: 'Gửi cho admin khi có tin mới ở trạng thái ADMIN_REVIEW.',
    subject: '[Admin] Tin mới chờ duyệt: {{jobTitle}}',
    htmlBody: wrapBody(
      'Tin chờ duyệt',
      `<p>Tin tuyển dụng <strong>{{jobTitle}}</strong> tại <strong>{{companyName}}</strong> đang chờ duyệt.</p>
<p><a class="btn" href="{{adminDashboardUrl}}">Mở trang quản trị</a></p>`,
    ),
    variables: [
      'jobTitle',
      'companyName',
      'adminDashboardUrl',
      'siteName',
      'year',
    ],
  },
  {
    code: 'JOB_PENDING_EMPLOYER',
    name: 'Tin tuyển dụng chờ duyệt (NTD)',
    description:
      'Gửi cho NTD khi đăng tin mới (free-post / dashboard) ở trạng thái ADMIN_REVIEW.',
    subject: 'Tin "{{jobTitle}}" đang chờ duyệt - {{siteName}}',
    htmlBody: wrapBody(
      'Đăng tin thành công',
      `<p>Xin chào <strong>{{fullName}}</strong>,</p>
<p>Tin tuyển dụng <strong>{{jobTitle}}</strong> tại <strong>{{companyName}}</strong> đã được gửi và đang chờ quản trị viên phê duyệt.</p>
<p>Bạn có thể theo dõi tại: <a href="{{dashboardUrl}}">{{dashboardUrl}}</a></p>
<p>Trân trọng,<br><strong>Đội ngũ {{siteName}}</strong></p>`,
    ),
    variables: [
      'fullName',
      'jobTitle',
      'companyName',
      'dashboardUrl',
      'siteName',
      'year',
    ],
  },
  {
    code: 'JOB_APPROVED',
    name: 'Tin tuyển dụng được duyệt',
    description: 'Gửi cho người tạo tin / host công ty khi tin được duyệt.',
    subject: 'Tin "{{jobTitle}}" đã được duyệt - {{siteName}}',
    htmlBody: wrapBody(
      'Tin đã được duyệt',
      `<p>Xin chào <strong>{{fullName}}</strong>,</p>
<p>Tin tuyển dụng <strong>{{jobTitle}}</strong> của bạn đã được phê duyệt và hiển thị công khai.</p>
<p><a class="btn" href="{{jobUrl}}">Xem tin tuyển dụng</a></p>`,
    ),
    variables: ['fullName', 'jobTitle', 'jobUrl', 'siteName', 'year'],
  },
  {
    code: 'JOB_REJECTED',
    name: 'Tin tuyển dụng bị từ chối',
    description: 'Gửi khi tin chuyển sang trạng thái REJECTED.',
    subject: 'Tin "{{jobTitle}}" chưa được duyệt - {{siteName}}',
    htmlBody: wrapBody(
      'Tin chưa được duyệt',
      `<p>Xin chào <strong>{{fullName}}</strong>,</p>
<p>Tin tuyển dụng <strong>{{jobTitle}}</strong> chưa được phê duyệt.</p>
<p>{{rejectReason}}</p>
<p>Bạn có thể chỉnh sửa và gửi lại tại: <a href="{{dashboardUrl}}">{{dashboardUrl}}</a></p>`,
    ),
    variables: [
      'fullName',
      'jobTitle',
      'rejectReason',
      'dashboardUrl',
      'siteName',
      'year',
    ],
  },
  {
    code: 'PASSWORD_CHANGED',
    name: 'Mật khẩu đã đổi',
    description: 'Gửi cho user sau khi đổi mật khẩu thành công.',
    subject: 'Mật khẩu đã được thay đổi - {{siteName}}',
    htmlBody: wrapBody(
      'Mật khẩu đã thay đổi',
      `<p>Xin chào <strong>{{fullName}}</strong>,</p>
<p>Mật khẩu tài khoản {{email}} của bạn vừa được thay đổi.</p>
<p>Nếu bạn không thực hiện thao tác này, hãy liên hệ quản trị viên ngay.</p>
<p>Thời gian: {{changedAt}}</p>`,
    ),
    variables: ['fullName', 'email', 'changedAt', 'siteName', 'year'],
  },
  {
    code: 'PASSWORD_RESET',
    name: 'Đặt lại mật khẩu',
    description: 'Gửi link đặt lại mật khẩu (hết hạn sau 1 giờ).',
    subject: 'Đặt lại mật khẩu - {{siteName}}',
    htmlBody: wrapBody(
      'Đặt lại mật khẩu',
      `<p>Xin chào <strong>{{fullName}}</strong>,</p>
<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản {{email}}.</p>
<p><a class="btn" href="{{resetUrl}}">Đặt lại mật khẩu</a></p>
<p>Link hết hạn lúc: {{expiresAt}}</p>
<p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`,
    ),
    variables: [
      'fullName',
      'email',
      'resetUrl',
      'expiresAt',
      'siteName',
      'year',
    ],
  },
  {
    code: 'JOB_EXPIRING_SOON',
    name: 'Tin sắp hết hạn',
    description: 'Cron hàng ngày: tin APPROVED còn ≤3 ngày trước deadline.',
    subject: 'Tin "{{jobTitle}}" sắp hết hạn - {{siteName}}',
    htmlBody: wrapBody(
      'Tin sắp hết hạn',
      `<p>Xin chào <strong>{{fullName}}</strong>,</p>
<p>Tin <strong>{{jobTitle}}</strong> sẽ hết hạn vào <strong>{{deadline}}</strong> (còn {{daysLeft}} ngày).</p>
<p><a class="btn" href="{{dashboardUrl}}">Quản lý tin trên dashboard</a></p>`,
    ),
    variables: [
      'fullName',
      'jobTitle',
      'deadline',
      'daysLeft',
      'dashboardUrl',
      'siteName',
      'year',
    ],
  },
  {
    code: 'JOB_EXPIRED',
    name: 'Tin đã hết hạn',
    description: 'Cron hàng ngày: tin APPROVED đã quá deadline.',
    subject: 'Tin "{{jobTitle}}" đã hết hạn - {{siteName}}',
    htmlBody: wrapBody(
      'Tin đã hết hạn',
      `<p>Xin chào <strong>{{fullName}}</strong>,</p>
<p>Tin <strong>{{jobTitle}}</strong> đã quá hạn nộp (deadline: {{deadline}}).</p>
<p>Bạn có thể đăng tin mới tại: <a href="{{dashboardUrl}}">{{dashboardUrl}}</a></p>`,
    ),
    variables: [
      'fullName',
      'jobTitle',
      'deadline',
      'dashboardUrl',
      'siteName',
      'year',
    ],
  },
  {
    code: 'EMAIL_VERIFICATION',
    name: 'Xác minh email',
    description: 'Chưa kích hoạt — dùng khi triển khai xác minh email tài khoản.',
    subject: 'Xác minh email - {{siteName}}',
    htmlBody: wrapBody(
      'Xác minh email',
      `<p>Xin chào <strong>{{fullName}}</strong>,</p>
<p>Vui lòng xác minh địa chỉ email của bạn:</p>
<p><a class="btn" href="{{verifyUrl}}">Xác minh email</a></p>`,
    ),
    variables: ['fullName', 'email', 'verifyUrl', 'siteName', 'year'],
    isActive: false,
  },
  {
    code: 'APPLICATION_STATUS_UPDATE',
    name: 'Cập nhật trạng thái hồ sơ',
    description:
      'Gửi khi NTD/admin cập nhật trạng thái xử lý hồ sơ ứng tuyển.',
    subject: 'Cập nhật hồ sơ: {{jobTitle}} - {{applicationStatus}}',
    htmlBody: wrapBody(
      'Cập nhật trạng thái hồ sơ',
      `<p>Xin chào <strong>{{applicantName}}</strong>,</p>
<p>Hồ sơ ứng tuyển vị trí <strong>{{jobTitle}}</strong> tại {{companyName}} đã được cập nhật.</p>
<p>Trạng thái mới: <strong>{{applicationStatus}}</strong></p>
<p>{{statusMessage}}</p>`,
    ),
    variables: [
      'applicantName',
      'jobTitle',
      'companyName',
      'applicationStatus',
      'statusMessage',
      'siteName',
      'year',
    ],
    isActive: true,
  },
];

export function getDefaultTemplate(code: string): DefaultEmailTemplate | undefined {
  return DEFAULT_EMAIL_TEMPLATES.find((t) => t.code === code);
}
