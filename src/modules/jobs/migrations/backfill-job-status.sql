-- Chạy một lần sau khi thêm cột status vào bảng jobs.
-- Backfill: status từ isWaiting (đã có sẵn).
-- ADMIN_REVIEW/PENDING/REJECTED = không hiển thị (isWaiting true)
-- APPROVED = hiển thị (isWaiting false)

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS status VARCHAR(20) NULL DEFAULT 'ADMIN_REVIEW';

UPDATE jobs
SET status = CASE WHEN isWaiting = 1 THEN 'ADMIN_REVIEW' ELSE 'APPROVED' END
WHERE status IS NULL;
