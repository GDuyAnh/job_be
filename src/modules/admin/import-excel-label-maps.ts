/**
 * Nhãn hiển thị (trùng nội dung sheet lists / master FE) → mã số lưu DB
 */

export const CATEGORY: { code: number; label: string }[] = [
  { code: 1, label: 'Giáo viên mầm non' },
  { code: 2, label: 'Giáo viên tiểu học' },
  { code: 3, label: 'Giáo viên ngữ văn' },
  { code: 4, label: 'Giáo viên toán' },
  { code: 5, label: 'Giáo viên tiếng Anh' },
  { code: 6, label: 'Giáo viên giáo dục công dân' },
  { code: 7, label: 'Giáo viên lịch sử' },
  { code: 8, label: 'Giáo viên địa lí' },
  { code: 9, label: 'Giáo viên khoa học tự nhiên' },
  { code: 10, label: 'Giáo viên công nghệ' },
  { code: 11, label: 'Giáo viên tin học' },
  { code: 12, label: 'Giáo viên giáo dục thể chất' },
  { code: 13, label: 'Giáo viên nghệ thuật (âm nhạc, mĩ thuật)' },
  { code: 14, label: 'Giáo viên hoạt động trải nghiệm, hướng nghiệp' },
  { code: 15, label: 'Giáo viên vật lý' },
  { code: 16, label: 'Giáo viên hoá học' },
  { code: 17, label: 'Giáo viên giáo dục địa phương' },
  { code: 18, label: 'Giáo viên tiếng Pháp' },
  { code: 19, label: 'Giáo viên tiếng Đức' },
  { code: 20, label: 'Giáo viên tiếng Nga' },
  { code: 21, label: 'Giáo viên tiếng Nhật' },
  { code: 22, label: 'Giáo viên tiếng Hàn' },
  { code: 23, label: 'Giáo viên tiếng Trung' },
  { code: 24, label: 'Giáo viên tiếng Tây Ban Nha' },
  { code: 25, label: 'Giáo viên StEM/StEAM' },
  { code: 26, label: 'Trợ giảng' },
  { code: 27, label: 'Trợ giảng tiếng Anh' },
  { code: 28, label: 'Trợ giảng toán' },
]

export const LOCATION: { code: number; label: string }[] = [
  { code: 1, label: 'Tuyên Quang' },
  { code: 2, label: 'Cao Bằng' },
  { code: 3, label: 'Lai Châu' },
  { code: 4, label: 'Lào Cai' },
  { code: 5, label: 'Thái Nguyên' },
  { code: 6, label: 'Điện Biên' },
  { code: 7, label: 'Lạng Sơn' },
  { code: 8, label: 'Sơn La' },
  { code: 9, label: 'Phú Thọ' },
  { code: 10, label: 'Bắc Ninh' },
  { code: 11, label: 'Quảng Ninh' },
  { code: 12, label: 'TP. Hà Nội' },
  { code: 13, label: 'TP. Hải Phòng' },
  { code: 14, label: 'Hưng Yên' },
  { code: 15, label: 'Ninh Bình' },
  { code: 16, label: 'Thanh Hóa' },
  { code: 17, label: 'Nghệ An' },
  { code: 18, label: 'Hà Tĩnh' },
  { code: 19, label: 'Quảng Trị' },
  { code: 20, label: 'TP. Huế' },
  { code: 21, label: 'TP. Đà Nẵng' },
  { code: 22, label: 'Quảng Ngãi' },
  { code: 23, label: 'Gia Lai' },
  { code: 24, label: 'Đắk Lắk' },
  { code: 25, label: 'Khánh Hoà' },
  { code: 26, label: 'Lâm Đồng' },
  { code: 27, label: 'Đồng Nai' },
  { code: 28, label: 'Tây Ninh' },
  { code: 29, label: 'TP. Hồ Chí Minh' },
  { code: 30, label: 'Đồng Tháp' },
  { code: 31, label: 'An Giang' },
  { code: 32, label: 'Vĩnh Long' },
  { code: 33, label: 'TP. Cần Thơ' },
  { code: 34, label: 'Cà Mau' },
]

export const TYPE_OF_EMPLOYMENT: { code: number; label: string }[] = [
  { code: 1, label: 'Thực tập sinh' },
  { code: 2, label: 'Toàn thời gian' },
  { code: 3, label: 'Bán thời gian' },
  { code: 4, label: 'Remote' },
  { code: 5, label: 'Tạm thời/dự án' },
]

export const SALARY_TYPE: { code: number; label: string }[] = [
  { code: 1, label: 'Tháng' },
  { code: 2, label: 'Tuần' },
  { code: 3, label: 'Giờ' },
  { code: 4, label: 'Theo hợp đồng dự án' },
  { code: 5, label: 'Thương lượng' },
]

export const ORGANIZATION_TYPE: { code: number; label: string }[] = [
  { code: 1, label: 'Trường Công Lập' },
  { code: 2, label: 'Trường Tư thục' },
  { code: 3, label: 'Trường Quốc Tế' },
  { code: 4, label: 'Trường Công Giáo' },
  { code: 5, label: 'Trung Tâm' },
  { code: 6, label: 'Trường Giáo Dục Đặc Biệt' },
  { code: 7, label: 'Trường Dạy Nghề' },
  { code: 8, label: 'Khác' },
]

