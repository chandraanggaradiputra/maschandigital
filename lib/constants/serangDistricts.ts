/**
 * Data Resmi Wilayah Administratif Kota Serang, Provinsi Banten
 * Terdiri dari 6 Kecamatan dan 67 Kelurahan lengkap dengan Kode Pos.
 */

export interface KelurahanInfo {
  name: string;
  postalCode: string;
}

export const SERANG_DISTRICTS: Record<string, KelurahanInfo[]> = {
  Serang: [
    { name: "Cimuncang", postalCode: "42111" },
    { name: "Cipare", postalCode: "42117" },
    { name: "Kagungan", postalCode: "42114" },
    { name: "Kaligandu", postalCode: "42116" },
    { name: "Kotabaru", postalCode: "42112" },
    { name: "Lontarbaru", postalCode: "42115" },
    { name: "Lopang", postalCode: "42113" },
    { name: "Serang", postalCode: "42116" },
    { name: "Sukawana", postalCode: "42116" },
    { name: "Sumurpecung", postalCode: "42118" },
    { name: "Terondol", postalCode: "42119" },
    { name: "Unyur", postalCode: "42111" },
  ],
  "Cipocok Jaya": [
    { name: "Banjaragung", postalCode: "42122" },
    { name: "Banjarsari", postalCode: "42123" },
    { name: "Cipocok Jaya", postalCode: "42121" },
    { name: "Dalung", postalCode: "42127" },
    { name: "Gelam", postalCode: "42128" },
    { name: "Karundang", postalCode: "42125" },
    { name: "Panancangan", postalCode: "42124" },
    { name: "Tembong", postalCode: "42126" },
  ],
  Kasemen: [
    { name: "Banten", postalCode: "42142" },
    { name: "Bendung", postalCode: "42143" },
    { name: "Kasemen", postalCode: "42141" },
    { name: "Kasunyatan", postalCode: "42144" },
    { name: "Kilasah", postalCode: "42141" },
    { name: "Margaluyu", postalCode: "42143" },
    { name: "Mesjid Priyayi", postalCode: "42143" },
    { name: "Pamarican", postalCode: "42144" },
    { name: "Sawah Luhur", postalCode: "42141" },
    { name: "Teritih", postalCode: "42142" },
  ],
  Taktakan: [
    { name: "Cibendung", postalCode: "42162" },
    { name: "Cilowong", postalCode: "42162" },
    { name: "Drangong", postalCode: "42162" },
    { name: "Kalang Anyar", postalCode: "42162" },
    { name: "Kuranji", postalCode: "42162" },
    { name: "Lialang", postalCode: "42162" },
    { name: "Pancur", postalCode: "42162" },
    { name: "Panggungjati", postalCode: "42162" },
    { name: "Sayar", postalCode: "42162" },
    { name: "Sepang", postalCode: "42162" },
    { name: "Taktakan", postalCode: "42162" },
    { name: "Tamanbaru", postalCode: "42162" },
    { name: "Umbul Tengah", postalCode: "42162" },
  ],
  Curug: [
    { name: "Cilaku", postalCode: "42171" },
    { name: "Cipete", postalCode: "42171" },
    { name: "Curug", postalCode: "42171" },
    { name: "Curugmanis", postalCode: "42171" },
    { name: "Kamanisan", postalCode: "42171" },
    { name: "Pancalaksana", postalCode: "42171" },
    { name: "Sukajaya", postalCode: "42171" },
    { name: "Sukalaksana", postalCode: "42171" },
    { name: "Sukawana", postalCode: "42171" },
    { name: "Tinggar", postalCode: "42171" },
  ],
  Walantaka: [
    { name: "Cigoong", postalCode: "42183" },
    { name: "Kalodran", postalCode: "42183" },
    { name: "Kepuren", postalCode: "42183" },
    { name: "Kiara", postalCode: "42183" },
    { name: "Lebakwangi", postalCode: "42183" },
    { name: "Nyapah", postalCode: "42183" },
    { name: "Pabuaran", postalCode: "42183" },
    { name: "Pagerbatu", postalCode: "42183" },
    { name: "Pasuluhan", postalCode: "42183" },
    { name: "Pengampelan", postalCode: "42183" },
    { name: "Pipitan", postalCode: "42183" },
    { name: "Tegalsari", postalCode: "42183" },
    { name: "Teritih", postalCode: "42183" },
    { name: "Walantaka", postalCode: "42183" },
  ],
};

export const KECAMATAN_LIST = Object.keys(SERANG_DISTRICTS);

export function getKelurahanList(kecamatan: string): KelurahanInfo[] {
  return SERANG_DISTRICTS[kecamatan] || [];
}

export function getPostalCode(kecamatan: string, kelurahan: string): string {
  const list = SERANG_DISTRICTS[kecamatan] || [];
  const found = list.find(
    (k) => k.name.toLowerCase() === kelurahan.toLowerCase(),
  );
  return found ? found.postalCode : "42111";
}
