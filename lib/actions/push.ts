'use server';

// --- DEPENDENCIES ---
import fs from 'fs';
import path from 'path';
import webpush from 'web-push';
import { revalidatePath } from 'next/cache';
import {
  PushSubscriptionRecord,
  PushSubscriptionInput,
  BroadcastNotificationPayload,
  BroadcastNotificationResult,
} from '@/types';

// --- VAPID SETUP & SAFE FALLBACKS ---
const FALLBACK_PUBLIC_KEY =
  'BF6Jq0LCrMgRtzRDKw-2iBEULE3x_vLrpwm080O9xCPR4RQyhexu-YHjz0ieCiMBgER5e951IKo5X733sHZ_PlI';
const FALLBACK_PRIVATE_KEY =
  'pg9lRcfmuwnWvthQyWivgOfBFPCyyLuj6Hbgq5hQih4';
const FALLBACK_SUBJECT = 'mailto:admin@maschandigital.id';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || FALLBACK_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || FALLBACK_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || FALLBACK_SUBJECT;

try {
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  }
} catch (err: unknown) {
  const errMsg = err instanceof Error ? err.message : String(err);
  console.warn('[WebPush MCD] Peringatan inisialisasi VAPID details:', errMsg);
}

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'data', 'push-subscriptions.json');

/**
 * Membaca seluruh data pelanggan aktif dari berkas penyimpanan lokal JSON
 */
function getStoredSubscriptions(): PushSubscriptionRecord[] {
  try {
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) return [];
    const content = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
    if (!content || !content.trim()) return [];
    return JSON.parse(content) as PushSubscriptionRecord[];
  } catch {
    return [];
  }
}

/**
 * Menyimpan daftar langganan push ke berkas penyimpanan lokal JSON
 */
function saveSubscriptions(list: PushSubscriptionRecord[]): void {
  try {
    const dir = path.dirname(SUBSCRIPTIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[WebPush MCD] Gagal menyimpan subscriptions:', errMsg);
  }
}

// --- SERVER ACTION: LANGGANAN NOTIFIKASI PROMO ---
export async function subscribeUserToPush(
  subscriptionJson: PushSubscriptionInput | null | undefined
): Promise<{ success: boolean; message: string }> {
  if (
    !subscriptionJson ||
    !subscriptionJson.endpoint ||
    !subscriptionJson.keys ||
    !subscriptionJson.keys.p256dh ||
    !subscriptionJson.keys.auth
  ) {
    return { success: false, message: 'Data langganan push tidak valid.' };
  }

  const list = getStoredSubscriptions();
  const exists = list.some((item) => item.endpoint === subscriptionJson.endpoint);

  if (!exists) {
    list.push({
      endpoint: subscriptionJson.endpoint,
      keys: {
        p256dh: subscriptionJson.keys.p256dh,
        auth: subscriptionJson.keys.auth,
      },
      subscribedAt: new Date().toISOString(),
      role: 'guest',
    });
    saveSubscriptions(list);
  }

  revalidatePath('/dashboard/admin');
  revalidatePath('/admin/moderasi');

  return {
    success: true,
    message: 'Berhasil mengaktifkan notifikasi promo Mas Chan Digital.',
  };
}

// --- SERVER ACTION: HITUNG TOTAL PELANGGAN AKTIF ---
export async function getPushSubscriberStats(): Promise<{ total: number }> {
  const list = getStoredSubscriptions();
  return { total: list.length };
}

// --- SERVER ACTION: SIARKAN PROMO KE SELURUH PELANGGAN ---
export async function sendBroadcastNotification(
  data: BroadcastNotificationPayload
): Promise<BroadcastNotificationResult> {
  const list = getStoredSubscriptions();
  if (list.length === 0) {
    return {
      success: false,
      message: 'Belum ada pelanggan yang berlangganan notifikasi.',
      sentCount: 0,
    };
  }

  if (!data.title?.trim() || !data.body?.trim()) {
    return {
      success: false,
      message: 'Judul dan pesan promo tidak boleh kosong.',
      sentCount: 0,
    };
  }

  const payload = JSON.stringify({
    title: data.title.trim(),
    body: data.body.trim(),
    url: data.url?.trim() || '/',
  });

  const activeSubscriptions: PushSubscriptionRecord[] = [];
  let sentCount = 0;
  let failedCount = 0;

  for (const sub of list) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        },
        payload
      );
      activeSubscriptions.push(sub);
      sentCount++;
    } catch (err: unknown) {
      const statusCode =
        typeof err === 'object' && err !== null && 'statusCode' in err
          ? (err as { statusCode?: number }).statusCode
          : undefined;

      // Bersihkan token yang kadaluwarsa (410 Gone atau 404 Not Found)
      if (statusCode === 410 || statusCode === 404) {
        failedCount++;
      } else {
        // Simpan langganan jika kegagalan bersifat sementara (misal koneksi atau timeout)
        activeSubscriptions.push(sub);
      }
    }
  }

  // Bersihkan token yang kadaluwarsa dari storage lokal jika ada kegagalan permanen
  if (failedCount > 0) {
    saveSubscriptions(activeSubscriptions);
  }

  revalidatePath('/dashboard/admin');
  revalidatePath('/admin/moderasi');

  return {
    success: true,
    message: `Notifikasi promo berhasil dikirim ke ${sentCount} perangkat pelanggan${
      failedCount > 0 ? ` (${failedCount} perangkat kadaluwarsa dibersihkan)` : ''
    }.`,
    sentCount,
  };
}