export const EXPERIENCE_LEVEL: { code: number; label: string }[] = [
  { code: 1, label: 'Dưới 1 năm' },
  { code: 2, label: '2 năm' },
  { code: 3, label: '3 năm' },
  { code: 4, label: '4 năm' },
  { code: 5, label: '5 năm' },
  { code: 6, label: '6 năm +' },
  { code: 7, label: 'Không yêu cầu' },
]

export const GRADE: { code: number; label: string }[] = [
  { code: 1, label: 'Mầm non' },
  { code: 2, label: 'Tiểu học' },
  { code: 3, label: 'Trung học' },
  { code: 4, label: 'Phổ thông' },
  { code: 5, label: 'Cao đẳng' },
  { code: 6, label: 'Đại học' },
  { code: 7, label: 'Sau đại học' },
  { code: 8, label: 'Khác' },
]

export const REQUIRED_QUALIFICATION: { code: number; label: string }[] = [
  { code: 1, label: 'Chưa tốt nghiệp' },
  { code: 2, label: 'Cao đẳng' },
  { code: 3, label: 'Đại học' },
  { code: 4, label: 'Sư phạm' },
  { code: 5, label: 'Thạc sĩ' },
  { code: 6, label: 'Phó tiến sĩ' },
  { code: 7, label: 'Tiến sĩ' },
]

export const GENDER_JOB: { code: number; label: string }[] = [
  { code: 1, label: 'Nam' },
  { code: 2, label: 'Nữ' },
]

export const JOB_BENEFITS: { code: number; label: string }[] = [
  { code: 1, label: 'Bảo hiểm' },
  { code: 2, label: 'Du lịch' },
  { code: 3, label: 'Thưởng' },
  { code: 4, label: 'Chăm sóc sức khỏe' },
  { code: 5, label: 'Đào tạo' },
  { code: 6, label: 'Tăng lương' },
  { code: 7, label: 'Cấp laptop' },
  { code: 8, label: 'Phụ cấp ăn trưa' },
  { code: 9, label: 'Phụ cấp đi lại' },
  { code: 10, label: 'Nghỉ phép có lương' },
  { code: 11, label: 'Hỗ trợ nhà ở' },
  { code: 12, label: 'Đồng phục' },
  { code: 13, label: 'Teambuilding' },
  { code: 14, label: 'Thưởng hiệu suất' },
  { code: 15, label: 'Khám sức khỏe định kỳ' },
]

export const ROLE_USER: { code: number; label: string }[] = [
  { code: 1, label: 'Ứng viên (USER)' },
  { code: 2, label: 'Quản trị (ADMIN)' },
  { code: 3, label: 'Nhà tuyển dụng (COMPANY)' },
]

const SELECT_MULTI_LABEL = '---Select-multi---';
const SELECT_SINGLE_LABEL = '---Select-single---';

function isSelectHintLabel(v: string): boolean {
  const t = v.trim();
  return t === SELECT_MULTI_LABEL || t === SELECT_SINGLE_LABEL;
}

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
}

function leadingCode(p: string): number | null {
  const t = p.trim()
  if (/^\d+$/.test(t)) {
    const n = parseInt(t, 10)
    return Number.isFinite(n) ? n : null
  }
  const m = t.match(/^(\d+)\s*[-–—:]\s*/)
  if (m) {
    return parseInt(m[1], 10)
  }
  return null
}

function findByList(list: { code: number; label: string }[], p: string): number | null {
  const t = p.trim()
  if (!t) return null
  const lc = leadingCode(t)
  if (lc != null) {
    if (list.some((x) => x.code === lc)) return lc
  }
  const n = norm(t)
  const exact = list.find((x) => norm(x.label) === n)
  if (exact) return exact.code
  const inc = list.find((x) => n.includes(norm(x.label)) || norm(x.label).includes(n))
  if (inc) return inc.code
  return null
}

/** category / location: chuỗi mã lưu DB, nhiều mã cách phẩy/chấm phẩy */
export function resolveCommaCodes(
  raw: string,
  list: { code: number; label: string }[],
  field: string,
): string {
  const t = raw.trim()
  if (!t) return ''
  const parts = t.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
  const out: number[] = []
  for (const p of parts) {
    // User có thể lỡ chọn nhãn hint trong dropdown → coi như rỗng để import không lỗi.
    if (isSelectHintLabel(p)) continue
    const c = findByList(list, p)
    if (c == null) {
      if (/^\d+$/.test(p.trim())) {
        out.push(parseInt(p, 10))
        continue
      }
      throw new Error(`${field}: không map được "${p}"`)
    }
    out.push(c)
  }
  return out.join(',')
}

export function resolveSingleCode(
  raw: string,
  list: { code: number; label: string }[],
  field: string,
  fallback = 0,
): number {
  const t = raw.trim()
  if (!t) return fallback
  if (isSelectHintLabel(t)) return fallback
  const c = findByList(list, t)
  if (c == null) {
    if (/^\d+$/.test(t)) {
      const n = parseInt(t, 10)
      if (list.some((x) => x.code === n)) return n
    }
    throw new Error(`${field}: không map được "${raw}"`)
  }
  return c
}

export function resolveRoleUser(raw: string, fallback: number): number {
  const t = raw.trim()
  if (!t) return fallback
  if (isSelectHintLabel(t)) return fallback
  const c = findByList(ROLE_USER, t)
  if (c != null) return c
  if (/^\d+$/.test(t)) {
    const n = parseInt(t, 10)
    if (n === 1 || n === 2 || n === 3) return n
  }
  return fallback
}
