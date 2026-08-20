import { StoreHours, VacationMode } from "@/types";

export interface StoreStatus {
  isOpen: boolean;
  isVacation: boolean;
  vacationMessage: string;
  statusText: string;
  reason: "vacation" | "closed_hours" | "closed_day" | "open";
  todaySchedule?: string;
}

/**
 * Cek status operasional toko secara real-time berdasarkan Jam Buka & Mode Libur
 */
export function checkStoreStatus(
  storeHours?: StoreHours,
  vacationMode?: any,
): StoreStatus {
  // 1. Cek Mode Libur (Vacation Mode) - Deteksi fleksibel (boolean / string 'yes' / objek)
  const isVacation = Boolean(
    vacationMode &&
    (vacationMode.isEnabled === true ||
      vacationMode.isEnabled === "yes" ||
      vacationMode.is_enabled === true ||
      vacationMode.is_enabled === "yes" ||
      vacationMode === true ||
      vacationMode === "yes"),
  );

  if (isVacation) {
    const msg =
      typeof vacationMode === "object"
        ? vacationMode.vacationMessage ||
          vacationMode.vacation_message ||
          "Toko kami sedang libur sementara waktu."
        : "Toko kami sedang libur sementara waktu.";

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
