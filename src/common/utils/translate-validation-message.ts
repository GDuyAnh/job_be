const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  password: 'Mật khẩu',
  currentPassword: 'Mật khẩu hiện tại',
  newPassword: 'Mật khẩu mới',
  confirmPassword: 'Xác nhận mật khẩu',
  username: 'Tên đăng nhập',
  fullName: 'Họ và tên',
  phone: 'Số điện thoại',
  phoneNumber: 'Số điện thoại',
  jobId: 'Mã việc làm',
  userId: 'Mã người dùng',
  companyId: 'Mã công ty',
  title: 'Tiêu đề',
  description: 'Mô tả',
  category: 'Danh mục',
  location: 'Địa điểm',
  name: 'Tên',
  mst: 'Mã số thuế',
  taxCode: 'Mã số thuế',
  logo: 'Logo',
  address: 'Địa chỉ',
  deadline: 'Hạn nộp hồ sơ',
  benefits: 'Phúc lợi',
  gender: 'Giới tính',
  grade: 'Cấp bậc',
  content: 'Nội dung',
  image: 'Ảnh',
  url: 'URL',
  titleSeo: 'Tiêu đề SEO',
  metaDescription: 'Mô tả meta',
  schema: 'Schema',
  organizationType: 'Loại hình tổ chức',
  isFeatured: 'Nổi bật',
  hasBanner: 'Có banner',
};

function fieldLabel(property: string): string {
  const key = property.split('.').pop() || property;
  return FIELD_LABELS[key] || key;
}

const RULE_TRANSLATIONS: Array<{
  test: RegExp;
  replace: (msg: string, property?: string) => string;
}> = [
  {
    test: /^property .+ should not exist$/,
    replace: (msg) => msg.replace(/^property (.+) should not exist$/, 'Trường $1 không được phép'),
  },
  {
    test: /^nested property .+ must be either object or array$/,
    replace: () => 'Dữ liệu lồng nhau không hợp lệ',
  },
  {
    test: / must be an email$/,
    replace: () => 'Email không hợp lệ',
  },
  {
    test: / must be a valid email$/,
    replace: () => 'Email không hợp lệ',
  },
  {
    test: / should not be empty$/,
    replace: (msg, property) =>
      property
        ? `${fieldLabel(property)} không được để trống`
        : msg.replace(/ should not be empty$/, ' không được để trống'),
  },
  {
    test: / must be a string$/,
    replace: (msg, property) =>
      property
        ? `${fieldLabel(property)} phải là chuỗi`
        : msg.replace(/ must be a string$/, ' phải là chuỗi'),
  },
  {
    test: / must be a number$/,
    replace: (msg, property) =>
      property
        ? `${fieldLabel(property)} phải là số`
        : msg.replace(/ must be a number$/, ' phải là số'),
  },
  {
    test: / must be an integer number$/,
    replace: (msg, property) =>
      property
        ? `${fieldLabel(property)} phải là số nguyên`
        : msg.replace(/ must be an integer number$/, ' phải là số nguyên'),
  },
  {
    test: / must be a boolean value$/,
    replace: (msg, property) =>
      property
        ? `${fieldLabel(property)} phải là giá trị đúng/sai`
        : msg.replace(/ must be a boolean value$/, ' phải là giá trị đúng/sai'),
  },
  {
    test: / must be a valid ISO 8601 date string$/,
    replace: (msg, property) =>
      property
        ? `${fieldLabel(property)} phải là ngày hợp lệ`
        : msg.replace(/ must be a valid ISO 8601 date string$/, ' phải là ngày hợp lệ'),
  },
  {
    test: / must be a URL address$/,
    replace: () => 'URL không hợp lệ',
  },
  {
    test: / must be longer than or equal to (\d+) characters$/,
    replace: (msg) =>
      msg.replace(
        /^(.+) must be longer than or equal to (\d+) characters$/,
        (_, prop, n) => `${fieldLabel(prop)} phải có ít nhất ${n} ký tự`,
      ),
  },
  {
    test: / must be shorter than or equal to (\d+) characters$/,
    replace: (msg) =>
      msg.replace(
        /^(.+) must be shorter than or equal to (\d+) characters$/,
        (_, prop, n) => `${fieldLabel(prop)} không được vượt quá ${n} ký tự`,
      ),
  },
  {
    test: / must not be less than (\d+)$/,
    replace: (msg) =>
      msg.replace(
        /^(.+) must not be less than (\d+)$/,
        (_, prop, n) => `${fieldLabel(prop)} không được nhỏ hơn ${n}`,
      ),
  },
  {
    test: / must not be greater than (\d+)$/,
    replace: (msg) =>
      msg.replace(
        /^(.+) must not be greater than (\d+)$/,
        (_, prop, n) => `${fieldLabel(prop)} không được lớn hơn ${n}`,
      ),
  },
  {
    test: / must be one of the following values: (.+)$/,
    replace: (msg) =>
      msg.replace(
        /^(.+) must be one of the following values: (.+)$/,
        (_, prop, values) => `${fieldLabel(prop)} phải là một trong các giá trị: ${values}`,
      ),
  },
];

