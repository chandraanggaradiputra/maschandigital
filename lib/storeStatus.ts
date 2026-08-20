import { StoreHours } from "@/types";

export interface StoreStatus {
  isOpen: boolean;
  isVacation: boolean;
  vacationMessage: string;
  statusText: string;
  reason: "vacation" | "closed_hours" | "closed_day" | "open";
  todaySchedule?: string;
}

// Backend WCFM/GraphQL bisa mengirim vacation mode dalam beberapa bentuk:
// object camelCase (GraphQL), object snake_case (REST lama), boolean, atau string 'yes'/'no'.
type VacationModeInput =
  | boolean
  | string
  | {
      isEnabled?: boolean | string;
      vacationMessage?: string;
      is_enabled?: boolean | string;
      vacation_message?: string;
    }
  | undefined;

/**
 * Cek status operasional toko secara real-time berdasarkan Jam Buka & Mode Libur
 */
export function checkStoreStatus(
  storeHours?: StoreHours,
  vacationMode?: VacationModeInput,
): StoreStatus {
  // 1. Cek Mode Libur (Vacation Mode) - Deteksi fleksibel (boolean / string 'yes' / objek)
  const vacationObj =
    typeof vacationMode === "object" && vacationMode !== null
      ? vacationMode
      : null;

  const isVacation = Boolean(
    vacationMode === true ||
    vacationMode === "yes" ||
    vacationObj?.isEnabled === true ||
    vacationObj?.isEnabled === "yes" ||
    vacationObj?.is_enabled === true ||
    vacationObj?.is_enabled === "yes",
  );

  if (isVacation) {
    const msg =
      vacationObj?.vacationMessage ||
      vacationObj?.vacation_message ||
      "Toko kami sedang libur sementara waktu.";

    return {
      isOpen: false,
      isVacation: true,
      vacationMessage: msg,
      statusText: "Toko Sedang Libur",
      reason: "vacation",
    };
  }

  // Jika tidak ada konfigurasi jam operasional khusus, default dianggap buka
  if (!storeHours) {
    return {
      isOpen: true,
      isVacation: false,
      vacationMessage: "",
      statusText: "Buka Sekarang",
      reason: "open",
    };
  }

  // 2. Cek Hari dan Jam Operasional
  const now = new Date();
  const dayIndex = now.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  const dayKeys: (keyof StoreHours)[] = [
    "minggu",
    "senin",
    "selasa",
    "rabu",
    "kamis",
    "jumat",
    "sabtu",
  ];
  const currentDayKey = dayKeys[dayIndex];

  const todayConfig = storeHours[currentDayKey];

  // Jika hari ini toko tutup
  if (!todayConfig || !todayConfig.isOpen) {
    return {
      isOpen: false,
      isVacation: false,
      vacationMessage: "",
      statusText: "Toko Tutup Hari Ini",
      reason: "closed_day",
      todaySchedule: "Tutup hari ini",
    };
  }

  // Cek jam operasional hari ini
  const currentHours = String(now.getHours()).padStart(2, "0");
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  const openTime = todayConfig.openTime || "08:00";
  const closeTime = todayConfig.closeTime || "17:00";

  if (currentTimeStr < openTime || currentTimeStr >= closeTime) {
    return {
      isOpen: false,
      isVacation: false,
      vacationMessage: "",
      statusText: "Toko Sedang Tutup",
      reason: "closed_hours",
      todaySchedule: `Jam buka: ${openTime} - ${closeTime}`,
    };
  }

  return {
    isOpen: true,
    isVacation: false,
    vacationMessage: "",
    statusText: "Buka Sekarang",
    reason: "open",
    todaySchedule: `Buka sampai ${closeTime}`,
  };
}
