-- Xóa cột isWaiting khỏi bảng jobs (đã chuyển sang dùng status).
-- Chạy sau khi đã backfill status (backfill-job-status.sql).

ALTER TABLE jobs DROP COLUMN IF EXISTS isWaiting;
