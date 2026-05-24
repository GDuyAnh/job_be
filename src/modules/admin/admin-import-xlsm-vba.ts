import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

/** Đọc blob VBA từ file cạnh (build) nếu có. */
export function tryReadVbarawBytes(): Buffer | null {
  const candidates = [
    path.join(__dirname, 'assets', 'vbaraw.bin'),
    path.join(process.cwd(), 'src', 'modules', 'admin', 'assets', 'vbaraw.bin'),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).size > 0) {
        return fs.readFileSync(p);
      }
    } catch {
      /* bỏ qua */
    }
  }
  return null;
}

/**
 * Gắn vbaProject đã trích từ file .xlsm mẫu (Excel) → xuất lại dạng .xlsm.
 * ExcelJS chỉ tạo .xlsx; SheetJS mới lưu được macro.
 */
export function attachVbaToXlsm(xlsxBuffer: Buffer, vbaraw: Buffer): Buffer {
  const wb = XLSX.read(xlsxBuffer, { type: 'buffer' });
  wb.vbaraw = vbaraw;
  const out = XLSX.write(wb, { bookType: 'xlsm', type: 'buffer', bookVBA: true }) as Buffer;
  return Buffer.isBuffer(out) ? out : Buffer.from(out);
}
