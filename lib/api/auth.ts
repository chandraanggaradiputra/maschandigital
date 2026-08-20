export interface VendorUser {
  id: number;
  email: string;
  name: string;
  store_name: string;
  slug: string;
  phone: string;
  district: string;
}

export interface AuthSession {
  token: string;
  user: VendorUser;
}

const WP_API_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://app.maschandigital.id";
const STORAGE_KEY = "maschan_vendor_session";

/**
 * Simpan Sesi Vendor di LocalStorage
 */
export function saveVendorSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {}
}

/**
 * Ambil Sesi Vendor dari LocalStorage
 */
export function getVendorSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Hapus Sesi Vendor (Logout)
 */
export function clearVendorSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

/**
 * Login Vendor via JWT REST API
 */
export async function loginVendor(
  usernameOrEmail: string,
  password: string,
): Promise<{ success: boolean; session?: AuthSession; message?: string }> {
  try {
    const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameOrEmail,
        password: password,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.token) {
      const session: AuthSession = {
        token: data.token,
        user: data.user,
      };
      saveVendorSession(session);
      return { success: true, session };
    }

    return {
      success: false,
      message:
        data.message || "Login gagal. Periksa kembali email dan password Anda.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Gagal menghubungi server WordPress.",
    };
  }
}

/**
 * Registrasi Toko Vendor Baru via REST API
 */
export async function registerVendor(formData: {
  store_name: string;
  owner_name: string;
  email: string;
  password: string;
  whatsapp_number: string;
  location_district: string;
}): Promise<{ success: boolean; session?: AuthSession; message?: string }> {
  try {
    const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok && data.success && data.token) {
      const session: AuthSession = {
        token: data.token,
        user: data.user,
      };
      saveVendorSession(session);
      return { success: true, session, message: data.message };
    }

    return {
      success: false,
      message:
        data.message || "Registrasi gagal. Silakan periksa kembali data Anda.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Gagal menghubungi server WordPress.",
    };
  }
}
