import { NextRequest, NextResponse } from "next/server";
import { StoredPushSubscription } from "@/types";

if (!global.globalPushSubscriptions) {
  global.globalPushSubscriptions = [];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, role = "guest", userId } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "Subscription data tidak valid" }, { status: 400 });
    }

    const subs: StoredPushSubscription[] = global.globalPushSubscriptions || [];
    // Hapus duplikasi endpoint lama jika ada
    const filtered = subs.filter((s) => s.endpoint !== subscription.endpoint);
    filtered.push({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      role: role === "admin" ? "admin" : role === "vendor" ? "vendor" : "guest",
      userId,
      updatedAt: new Date().toISOString(),
    });

    global.globalPushSubscriptions = filtered;

    return NextResponse.json({ success: true, total: filtered.length });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan subscription" }, { status: 500 });
  }
}

export async function GET() {
  const subs = global.globalPushSubscriptions || [];
  return NextResponse.json({ total: subs.length });
}
