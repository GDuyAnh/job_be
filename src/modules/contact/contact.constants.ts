export const CONTACT_SUBJECT_CODES = [
  'candidate_support',
  'employer_support',
  'website_feedback',
  'business_partnership',
  'other',
] as const;

export type ContactSubjectCode = (typeof CONTACT_SUBJECT_CODES)[number];

export const CONTACT_SUBJECT_LABELS: Record<ContactSubjectCode, string> = {
  candidate_support: 'Hỗ trợ ứng viên',
  employer_support: 'Hỗ trợ nhà tuyển dụng',
  website_feedback: 'Góp ý website',
  business_partnership: 'Hợp tác kinh doanh',
  other: 'Khác',
};