/** Dịch message validation (class-validator mặc định hoặc tùy chỉnh tiếng Anh) sang tiếng Việt */
export function translateValidationMessage(message: string, property?: string): string {
  const trimmed = message?.trim();
  if (!trimmed) return trimmed;

  // Đã là tiếng Việt (có dấu hoặc từ khóa phổ biến)
  if (/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(trimmed)) {
    return trimmed;
  }

  for (const rule of RULE_TRANSLATIONS) {
    if (rule.test.test(trimmed)) {
      return rule.replace(trimmed, property);
    }
  }

  // Message động (có ID)
  const dynamic = translateDynamicMessage(trimmed);
  if (dynamic !== trimmed) return dynamic;

  // Message tùy chỉnh tiếng Anh trong DTO (pattern phổ biến)
  const custom = translateCustomDtoMessage(trimmed);
  if (custom !== trimmed) return custom;

  return trimmed;
}

function translateDynamicMessage(msg: string): string {
  const patterns: Array<[RegExp, string]> = [
    [/^Company with ID (.+) Không tìm thấy$/, 'Không tìm thấy công ty với ID $1'],
    [/^Job with ID (.+) Không tìm thấy$/, 'Không tìm thấy tin tuyển dụng với ID $1'],
    [/^Blog with ID (.+) Không tìm thấy$/, 'Không tìm thấy bài viết với ID $1'],
    [/^User with ID (.+) deleted successfully$/, 'Đã xóa người dùng ID $1 thành công'],
    [/^Job with (.+) deleted successfully$/, 'Đã xóa tin tuyển dụng $1 thành công'],
    [/^Company with ID (.+) deleted successfully$/, 'Đã xóa công ty ID $1 thành công'],
  ];

  for (const [regex, replacement] of patterns) {
    if (regex.test(msg)) return msg.replace(regex, replacement);
  }

  return msg;
}

