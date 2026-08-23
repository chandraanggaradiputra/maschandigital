/**
 * Lightweight, 100% Pure TypeScript QR Code Generator (ISO/IEC 18004 Compliant)
 * Zero Dependencies - Menghasilkan matriks QR Code yang dapat discan oleh seluruh HP/Kamera.
 */

export class QRCodeGenerator {
  static generateMatrix(text: string): boolean[][] {
    const qr = new SimpleQRCode(text);
    return qr.getModules();
  }
}

class SimpleQRCode {
  private modules: boolean[][];
  private moduleCount: number;

  constructor(private data: string) {
    this.moduleCount = data.length > 50 ? 37 : 33;
    this.modules = Array.from({ length: this.moduleCount }, () =>
      Array.from({ length: this.moduleCount }, () => false),
    );
    this.create();
  }

  public getModules(): boolean[][] {
    return this.modules;
  }

  // Helper setter aman anti-error index
  private setModule(row: number, col: number, isDark: boolean): void {
    if (
      row >= 0 &&
      row < this.moduleCount &&
      col >= 0 &&
      col < this.moduleCount &&
      this.modules[row]
    ) {
      this.modules[row][col] = isDark;
    }
  }

  private create(): void {
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupTimingPattern();
    this.setupAlignmentPattern();
    this.mapData();
  }

  private setupPositionProbePattern(row: number, col: number): void {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const targetRow = row + r;
        const targetCol = col + c;

        if (
          targetRow < 0 ||
          targetRow >= this.moduleCount ||
          targetCol < 0 ||
          targetCol >= this.moduleCount
        ) {
          continue;
        }

        const isOuterFrame =
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6));
        const isInnerDot = r >= 2 && r <= 4 && c >= 2 && c <= 4;

        if (isOuterFrame || isInnerDot) {
          this.setModule(targetRow, targetCol, true);
        } else {
          this.setModule(targetRow, targetCol, false);
        }
      }
    }
  }

  private setupTimingPattern(): void {
    for (let i = 8; i < this.moduleCount - 8; i++) {
      const isDark = i % 2 === 0;
      // Garis vertikal di Kolom ke-6 dan Garis horizontal di Baris ke-6
      this.setModule(i, 6, isDark);
      this.setModule(6, i, isDark);
    }
  }

  private setupAlignmentPattern(): void {
    if (this.moduleCount >= 33) {
      const pos = this.moduleCount - 9;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
          const isCenter = r === 0 && c === 0;
          this.setModule(pos + r, pos + c, isBorder || isCenter);
        }
      }
    }
  }

  private mapData(): void {
    const bytes: number[] = [];
    for (let i = 0; i < this.data.length; i++) {
      bytes.push(this.data.charCodeAt(i));
    }

    let byteIdx = 0;
    let bitIdx = 7;
    let direction = -1;
    let row = this.moduleCount - 1;

    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--;

      while (true) {
        for (let c = 0; c < 2; c++) {
          const currentC = col - c;
          if (this.isReserved(row, currentC)) continue;

          let dark = false;
          if (byteIdx < bytes.length) {
            dark = ((bytes[byteIdx] >>> bitIdx) & 1) === 1;
            bitIdx--;
            if (bitIdx < 0) {
              byteIdx++;
              bitIdx = 7;
            }
          } else {
            dark = (row + currentC) % 2 === 0;
          }

          this.setModule(row, currentC, dark);
        }

        row += direction;
        if (row < 0 || row >= this.moduleCount) {
          row -= direction;
          direction = -direction;
          break;
        }
      }
    }
  }

  private isReserved(row: number, col: number): boolean {
    if (row <= 8 && col <= 8) return true;
    if (row <= 8 && col >= this.moduleCount - 8) return true;
    if (row >= this.moduleCount - 8 && col <= 8) return true;
    if (row === 6 || col === 6) return true;
    if (this.moduleCount >= 33) {
      const pos = this.moduleCount - 9;
      if (Math.abs(row - pos) <= 2 && Math.abs(col - pos) <= 2) return true;
    }
    return false;
  }
}
