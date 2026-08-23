// import { StoreHours } from "@/types";

// export interface StoreStatus {
//   isOpen: boolean;
//   isVacation: boolean;
//   vacationMessage: string;
//   statusText: string;
//   reason: "vacation" | "closed_hours" | "closed_day" | "open";
//   todaySchedule?: string;
// }

// // Backend WCFM/GraphQL bisa mengirim vacation mode dalam beberapa bentuk:
// // object camelCase (GraphQL), object snake_case (REST lama), boolean, atau string 'yes'/'no'.
// type VacationModeInput =
//   | boolean
//   | string
//   | {
//       isEnabled?: boolean | string;
//       vacationMessage?: string;
//       is_enabled?: boolean | string;
//       vacation_message?: string;
//     }
//   | undefined;

// /**
//  * Cek status operasional toko secara real-time berdasarkan Jam Buka & Mode Libur
//  */
// export function checkStoreStatus(
//   storeHours?: StoreHours,
//   vacationMode?: VacationModeInput,
// ): StoreStatus {
//   // 1. Cek Mode Libur (Vacation Mode) - Deteksi fleksibel (boolean / string 'yes' / objek)
//   const vacationObj =
//     typeof vacationMode === "object" && vacationMode !== null
//       ? vacationMode
//       : null;

//   const isVacation = Boolean(
//     vacationMode === true ||
//     vacationMode === "yes" ||
//     vacationObj?.isEnabled === true ||
//     vacationObj?.isEnabled === "yes" ||
//     vacationObj?.is_enabled === true ||
//     vacationObj?.is_enabled === "yes",
//   );

//   if (isVacation) {
//     const msg =
//       vacationObj?.vacationMessage ||
//       vacationObj?.vacation_message ||
//       "Toko kami sedang libur sementara waktu.";

//     return {
//       isOpen: false,
//       isVacation: true,
//       vacationMessage: msg,
//       statusText: "Toko Sedang Libur",
//       reason: "vacation",
//     };
//   }

//   // Jika tidak ada konfigurasi jam operasional khusus, default dianggap buka
//   if (!storeHours) {
//     return {
//       isOpen: true,
//       isVacation: false,
//       vacationMessage: "",
//       statusText: "Buka Sekarang",
//       reason: "open",
//     };
//   }

//   // 2. Cek Hari dan Jam Operasional
//   const now = new Date();
//   const dayIndex = now.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
//   const dayKeys: (keyof StoreHours)[] = [
//     "minggu",
//     "senin",
//     "selasa",
//     "rabu",
//     "kamis",
//     "jumat",
//     "sabtu",
//   ];
//   const currentDayKey = dayKeys[dayIndex];

//   const todayConfig = storeHours[currentDayKey];

//   // Jika hari ini toko tutup
//   if (!todayConfig || !todayConfig.isOpen) {
//     return {
//       isOpen: false,
//       isVacation: false,
//       vacationMessage: "",
//       statusText: "Toko Tutup Hari Ini",
//       reason: "closed_day",
//       todaySchedule: "Tutup hari ini",
//     };
//   }

//   // Cek jam operasional hari ini
//   const currentHours = String(now.getHours()).padStart(2, "0");
//   const currentMinutes = String(now.getMinutes()).padStart(2, "0");
//   const currentTimeStr = `${currentHours}:${currentMinutes}`;

//   const openTime = todayConfig.openTime || "08:00";
//   const closeTime = todayConfig.closeTime || "17:00";

//   if (currentTimeStr < openTime || currentTimeStr >= closeTime) {
//     return {
//       isOpen: false,
//       isVacation: false,
//       vacationMessage: "",
//       statusText: "Toko Sedang Tutup",
//       reason: "closed_hours",
//       todaySchedule: `Jam buka: ${openTime} - ${closeTime}`,
//     };
//   }

//   return {
//     isOpen: true,
//     isVacation: false,
//     vacationMessage: "",
//     statusText: "Buka Sekarang",
//     reason: "open",
//     todaySchedule: `Buka sampai ${closeTime}`,
//   };
// }

import { StoreHours, VacationMode } from "@/types";

export interface StoreStatus {
  isOpen: boolean;
  isVacation: boolean;
  vacationMessage: string;
  statusText: string;
  reason: "vacation" | "closed_hours" | "closed_day" | "open";
  todaySchedule?: string;
}

export type RawVacationMode =
  | VacationMode
  | boolean
  | string
  | {
      isEnabled?: boolean | string;
      is_enabled?: boolean | string;
      vacationMessage?: string;
      vacation_message?: string;
    }
  | null
  | undefined;

export type DayScheduleConfig = {
  isOpen?: boolean;
  is_open?: boolean;
  status?: string;
  openTime?: string;
  open_time?: string;
  start?: string;
  open?: string;
  closeTime?: string;
  close_time?: string;
  end?: string;
  close?: string;
};

export type RawStoreHours =
  | StoreHours
  | Record<string, DayScheduleConfig>
  | null
  | undefined;