function translateCustomDtoMessage(msg: string): string {
  const map: Record<string, string> = {
    'URL ảnh phải hợp lệ': 'URL ảnh phải hợp lệ',
    'URL ảnh không được để trống': 'URL ảnh không được để trống',
    'Tên công ty phải là chuỗi': 'Tên công ty phải là chuỗi',
    'Tên công ty không được để trống': 'Tên công ty không được để trống',
    'Mã số thuế phải là chuỗi': 'Mã số thuế phải là chuỗi',
    'Mã số thuế không được để trống': 'Mã số thuế không được để trống',
    'Logo phải là chuỗi': 'Logo phải là chuỗi',
    'Logo không được để trống': 'Logo không được để trống',
    'Loại hình tổ chức phải là số': 'Loại hình tổ chức phải là số',
    'Loại hình tổ chức không được để trống': 'Loại hình tổ chức không được để trống',
    'Trạng thái chờ duyệt phải là đúng/sai': 'Trạng thái chờ duyệt phải là đúng/sai',
    'Trạng thái nổi bật phải là đúng/sai': 'Trạng thái nổi bật phải là đúng/sai',
    'Liên kết Facebook phải là URL hợp lệ': 'Liên kết Facebook phải là URL hợp lệ',
    'Liên kết Twitter phải là URL hợp lệ': 'Liên kết Twitter phải là URL hợp lệ',
    'Liên kết LinkedIn phải là URL hợp lệ': 'Liên kết LinkedIn phải là URL hợp lệ',
    'Liên kết Instagram phải là URL hợp lệ': 'Liên kết Instagram phải là URL hợp lệ',
    'URL video phải hợp lệ': 'URL video phải hợp lệ',
    'Website phải là URL hợp lệ bắt đầu bằng http:// hoặc https://':
      'Website phải là URL hợp lệ bắt đầu bằng http:// hoặc https://',
    'Địa chỉ phải là chuỗi': 'Địa chỉ phải là chuỗi',
    'Địa chỉ không được để trống': 'Địa chỉ không được để trống',
    'Địa chỉ thuế phải là chuỗi': 'Địa chỉ thuế phải là chuỗi',
    'Email phải là chuỗi': 'Email phải là chuỗi',
    'Quy mô công ty phải là số nguyên': 'Quy mô công ty phải là số nguyên',
    'Quy mô công ty không được âm': 'Quy mô công ty không được âm',
    'Năm thành lập phải là số nguyên': 'Năm thành lập phải là số nguyên',
    'Năm thành lập phải từ 1800 trở lên': 'Năm thành lập phải từ 1800 trở lên',
    'Năm thành lập không được vượt quá 2100': 'Năm thành lập không được vượt quá 2100',
    'Mô tả phải là chuỗi': 'Mô tả phải là chuỗi',
    'Insight must be a string': 'Thông tin nổi bật phải là chuỗi',
    'Tổng quan phải là chuỗi': 'Tổng quan phải là chuỗi',
    'Ảnh banner phải là URL hợp lệ': 'Ảnh banner phải là URL hợp lệ',
    'Tiêu đề phải là chuỗi': 'Tiêu đề phải là chuỗi',
    'Tiêu đề không được để trống': 'Tiêu đề không được để trống',
    'Tiêu đề không được vượt quá 255 ký tự': 'Tiêu đề không được vượt quá 255 ký tự',
    'Mô tả không được để trống': 'Mô tả không được để trống',
    'Danh mục phải là chuỗi': 'Danh mục phải là chuỗi',
    'Danh mục phải là số': 'Danh mục phải là số',
    'Địa điểm phải là chuỗi': 'Địa điểm phải là chuỗi',
    'Địa điểm phải là số': 'Địa điểm phải là số',
    'Hình thức làm việc phải là số': 'Hình thức làm việc phải là số',
    'Hình thức làm việc không được để trống': 'Hình thức làm việc không được để trống',
    'Mỗi hình thức làm việc phải là số': 'Mỗi hình thức làm việc phải là số',
    'Kinh nghiệm phải là số': 'Kinh nghiệm phải là số',
    'Kinh nghiệm không được để trống': 'Kinh nghiệm không được để trống',
    'Mỗi mức kinh nghiệm phải là số': 'Mỗi mức kinh nghiệm phải là số',
    'Bằng cấp yêu cầu phải là số': 'Bằng cấp yêu cầu phải là số',
    'Bằng cấp yêu cầu không được để trống': 'Bằng cấp yêu cầu không được để trống',
    'Giới tính phải là chuỗi': 'Giới tính phải là chuỗi',
    'Giới tính không được để trống': 'Giới tính không được để trống',
    'Cấp bậc phải là số': 'Cấp bậc phải là số',
    'Cấp bậc không được để trống': 'Cấp bậc không được để trống',
    'Mã công ty phải là số': 'Mã công ty phải là số',
    'CompanyId must be a number': 'Mã công ty phải là số',
    'Mã người dùng phải là số': 'Mã người dùng phải là số',
    'UserId must be a number': 'Mã người dùng phải là số',
    'Logo ảnh phải là chuỗi': 'Logo ảnh phải là chuỗi',
    'Banner phải là chuỗi': 'Banner phải là chuỗi',
    'Ngày đăng phải là ngày hợp lệ': 'Ngày đăng phải là ngày hợp lệ',
    'Hạn nộp phải là ngày hợp lệ': 'Hạn nộp phải là ngày hợp lệ',
    'Hạn nộp không được để trống': 'Hạn nộp không được để trống',
    'Lương tối thiểu phải là số': 'Lương tối thiểu phải là số',
    'Lương tối thiểu không được âm': 'Lương tối thiểu không được âm',
    'Lương tối đa phải là số': 'Lương tối đa phải là số',
    'Lương tối đa không được âm': 'Lương tối đa không được âm',
    'Loại lương phải là số': 'Loại lương phải là số',
    'Loại lương không được để trống': 'Loại lương không được để trống',
    'Phúc lợi phải là chuỗi': 'Phúc lợi phải là chuỗi',
    'Phúc lợi không được để trống': 'Phúc lợi không được để trống',
    'Mô tả chi tiết phải là chuỗi': 'Mô tả chi tiết phải là chuỗi',
    'Trạng thái phải là chuỗi': 'Trạng thái phải là chuỗi',
    'Loại tin phải là chuỗi': 'Loại tin phải là chuỗi',
    'Ghi chú phải là chuỗi': 'Ghi chú phải là chuỗi',
    'Email không hợp lệ': 'Email không hợp lệ',
    'Số điện thoại phải là chuỗi': 'Số điện thoại phải là chuỗi',
    'Loại địa điểm phải là số': 'Loại địa điểm phải là số',
    'Full name must be at least 2 characters': 'Họ và tên phải có ít nhất 2 ký tự',
    'Username must be at least 3 characters': 'Tên đăng nhập phải có ít nhất 3 ký tự',
    'Password must be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự',
    'Mô tả meta không được vượt quá 1000 ký tự':
      'Mô tả meta không được vượt quá 1000 ký tự',
    'Schema không được vượt quá 1000 ký tự': 'Schema không được vượt quá 1000 ký tự',
    'Chưa tải lên tệp': 'Chưa tải lên tệp',
    'Thư mục không hợp lệ': 'Thư mục không hợp lệ',
    'Danh sách URL là bắt buộc và không được rỗng':
      'Danh sách URL là bắt buộc và không được rỗng',
    'Mã người dùng là bắt buộc': 'Mã người dùng là bắt buộc',
    'incorrect login information': 'Thông tin đăng nhập không chính xác',
    'Incorrect login information': 'Thông tin đăng nhập không chính xác',
    'Mật khẩu mới và xác nhận mật khẩu không khớp':
      'Mật khẩu mới và xác nhận mật khẩu không khớp',
    'Mật khẩu hiện tại không chính xác': 'Mật khẩu hiện tại không chính xác',
    'Mật khẩu không chính xác': 'Mật khẩu không chính xác',
    'Tên đăng nhập đã tồn tại': 'Tên đăng nhập đã tồn tại',
    'Không tìm thấy người dùng': 'Không tìm thấy người dùng',
    'Người dùng không thuộc công ty này': 'Người dùng không thuộc công ty này',
    'Company name is required and cannot be empty':
      'Tên công ty là bắt buộc và không được để trống',
    'Logo công ty là bắt buộc và không được để trống':
      'Logo công ty là bắt buộc và không được để trống',
    'Mã số thuế là bắt buộc và không được để trống': 'Mã số thuế là bắt buộc và không được để trống',
    'Tên công ty đã tồn tại': 'Tên công ty đã tồn tại',
    'Logo is required and cannot be empty': 'Logo là bắt buộc và không được để trống',
    'Không thể xóa công ty đang có tin tuyển dụng hoạt động':
      'Không thể xóa công ty đang có tin tuyển dụng hoạt động',
    'Không tìm thấy công ty': 'Không tìm thấy công ty',
    'Job not found': 'Không tìm thấy tin tuyển dụng',
    'Tin tuyển dụng đã được duyệt': 'Tin tuyển dụng đã được duyệt',
    'Lương tối thiểu là bắt buộc khi loại lương không phải thỏa thuận':
      'Lương tối thiểu là bắt buộc khi loại lương không phải thỏa thuận',
    'Lương tối đa là bắt buộc khi loại lương không phải thỏa thuận':
      'Lương tối đa là bắt buộc khi loại lương không phải thỏa thuận',
    'Mức lương không được âm': 'Mức lương không được âm',
    'Lương tối thiểu không được lớn hơn lương tối đa':
      'Lương tối thiểu không được lớn hơn lương tối đa',
    'Hạn nộp không được sớm hơn ngày đăng':
      'Hạn nộp không được sớm hơn ngày đăng',
    'Hạn nộp không được quá 1 tháng sau ngày đăng':
      'Hạn nộp không được quá 1 tháng sau ngày đăng',
    'Application not found or unauthorized': 'Không tìm thấy hồ sơ hoặc không có quyền',
    'You have already applied for this job': 'Bạn đã ứng tuyển tin này rồi',
    'Application not found': 'Không tìm thấy hồ sơ ứng tuyển',
    'Tải tệp lên thất bại': 'Tải tệp lên thất bại',
    'Tạo URL tải lên thất bại': 'Tạo URL tải lên thất bại',
    'Định dạng tệp không hợp lệ. Chỉ cho phép PDF, DOC và DOCX.':
      'Định dạng tệp không hợp lệ. Chỉ cho phép PDF, DOC và DOCX.',
    'Kích thước tệp phải nhỏ hơn 5MB.': 'Kích thước tệp phải nhỏ hơn 5MB.',
    'Định dạng tệp không hợp lệ. Chỉ cho phép JPEG và PNG.':
      'Định dạng tệp không hợp lệ. Chỉ cho phép JPEG và PNG.',
    'Kích thước tệp phải nhỏ hơn 3MB.': 'Kích thước tệp phải nhỏ hơn 3MB.',
    'Invalid salary range': 'Khoảng lương không hợp lệ',
    'Invalid image URL': 'URL ảnh không hợp lệ',
    'Invalid image path': 'Đường dẫn ảnh không hợp lệ',
    'Image path not allowed': 'Đường dẫn ảnh không được phép',
    'Image not found': 'Không tìm thấy ảnh',
    'Failed to load image': 'Không tải được ảnh',
    'url is required': 'URL là bắt buộc',
    'not found': 'Không tìm thấy',
    'Application submitted successfully': 'Gửi hồ sơ ứng tuyển thành công',
    'Application deleted successfully': 'Đã xóa hồ sơ ứng tuyển',
    'Password changed successfully': 'Đổi mật khẩu thành công',
    'Account deleted successfully': 'Đã xóa tài khoản thành công',
    'CV uploaded successfully': 'Tải CV lên thành công',
    'Cover letter uploaded successfully': 'Tải thư xin việc lên thành công',
    'Avatar uploaded successfully': 'Tải ảnh đại diện lên thành công',
    'Image uploaded successfully': 'Tải ảnh lên thành công',
    'Batch delete initiated': 'Đã bắt đầu xóa hàng loạt',
    'Failed to upload file': 'Tải tệp lên thất bại',
    'Failed to generate upload URL': 'Tạo URL tải lên thất bại',
    'Company logo is required and cannot be empty':
      'Logo công ty là bắt buộc và không được để trống',
    'MST is required and cannot be empty': 'Mã số thuế là bắt buộc và không được để trống',
    'Company name already exists': 'Tên công ty đã tồn tại',
    'Can not delete company with active jobs':
      'Không thể xóa công ty đang có tin tuyển dụng hoạt động',
    'Company not found': 'Không tìm thấy công ty',
    'Job has already been approved': 'Tin tuyển dụng đã được duyệt',
    'Salary Min is required when salary type is not negotiable':
      'Lương tối thiểu là bắt buộc khi loại lương không phải thỏa thuận',
    'Salary Max is required when salary type is not negotiable':
      'Lương tối đa là bắt buộc khi loại lương không phải thỏa thuận',
    'Salary must be non-negative': 'Mức lương không được âm',
    'Minimum salary cannot be greater than maximum salary':
      'Lương tối thiểu không được lớn hơn lương tối đa',
    'Deadline cannot be earlier than posted date':
      'Hạn nộp không được sớm hơn ngày đăng',
    'Deadline cannot be more than 1 month after posted date':
      'Hạn nộp không được quá 1 tháng sau ngày đăng',
  };

  return map[msg] ?? msg;
}
