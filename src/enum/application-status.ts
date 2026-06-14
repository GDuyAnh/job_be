export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  REVIEWING = 'REVIEWING',
  INTERVIEW = 'INTERVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.SUBMITTED]: 'Đã nộp hồ sơ',
  [ApplicationStatus.REVIEWING]: 'Đang xem xét',
  [ApplicationStatus.INTERVIEW]: 'Mời phỏng vấn',
  [ApplicationStatus.ACCEPTED]: 'Trúng tuyển',
  [ApplicationStatus.REJECTED]: 'Không phù hợp',
};

export const APPLICATION_STATUS_VALUES = Object.values(
  ApplicationStatus,
) as ApplicationStatus[];