/**
 * Helper untuk mendapatkan Hari dan Jam sekarang di Zona Waktu Indonesia Barat (WIB - Asia/Jakarta)
 * Mencegah bug timezone UTC di server Hostinger / Node.js.
 */
function getWIBTime(): { dayIndex: number; currentTimeStr: string } {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const weekday = parts.find((p) => p.type === "weekday")?.value; // 'Sun', 'Mon', ...
    const hour = parts.find((p) => p.type === "hour")?.value || "00";
    const minute = parts.find((p) => p.type === "minute")?.value || "00";

    const weekdayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    const dayIndex =
      weekday && weekdayMap[weekday] !== undefined
        ? weekdayMap[weekday]
        : now.getDay();
    const currentTimeStr = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

    return { dayIndex, currentTimeStr };
  } catch {
    const now = new Date();
    const offsetHours = now.getTimezoneOffset() === 0 ? 7 : 0;
    const wibHours = (now.getHours() + offsetHours) % 24;
    const currentHours = String(wibHours).padStart(2, "0");
    const currentMinutes = String(now.getMinutes()).padStart(2, "0");
    return {
      dayIndex: now.getDay(),
      currentTimeStr: `${currentHours}:${currentMinutes}`,
    };
  }
}

/**
 * Cek status operasional toko secara real-time berdasarkan Jam Buka & Mode Libur
 * 100% Strict Type Safety (Bebas 'any') & Kebal terhadap perbedaan timezone server (WIB vs UTC).
 */
export function checkStoreStatus(
  storeHours?: RawStoreHours,
  vacationMode?: RawVacationMode,
): StoreStatus {
  // 1. Cek Mode Libur (Vacation Mode) secara Defensif & Type-Safe
  let isVacation = false;
  let vacationMessage = "Toko kami sedang libur sementara waktu.";

  if (typeof vacationMode === "boolean") {
    isVacation = vacationMode;
  } else if (typeof vacationMode === "string") {
    isVacation =
      vacationMode.toLowerCase() === "yes" ||
      vacationMode.toLowerCase() === "true";
  } else if (vacationMode && typeof vacationMode === "object") {
    const vm = vacationMode as {
      isEnabled?: boolean | string;
      is_enabled?: boolean | string;
      vacationMessage?: string;
      vacation_message?: string;
    };
    const enabledVal = vm.isEnabled ?? vm.is_enabled;
    isVacation =
      enabledVal === true || enabledVal === "yes" || enabledVal === "true";

    if (typeof vm.vacationMessage === "string" && vm.vacationMessage.trim()) {
      vacationMessage = vm.vacationMessage.trim();
    } else if (
      typeof vm.vacation_message === "string" &&
      vm.vacation_message.trim()
    ) {
      vacationMessage = vm.vacation_message.trim();
    }
  }

  if (isVacation) {
    return {
      isOpen: false,
      isVacation: true,
      vacationMessage,
      statusText: "Toko Sedang Libur",
      reason: "vacation",
    };
  }

  // Jika tidak ada konfigurasi jam operasional khusus, default dianggap buka
  if (!storeHours || typeof storeHours !== "object") {
    return {
      isOpen: true,
      isVacation: false,
      vacationMessage: "",
      statusText: "Buka Sekarang",
      reason: "open",
    };
  }

  // 2. Dapatkan Hari dan Jam WIB (Asia/Jakarta)
  const { dayIndex, currentTimeStr } = getWIBTime();

  // Mapping kunci hari ID dan EN
  const idDayKeys = [
    "minggu",
    "senin",
    "selasa",
    "rabu",
    "kamis",
    "jumat",
    "sabtu",
  ];
  const enDayKeys = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const currentIdKey = idDayKeys[dayIndex];
  const currentEnKey = enDayKeys[dayIndex];

  // Cari konfigurasi hari ini
  const rawMap = storeHours as Record<string, DayScheduleConfig | undefined>;
  const todayConfig: DayScheduleConfig | undefined =
    rawMap[currentIdKey] || rawMap[currentEnKey] || rawMap[String(dayIndex)];

  // Jika tidak ada data spesifik untuk hari ini, anggap buka
  if (!todayConfig) {
    return {
      isOpen: true,
      isVacation: false,
      vacationMessage: "",
      statusText: "Buka Sekarang",
      reason: "open",
    };
  }

  // Cek apakah hari ini diset tutup
  const isDayOpen =
    todayConfig.isOpen !== false &&
    todayConfig.is_open !== false &&
    todayConfig.status !== "closed" &&
    todayConfig.status !== "close";

  if (!isDayOpen) {
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
  const openTime =
    todayConfig.openTime ||
    todayConfig.open_time ||
    todayConfig.start ||
    todayConfig.open ||
    "08:00";
  const closeTime =
    todayConfig.closeTime ||
    todayConfig.close_time ||
    todayConfig.end ||
    todayConfig.close ||
    "17:00";

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
