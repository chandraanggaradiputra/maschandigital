import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const privateKey = process.env.VAPID_PRIVATE_KEY || "";
const subject = process.env.VAPID_SUBJECT || "mailto:admin@maschandigital.id";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetRole = "admin", title, body: messageBody, url = "/admin/moderasi" } = body;

    const subs = global.globalPushSubscriptions || [];
    const targets =
      targetRole === "all"
        ? subs
        : subs.filter((s) => s.role === targetRole);

    if (targets.length === 0) {
      return NextResponse.json({ success: true, message: "Tidak ada subscriber aktif untuk target ini." });
    }

    const payload = JSON.stringify({
      title: title || "Mas Chan Digital",
      body: messageBody || "Pemberitahuan baru",
      icon: "/icon-192.png",
      url,
    });

    const results = await Promise.allSettled(
      targets.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          payload
        )
      )
    );

    return NextResponse.json({
      success: true,
      sent_count: targets.length,
      details: results.map((r) => r.status),
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengirim push notification" }, { status: 500 });
  }
}
