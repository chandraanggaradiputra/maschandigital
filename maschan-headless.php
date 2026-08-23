<?php
/**
 * Plugin Name: Mas Chan Digital - Headless Marketplace Engine (JWT Universal Bypass & Vacation Fix)
 * Description: Engine REST API & GraphQL terverifikasi untuk Marketplace Kota Serang (Bypass Signature verification conflict, Base64URL JWT, Instant Vacation Toggle).
 * Author: Mas Chan Digital
 * Version: 14.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. CORS Headers + Cache Bypass untuk endpoint maschan/v1
add_action('init', function () {
    $req_uri = $_SERVER['REQUEST_URI'] ?? '';
    $is_maschan_endpoint = strpos($req_uri, '/wp-json/maschan/v1/') !== false;

    if ($is_maschan_endpoint) {
        // Cegah plugin cache (LiteSpeed/W3TC/WP Super Cache/dsb) menyimpan respons ini,
        // termasuk respons preflight OPTIONS yang bisa tersimpan tanpa header CORS.
        nocache_headers();
        header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
        if (!defined('DONOTCACHEPAGE')) define('DONOTCACHEPAGE', true);
        if (!defined('LSCACHE_NO_CACHE')) define('LSCACHE_NO_CACHE', true);
    }

    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Type, Origin, Accept");

    if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
        status_header(200);
        exit();
    }
});

// 2. Secret Key Resolver (Kompatibel dengan wp-config.php JWT_AUTH_SECRET_KEY / SECURE_AUTH_KEY)
function maschan_get_jwt_secret() {
    if (defined('JWT_AUTH_SECRET_KEY') && !empty(JWT_AUTH_SECRET_KEY)) {
        return JWT_AUTH_SECRET_KEY;
    }
    if (defined('SECURE_AUTH_KEY') && !empty(SECURE_AUTH_KEY)) {
        return SECURE_AUTH_KEY;
    }
    if (defined('AUTH_KEY') && !empty(AUTH_KEY)) {
        return AUTH_KEY;
    }
    // TIDAK ADA LAGI string tetap yang bisa dibaca siapa pun di kode ini.
    // wp_salt() selalu tersedia di WordPress dan nilainya unik per instalasi
    // (disimpan di database, bukan di file) — jauh lebih aman daripada string
    // yang ikut ter-commit/ter-upload bersama file plugin ini.
    return wp_salt('auth');
}

function maschan_base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function maschan_base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

// 3. Generator JWT Standard Base64URL
function maschan_generate_jwt($user_id) {
    $secret = maschan_get_jwt_secret();
    $header = maschan_base64url_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = maschan_base64url_encode(json_encode([
        'iss'  => get_site_url(),
        'iat'  => time(),
        'exp'  => time() + (30 * 24 * 60 * 60), // 30 Hari
        'data' => [
            'user' => [
                'id' => (int)$user_id
            ]
        ]
    ]));

    $signature = maschan_base64url_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    return "$header.$payload.$signature";
}

// 4. Verifier JWT Fleksibel
function maschan_verify_jwt($token) {
    if (empty($token)) return false;
    $raw_token = trim(str_ireplace('Bearer', '', $token));
    $parts = explode('.', $raw_token);
    if (count($parts) !== 3) return false;

    list($header, $payload, $signature) = $parts;

    $secret = maschan_get_jwt_secret();
    $expected_signature = maschan_base64url_encode(hash_hmac('sha256', "$header.$payload", $secret, true));

    $valid = hash_equals($expected_signature, $signature);
    if (!$valid) {
        // Kompatibilitas mundur SAJA: token lama mungkin sempat ditandatangani pakai
        // base64_encode biasa (bukan base64url) — tetap pakai SECRET ASLI yang sama,
        // BUKAN secret lain. Tidak ada lagi fallback ke string tetap yang bisa dibaca
        // siapa pun di kode ini (itu lubang keamanan nyata: siapa pun yang tahu string
        // itu bisa memalsukan token admin, terlepas dari secret asli situs ini).
        $fallback_expected = base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
        $valid = hash_equals($fallback_expected, $signature);
    }

    if (!$valid) return false;

    $data = json_decode(maschan_base64url_decode($payload), true);
    if (!$data || !isset($data['exp']) || $data['exp'] < time()) return false;

    return $data['data']['user']['id'] ?? ($data['user']['id'] ?? false);
}

// 5. Bypass Error "Signature verification failed" dari Plugin JWT Eksternal pada Endpoint /maschan/v1/
add_filter('rest_authentication_errors', function ($error) {
    if (is_wp_error($error)) {
        $req_uri = $_SERVER['REQUEST_URI'] ?? '';
        if (strpos($req_uri, '/maschan/v1/') !== false) {
            return null; // Bebaskan endpoint maschan agar ditangani secara native
        }
    }
    return $error;
}, 99);

function maschan_get_current_user_from_request($request) {
    $auth_header = $request->get_header('authorization');
    if (!empty($auth_header)) {
        $user_id = maschan_verify_jwt($auth_header);
        if ($user_id) return (int)$user_id;
    }
    return 0;
}

/**
 * Cek admin berbasis token JWT (BUKAN current_user_can() bawaan WordPress).
 * current_user_can() bergantung pada sesi cookie WordPress yang tidak pernah
 * ter-set oleh JWT Bearer token custom kita — jadi selalu salah/tidak konsisten
 * untuk request dari Next.js. user_can($id, ...) menerima ID eksplisit, tidak
 * bergantung state login global, sehingga cocok untuk arsitektur headless kita.
 * Return 0 kalau bukan admin/token tidak valid — TIDAK PERNAH menebak.
 */
function maschan_get_authenticated_admin_id($request) {
    $user_id = maschan_get_current_user_from_request($request);
    if (!$user_id || !user_can($user_id, 'manage_options')) {
        return 0;
    }
    return $user_id;
}

/**
 * Ekstraksi Data Profil Vendor Lengkap
 */
function maschan_extract_full_vendor($user_id) {
    if (!$user_id) return null;
    $user = get_userdata($user_id);
    if (!$user) return null;

    $wcfm = get_user_meta($user_id, 'wcfmmp_profile_settings', true);
    if (!is_array($wcfm)) $wcfm = [];

    $store_name = $wcfm['store_name'] ?? (get_user_meta($user_id, 'store_name', true) ?: (get_user_meta($user_id, 'wcfmmp_store_name', true) ?: $user->display_name));
    $store_slug = $wcfm['store_slug'] ?? (sanitize_title($store_name) ?: $user->user_nicename);
    $phone      = $wcfm['phone'] ?? ($wcfm['store_phone'] ?? (get_user_meta($user_id, 'billing_phone', true) ?: get_user_meta($user_id, 'phone', true)));
    $district   = $wcfm['address']['city'] ?? (get_user_meta($user_id, 'location_district', true) ?: 'Cipocok Jaya');
    $street     = $wcfm['address']['street_1'] ?? (get_user_meta($user_id, 'billing_address_1', true) ?: 'Kota Serang');
    $banner     = $wcfm['banner'] ?? (get_user_meta($user_id, 'wcfmmp_banner', true) ?: '');
    $avatar     = $wcfm['gravatar'] ?? (get_user_meta($user_id, 'wcfmmp_avatar', true) ?: '');
    $desc       = $wcfm['shop_description'] ?? (get_user_meta($user_id, 'wcfmmp_store_description', true) ?: get_user_meta($user_id, 'description', true));

    // Socials
    $raw_social = get_user_meta($user_id, 'wcfm_store_social', true);
    if (!is_array($raw_social)) $raw_social = [];

    $socials = [
        'instagram' => $raw_social['instagram'] ?? ($wcfm['social']['instagram'] ?? ''),
        'tiktok'    => $raw_social['tiktok'] ?? ($wcfm['social']['tiktok'] ?? ''),
        'facebook'  => $raw_social['fb'] ?? ($raw_social['facebook'] ?? ($wcfm['social']['fb'] ?? ($wcfm['social']['facebook'] ?? ''))),
        'youtube'   => $raw_social['youtube'] ?? ($wcfm['social']['youtube'] ?? ''),
        'website'   => $raw_social['website'] ?? ($wcfm['social']['website'] ?? ($user->user_url ?: '')),
    ];

    // Store Hours
    $raw_hours = get_user_meta($user_id, 'wcfm_store_hours', true);
    if (!is_array($raw_hours) || empty($raw_hours)) {
        $raw_hours = $wcfm['wcfm_vendor_store_hours'] ?? [];
    }

    $days_map = [
        'senin'  => ['senin', 'mon', 'day_1', '1'],
        'selasa' => ['selasa', 'tue', 'day_2', '2'],
        'rabu'   => ['rabu', 'wed', 'day_3', '3'],
        'kamis'  => ['kamis', 'thu', 'day_4', '4'],
        'jumat'  => ['jumat', 'fri', 'day_5', '5'],
        'sabtu'  => ['sabtu', 'sat', 'day_6', '6'],
        'minggu' => ['minggu', 'sun', 'day_0', '0'],
    ];

    $store_hours = [];
    foreach ($days_map as $id_day => $aliases) {
        $found = null;
        foreach ($aliases as $alias) {
            if (isset($raw_hours[$alias]) && is_array($raw_hours[$alias])) {
                $found = $raw_hours[$alias];
                break;
            }
        }
        $is_open = ($id_day === 'minggu') ? false : true;
        if ($found && isset($found['isOpen'])) {
            $is_open = (bool)$found['isOpen'];
        } elseif ($found && isset($found['open'])) {
            $is_open = ($found['open'] === 'yes' || $found['open'] === true || $found['open'] === '1');
        }

        $store_hours[$id_day] = [
            'isOpen'    => $is_open,
            'openTime'  => $found['openTime'] ?? ($found['start'] ?? '08:00'),
            'closeTime' => $found['closeTime'] ?? ($found['end'] ?? '17:00'),
        ];
    }

    // Vacation Mode (Prioritaskan nilai usermeta terbaru)
    $meta_vacation = get_user_meta($user_id, 'wcfm_vacation_mode', true);
    if ($meta_vacation !== '') {
        $is_vacation = ($meta_vacation === 'yes' || $meta_vacation === true || $meta_vacation === '1');
    } else {
        $is_vacation = ($wcfm['vacation_mode'] ?? '') === 'yes' || ($wcfm['wcfm_vacation_mode'] ?? '') === 'yes';
    }

    $vacation_msg = get_user_meta($user_id, 'wcfm_vacation_mode_msg', true) ?: ($wcfm['vacation_mode_msg'] ?? ($wcfm['wcfm_vacation_mode_msg'] ?? 'Toko kami sedang libur sementara waktu.'));

    $vacation_mode = [
        'isEnabled'       => (bool)$is_vacation,
        'vacationMessage' => $vacation_msg,
    ];

    // Store SEO
    $store_seo = [
        'seoTitle'        => get_user_meta($user_id, 'wcfm_store_seo_title', true) ?: (get_user_meta($user_id, 'wcfmmp_seo_meta_title', true) ?: ($wcfm['store_seo']['wcfmmp_seo_meta_title'] ?? '')),
        'metaDescription' => get_user_meta($user_id, 'wcfm_store_seo_meta_desc', true) ?: (get_user_meta($user_id, 'wcfmmp_seo_meta_desc', true) ?: ($wcfm['store_seo']['wcfmmp_seo_meta_desc'] ?? '')),
        'metaKeywords'    => get_user_meta($user_id, 'wcfm_store_seo_meta_keywords', true) ?: (get_user_meta($user_id, 'wcfmmp_seo_meta_keywords', true) ?: ($wcfm['store_seo']['wcfmmp_seo_meta_keywords'] ?? '')),
    ];

    $clean_phone = preg_replace('/[^0-9]/', '', (string)$phone);
    if (!empty($clean_phone)) {
        if (str_starts_with($clean_phone, '0')) $clean_phone = '62' . substr($clean_phone, 1);
        elseif (str_starts_with($clean_phone, '8')) $clean_phone = '62' . $clean_phone;
    }

    if (is_numeric($banner) && $banner > 0) $banner = wp_get_attachment_image_url($banner, 'full') ?: '';
    if (is_numeric($avatar) && $avatar > 0) $avatar = wp_get_attachment_image_url($avatar, 'full') ?: '';
    if (empty($avatar)) $avatar = get_avatar_url($user_id);

    return [
        'id'                => (int)$user_id,
        'store_name'        => $store_name,
        'slug'              => $store_slug,
        'owner_name'        => $user->display_name,
        'email'             => $user->user_email,
        'whatsapp_number'   => $clean_phone,
        'address'           => [
            'street_1' => $street ?: 'Kota Serang',
            'city'     => 'Kota Serang',
            'zip'      => '42111',
        ],
        'location_district' => $district,
        'avatar'            => $avatar,
        'banner'            => $banner,
        'description'       => $desc ?: '',
        'is_verified'       => true,
        'products_count'    => (int)(new WP_Query([
            'post_type'      => 'product',
            'author'         => $user_id,
            'post_status'    => ['publish', 'draft'],
            'posts_per_page' => -1,
            'fields'         => 'ids',
            'no_found_rows'  => false,
        ]))->found_posts,
        'rating'            => 5.0,
        'review_count'      => 1,
        'joined_date'       => date('Y-m-d', strtotime($user->user_registered)),
        'socials'           => $socials,
        'store_hours'       => $store_hours,
        'vacation_mode'     => $vacation_mode,
        'store_seo'         => $store_seo,
    ];
}

function maschan_format_product_data($product_id) {
    $product = wc_get_product($product_id);
    if (!$product) return null;

    $author_id   = (int)get_post_field('post_author', $product_id);
    $vendor_info = maschan_extract_full_vendor($author_id);

    $images = [];
    $main_image_id = $product->get_image_id();
    if ($main_image_id) {
        $images[] = [
            'id'  => (int)$main_image_id,
            'src' => wp_get_attachment_image_url($main_image_id, 'full'),
            'alt' => get_the_title($product_id),
        ];
    }

    $gallery_ids = $product->get_gallery_image_ids();
    if (!empty($gallery_ids)) {
        foreach ($gallery_ids as $g_id) {
            $images[] = [
                'id'  => (int)$g_id,
                'src' => wp_get_attachment_image_url($g_id, 'full'),
                'alt' => get_the_title($product_id),
            ];
        }
    }

    $categories = [];
    $category_ids = [];
    $terms = get_the_terms($product_id, 'product_cat');
    if (!empty($terms) && !is_wp_error($terms)) {
        foreach ($terms as $term) {
            $categories[] = [
                'id'     => $term->term_id,
                'name'   => $term->name,
                'slug'   => $term->slug,
                'parent' => $term->parent,
            ];
            $category_ids[] = (int)$term->term_id;
        }
    }

    $is_external = $product->is_type('external');
    $ext_url     = $is_external ? get_post_meta($product_id, '_product_url', true) : '';
    $button_text = $is_external ? get_post_meta($product_id, '_button_text', true) : '';

    return [
        'id'                => (int)$product_id,
        'name'              => get_the_title($product_id),
        'slug'              => get_post_field('post_name', $product_id),
        'type'              => $is_external ? 'affiliate' : 'simple',
        'status'            => get_post_status($product_id),
        'description'       => get_post_field('post_content', $product_id),
        'short_description' => get_post_field('post_excerpt', $product_id),
        'price'             => (string)$product->get_price(),
        'regular_price'     => (string)$product->get_regular_price(),
        'sale_price'        => (string)$product->get_sale_price(),
        'on_sale'           => $product->is_on_sale(),
        'images'            => $images,
        'categories'        => $categories,
        'category_ids'      => $category_ids,
        'external_url'      => $ext_url,
        'button_text'       => $button_text ?: 'Beli via Link',
        'vendor'            => [
            'id'                => $author_id,
            'store_name'        => $vendor_info['store_name'] ?? 'Vendor Serang',
            'slug'              => $vendor_info['slug'] ?? 'vendor-serang',
            'whatsapp_number'   => $vendor_info['whatsapp_number'] ?? '',
            'location_district' => $vendor_info['location_district'] ?? 'Serang',
            'avatar'            => $vendor_info['avatar'] ?? '',
            'is_verified'       => true,
            'store_hours'       => $vendor_info['store_hours'] ?? null,
            'vacation_mode'     => $vendor_info['vacation_mode'] ?? null,
        ],
        'seo'               => [
            'focus_keyword'    => get_post_meta($product_id, 'rank_math_focus_keyword', true) ?: '',
            'meta_title'       => get_post_meta($product_id, 'rank_math_title', true) ?: get_the_title($product_id),
            'meta_description' => get_post_meta($product_id, 'rank_math_description', true) ?: get_post_field('post_excerpt', $product_id),
        ],
        'created_at'        => get_the_date('c', $product_id),
    ];
}

// 5B. SISTEM LANGGANAN VENDOR (SUBSCRIPTION / BILLING)
// -----------------------------------------------------------------------
// Satu sumber kebenaran untuk daftar paket. SEMUA perhitungan harga, durasi,
// dan kuota produk HARUS memanggil fungsi ini — jangan hardcode angka di
// tempat lain (endpoint REST, cron, dsb), supaya tidak ada dua definisi
// yang bisa saling menyimpang seperti kasus products_count sebelumnya.
function maschan_get_subscription_plans() {
    return [
        'free_forever' => [
            'name'          => 'Paket Starter UMKM',
            'duration_days' => -1, // -1 = permanen, tidak pernah kedaluwarsa (beda makna dari max_products -1 = unlimited)
            'price'         => 0,
            'max_products'  => 3,
        ],
        'monthly_1m' => [
            'name'          => 'Paket 1 Bulan',
            'duration_days' => 30,
            'price'         => 30000,
            'max_products'  => 10,
        ],
        'quarterly_3m' => [
            'name'          => 'Paket 3 Bulan',
            'duration_days' => 90,
            'price'         => 90000,
            'max_products'  => 10,
        ],
        'biannual_6m' => [
            'name'          => 'Paket 6 Bulan',
            'duration_days' => 180,
            'price'         => 160000,
            'max_products'  => -1, // -1 = unlimited
        ],
        'annual_1y' => [
            'name'          => 'Paket 1 Tahun',
            'duration_days' => 365,
            'price'         => 280000,
            'max_products'  => -1, // -1 = unlimited
        ],
    ];
}

function maschan_get_plan($plan_id) {
    $plans = maschan_get_subscription_plans();
    return $plans[$plan_id] ?? null;
}

// Status yang MENGIZINKAN vendor menambah produk baru.
// Keputusan bisnis (disepakati): trial, active, renewal_due, pending_approval boleh.
// grace_period, expired, payment_rejected TIDAK boleh (mendorong perpanjangan).
// Vendor yang dikecualikan dari sistem langganan (misal: toko demo/internal milik
// pengelola marketplace sendiri). Ditandai lewat usermeta, BUKAN daftar ID hardcoded
// di dalam logika — supaya bisa ditambah/dicabut kapan saja tanpa ubah kode.
function maschan_is_subscription_exempt($user_id) {
    return get_user_meta($user_id, 'maschan_subscription_exempt', true) === 'yes';
}

// Status 'trial' dipertahankan di sini untuk kompatibilitas data lama (vendor yang
// sempat dimigrasi sebelum Paket Starter UMKM ada) — TIDAK PERNAH diberikan lagi
// ke pendaftar baru (langsung 'active' + 'free_forever', lihat endpoint /auth/register).
function maschan_subscription_statuses_can_add_product() {
    return ['trial', 'active', 'renewal_due', 'pending_approval'];
}

// Status yang membuat toko TERTUTUP di halaman publik.
// Hanya 'expired' yang menutup toko — semua status lain tetap tampil buka
// (termasuk pending_approval, sesuai kebijakan "Grace Protection Window").
// Vendor exempt TIDAK PERNAH ditutup, apa pun status mentahnya di database.
//
// PENTING (kebijakan terbaru): status 'expired' dipertahankan di kode ini untuk
// kompatibilitas, TAPI cron harian (saat dibangun nanti) TIDAK PERNAH lagi men-set
// status ini secara otomatis. Vendor berbayar yang lewat grace_period tanpa bayar
// akan diturunkan ke 'active' + 'free_forever' (Paket Starter UMKM), BUKAN 'expired'.
// Artinya toko vendor pada praktiknya tidak akan pernah ditutup otomatis karena
// telat bayar — paling parah cuma turun kelas ke Starter. 'expired' hanya tersisa
// sebagai kemungkinan untuk aksi manual admin di masa depan (belum dibangun).
function maschan_subscription_closes_store($user_id) {
    if (maschan_is_subscription_exempt($user_id)) return false;
    $status = get_user_meta($user_id, 'maschan_subscription_status', true);
    return $status === 'expired';
}

/**
 * Ambil data langganan vendor apa adanya dari database (TANPA evaluasi tanggal).
 * Evaluasi/transisi tanggal adalah tanggung jawab cron harian, BUKAN fungsi ini —
 * supaya "apa yang tersimpan" dan "apa yang dievaluasi" tidak tercampur di satu
 * tempat yang sama (konsisten dengan prinsip anti-silent-fallback: kalau data
 * belum pernah di-set sama sekali, kembalikan null yang eksplisit, jangan menebak).
 */
function maschan_get_vendor_subscription($user_id) {
    $products_count = (int)(new WP_Query([
        'post_type'      => 'product',
        'author'         => $user_id,
        'post_status'    => ['publish', 'draft'],
        'posts_per_page' => -1,
        'fields'         => 'ids',
    ]))->found_posts;

    // Vendor exempt (mis. toko demo internal) tidak pernah dibatasi kuota/masa aktif.
    // Bukan hasil "tebakan" — eksplisit ditandai admin lewat maschan_subscription_exempt.
    if (maschan_is_subscription_exempt($user_id)) {
        return [
            'status'          => 'active',
            'plan_id'         => 'exempt',
            'plan_name'       => 'Akun Internal / Demo (Tanpa Batas)',
            'end_date'        => null,
            'max_products'    => -1,
            'is_unlimited'    => true,
            'products_used'   => $products_count,
            'can_add_product' => true,
        ];
    }

    $status   = get_user_meta($user_id, 'maschan_subscription_status', true);
    $end_date = get_user_meta($user_id, 'maschan_subscription_end_date', true);
    $plan_id  = get_user_meta($user_id, 'maschan_plan_id', true);

    if (empty($status) || empty($plan_id)) {
        return null; // Vendor belum pernah punya langganan sama sekali (data lama/migrasi)
    }

    $plan = maschan_get_plan($plan_id);

    $max_products = $plan['max_products'] ?? 0;
    $is_unlimited = ($max_products === -1);

    return [
        'status'          => $status,
        'plan_id'         => $plan_id,
        'plan_name'       => $plan['name'] ?? $plan_id,
        'end_date'        => $end_date ?: null,
        'max_products'    => $max_products,
        'is_unlimited'    => $is_unlimited,
        'products_used'   => $products_count,
        'can_add_product' => in_array($status, maschan_subscription_statuses_can_add_product(), true)
            && ($is_unlimited || $products_count < $max_products),
    ];
}

/**
 * Terapkan durasi paket baru ke tanggal berakhir vendor.
 * Kalau vendor bayar SEBELUM expired (masih active/renewal_due), tambahan hari
 * dihitung dari end_date LAMA, bukan dari hari ini — supaya vendor yang bayar
 * cepat tidak kehilangan sisa hari yang sudah dibayar.
 */
function maschan_calculate_new_end_date($current_end_date, $duration_days) {
    if ($duration_days === -1) {
        return null; // Paket permanen (mis. Starter UMKM) — tidak punya tanggal kedaluwarsa
    }
    $now = current_time('timestamp');
    $current_ts = !empty($current_end_date) ? strtotime($current_end_date) : 0;
    $base_ts = max($now, $current_ts);
    return date('c', strtotime("+{$duration_days} days", $base_ts));
}

// 5C. CUSTOM POST TYPE: maschan_invoice
// -----------------------------------------------------------------------
// Menyimpan riwayat tagihan. Sengaja BUKAN usermeta (usermeta cocok untuk
// "status saat ini", bukan daftar yang terus bertambah) — CPT memberi kita
// list view bawaan di wp-admin, relasi native ke lampiran foto bukti bayar,
// dan jejak audit (siapa approve, kapan) tanpa infrastruktur tambahan.
add_action('init', function () {
    register_post_type('maschan_invoice', [
        'label'        => 'Tagihan Langganan Vendor',
        'public'       => false,      // Tidak pernah tampil di halaman publik manapun
        'show_ui'      => true,       // Tapi tetap terlihat & bisa dikelola di wp-admin
        'show_in_menu' => true,
        'menu_icon'    => 'dashicons-money-alt',
        'supports'     => ['title', 'author'],
        // Data finansial vendor — sengaja diikat ke kapabilitas 'manage_options'
        // (khusus Administrator), BUKAN capability_type 'post' standar yang bisa
        // diakses role lain (Editor/Author) kalau ada. Defense-in-depth, di luar
        // pengecekan current_user_can() yang juga ada di handler approve/reject.
        'capabilities' => [
            'edit_post'          => 'manage_options',
            'read_post'          => 'manage_options',
            'delete_post'        => 'manage_options',
            'edit_posts'         => 'manage_options',
            'edit_others_posts'  => 'manage_options',
            'publish_posts'      => 'manage_options',
            'read_private_posts' => 'manage_options',
        ],
        'map_meta_cap' => true,
    ]);
});

// Status invoice yang valid — dipakai untuk validasi input, bukan cuma dokumentasi.
function maschan_invoice_valid_statuses() {
    return ['unpaid', 'waiting_approval', 'approved', 'rejected'];
}

/**
 * Serialisasi 1 invoice (post + meta) jadi array response API.
 * Data ini PRIVAT — hanya boleh diekspos lewat REST yang mewajibkan sesi vendor
 * pemilik invoice atau admin. TIDAK PERNAH didaftarkan ke GraphQL publik.
 */
function maschan_format_invoice($post_id) {
    $post = get_post($post_id);
    if (!$post || $post->post_type !== 'maschan_invoice') return null;

    return [
        'id'                   => $post_id,
        'invoice_number'       => $post->post_title,
        'vendor_id'            => (int)$post->post_author,
        'plan_id'              => get_post_meta($post_id, 'plan_id', true),
        'amount'               => (int)get_post_meta($post_id, 'amount', true),
        'payment_method'       => get_post_meta($post_id, 'payment_method', true),
        'sender_account_name'  => get_post_meta($post_id, 'sender_account_name', true),
        'proof_image_url'      => get_post_meta($post_id, 'proof_image_url', true),
        'invoice_status'       => get_post_meta($post_id, 'invoice_status', true) ?: 'unpaid',
        'admin_note'           => $post->post_content,
        'rejected_reason'      => get_post_meta($post_id, 'rejected_reason', true),
        'approved_at'          => get_post_meta($post_id, 'approved_at', true) ?: null,
        'approved_by'          => get_post_meta($post_id, 'approved_by', true) ?: null,
        'confirmed_at'         => get_post_meta($post_id, 'confirmed_at', true) ?: null,
        'is_overdue'           => get_post_meta($post_id, 'admin_priority_flag', true) === 'overdue',
        'created_at'           => get_the_date('c', $post_id),
    ];
}

/**
 * SATU-SATUNYA tempat logika "setujui invoice" boleh berada. Dipanggil baik dari
 * endpoint REST (/admin/billing/approve) MAUPUN dari meta box wp-admin — supaya
 * tidak ada dua implementasi berbeda yang bisa saling menyimpang (mis. salah satu
 * lupa cek idempotensi, atau salah satu lupa validasi plan). $admin_id dioper dari
 * pemanggil karena cara autentikasinya beda (JWT vs sesi cookie wp-admin), tapi
 * logika bisnis setelah admin terverifikasi harus PERSIS sama.
 *
 * Return ['success' => bool, 'message' => string, 'invoice' => array|null, 'subscription' => array|null]
 */
function maschan_approve_invoice($invoice_id, $admin_id) {
    $post = get_post($invoice_id);
    if (!$post || $post->post_type !== 'maschan_invoice') {
        return ['success' => false, 'message' => 'Tagihan tidak ditemukan.', 'invoice' => null, 'subscription' => null];
    }

    // Idempoten: kalau sudah approved, jangan proses ulang — cegah masa aktif
    // nambah dua kali kalau tombol ke-klik dua kali / form ke-submit ulang.
    if (get_post_meta($invoice_id, 'invoice_status', true) === 'approved') {
        return [
            'success' => true,
            'message' => 'Tagihan ini sudah disetujui sebelumnya.',
            'invoice' => maschan_format_invoice($invoice_id),
            'subscription' => null,
        ];
    }

    // vendor_id SELALU dari post_author invoice, bukan dari parameter luar —
    // supaya tidak ada celah admin approve invoice A tapi update vendor B.
    $vendor_id = (int)$post->post_author;
    $plan_id   = get_post_meta($invoice_id, 'plan_id', true);
    $plan      = maschan_get_plan($plan_id);
    if (!$plan) {
        return ['success' => false, 'message' => 'Paket pada tagihan ini tidak dikenali.', 'invoice' => null, 'subscription' => null];
    }

    $current_end_date = get_user_meta($vendor_id, 'maschan_subscription_end_date', true);
    $new_end_date      = maschan_calculate_new_end_date($current_end_date, $plan['duration_days']);

    update_user_meta($vendor_id, 'maschan_subscription_status', 'active');
    update_user_meta($vendor_id, 'maschan_subscription_end_date', $new_end_date);
    update_user_meta($vendor_id, 'maschan_plan_id', $plan_id);

    update_post_meta($invoice_id, 'invoice_status', 'approved');
    update_post_meta($invoice_id, 'approved_at', current_time('c'));
    update_post_meta($invoice_id, 'approved_by', $admin_id);

    return [
        'success' => true,
        'message' => 'Tagihan disetujui. Masa aktif vendor diperpanjang.',
        'invoice' => maschan_format_invoice($invoice_id),
        'subscription' => maschan_get_vendor_subscription($vendor_id),
    ];
}

/**
 * SATU-SATUNYA tempat logika "tolak invoice" boleh berada — sama alasannya
 * dengan maschan_approve_invoice() di atas.
 */
function maschan_reject_invoice($invoice_id, $reason) {
    $post = get_post($invoice_id);
    if (!$post || $post->post_type !== 'maschan_invoice') {
        return ['success' => false, 'message' => 'Tagihan tidak ditemukan.', 'invoice' => null];
    }
    if (empty($reason)) {
        return ['success' => false, 'message' => 'Alasan penolakan wajib diisi.', 'invoice' => null];
    }
    if (get_post_meta($invoice_id, 'invoice_status', true) !== 'waiting_approval') {
        return ['success' => false, 'message' => 'Tagihan ini tidak dalam status menunggu persetujuan.', 'invoice' => null];
    }

    $vendor_id = (int)$post->post_author;

    update_post_meta($invoice_id, 'invoice_status', 'rejected');
    update_post_meta($invoice_id, 'rejected_reason', $reason);
    update_user_meta($vendor_id, 'maschan_subscription_status', 'payment_rejected');

    return [
        'success' => true,
        'message' => 'Tagihan ditolak. Vendor akan melihat alasan penolakan di dashboard.',
        'invoice' => maschan_format_invoice($invoice_id),
    ];
}

// 6. GRAPHQL REGISTRATION
add_action('graphql_register_types', function () {
    if (!function_exists('register_graphql_object_type')) return;

    register_graphql_object_type('VendorSocialsInfo', [
        'fields' => [
            'instagram' => ['type' => 'String'],
            'tiktok'    => ['type' => 'String'],
            'facebook'  => ['type' => 'String'],
            'youtube'   => ['type' => 'String'],
            'website'   => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('StoreHoursDayInfo', [
        'fields' => [
            'isOpen'    => ['type' => 'Boolean'],
            'openTime'  => ['type' => 'String'],
            'closeTime' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('StoreHoursWeekInfo', [
        'fields' => [
            'senin'  => ['type' => 'StoreHoursDayInfo'],
            'selasa' => ['type' => 'StoreHoursDayInfo'],
            'rabu'   => ['type' => 'StoreHoursDayInfo'],
            'kamis'  => ['type' => 'StoreHoursDayInfo'],
            'jumat'  => ['type' => 'StoreHoursDayInfo'],
            'sabtu'  => ['type' => 'StoreHoursDayInfo'],
            'minggu' => ['type' => 'StoreHoursDayInfo'],
        ],
    ]);

    register_graphql_object_type('VacationModeInfo', [
        'fields' => [
            'isEnabled'       => ['type' => 'Boolean'],
            'vacationMessage' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('StoreSEOInfo', [
        'fields' => [
            'seoTitle'        => ['type' => 'String'],
            'metaDescription' => ['type' => 'String'],
            'metaKeywords'    => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('VendorStoreInfo', [
        'fields' => [
            'id'               => ['type' => 'Int'],
            'storeName'        => ['type' => 'String'],
            'slug'             => ['type' => 'String'],
            'ownerName'        => ['type' => 'String'],
            'email'            => ['type' => 'String'],
            'whatsappNumber'   => ['type' => 'String'],
            'locationDistrict' => ['type' => 'String'],
            'streetAddress'    => ['type' => 'String'],
            'avatarUrl'        => ['type' => 'String'],
            'bannerUrl'        => ['type' => 'String'],
            'description'      => ['type' => 'String'],
            'productsCount'    => ['type' => 'Int'],
            'socials'          => ['type' => 'VendorSocialsInfo'],
            'storeHours'       => ['type' => 'StoreHoursWeekInfo'],
            'vacationMode'     => ['type' => 'VacationModeInfo'],
            'subscriptionExpired' => ['type' => 'Boolean'], // Satu-satunya info langganan yang publik — sisanya privat, hanya lewat REST berautentikasi
            'storeSeo'         => ['type' => 'StoreSEOInfo'],
        ],
    ]);

    $target_types = ['Product', 'SimpleProduct', 'ExternalProduct', 'VariableProduct', 'GroupedProduct'];
    foreach ($target_types as $type_name) {
        register_graphql_field($type_name, 'vendorStore', [
            'type'    => 'VendorStoreInfo',
            'resolve' => function ($source) {
                $post_id   = $source->databaseId ?? ($source->ID ?? 0);
                if (!$post_id) return null;
                $vendor_id = (int)get_post_field('post_author', $post_id);
                $v         = maschan_extract_full_vendor($vendor_id);
                if (!$v) return null;
                return [
                    'id'               => $v['id'],
                    'storeName'        => $v['store_name'],
                    'slug'             => $v['slug'],
                    'ownerName'        => $v['owner_name'],
                    'email'            => $v['email'],
                    'whatsappNumber'   => $v['whatsapp_number'],
                    'locationDistrict' => $v['location_district'],
                    'streetAddress'    => $v['address']['street_1'],
                    'avatarUrl'        => $v['avatar'],
                    'bannerUrl'        => $v['banner'],
                    'description'      => $v['description'],
                    'productsCount'    => $v['products_count'],
                    'socials'          => $v['socials'],
                    'storeHours'       => $v['store_hours'],
                    'vacationMode'     => $v['vacation_mode'],
                    'storeSeo'         => $v['store_seo'],
                    'subscriptionExpired' => maschan_subscription_closes_store($vendor_id),
                ];
            },
        ]);
    }

    register_graphql_field('RootQuery', 'wcfmVendors', [
        'type'    => ['list_of' => 'VendorStoreInfo'],
        'resolve' => function () {
            $user_query = new WP_User_Query([
                'role__in' => maschan_get_vendor_roles(),
                'number'   => 100,
            ]);
            $vendors = [];
            if (!empty($user_query->get_results())) {
                foreach ($user_query->get_results() as $user) {
                    $v = maschan_extract_full_vendor($user->ID);
                    if ($v) {
                        $vendors[] = [
                            'id'               => $v['id'],
                            'storeName'        => $v['store_name'],
                            'slug'             => $v['slug'],
                            'ownerName'        => $v['owner_name'],
                            'email'            => $v['email'],
                            'whatsappNumber'   => $v['whatsapp_number'],
                            'locationDistrict' => $v['location_district'],
                            'streetAddress'    => $v['address']['street_1'],
                            'avatarUrl'        => $v['avatar'],
                            'bannerUrl'        => $v['banner'],
                            'description'      => $v['description'],
                            'productsCount'    => $v['products_count'],
                            'socials'          => $v['socials'],
                            'storeHours'       => $v['store_hours'],
                            'vacationMode'     => $v['vacation_mode'],
                            'storeSeo'         => $v['store_seo'],
                            'subscriptionExpired' => maschan_subscription_closes_store($user->ID),
                        ];
                    }
                }
            }
            return $vendors;
        },
    ]);
});

// 7. REST API ENDPOINTS
add_action('rest_api_init', function () {

    // LOGIN
    register_rest_route('maschan/v1', '/auth/login', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $params   = $request->get_json_params() ?: $request->get_params();
            $username = sanitize_user($params['username'] ?? ($params['email'] ?? ''));
            $password = $params['password'] ?? '';

            if (empty($username) || empty($password)) {
                return new WP_Error('missing_credentials', 'Username/Email dan Password wajib diisi.', ['status' => 400]);
            }

            $user = wp_authenticate($username, $password);
            if (is_wp_error($user)) {
                return new WP_Error('invalid_login', 'Email/Username atau Password salah.', ['status' => 401]);
            }

            $token = maschan_generate_jwt($user->ID);
            $vendor_info = maschan_extract_full_vendor($user->ID);

            return rest_ensure_response([
                'success' => true,
                'token'   => $token,
                'user'    => [
                    'id'          => $user->ID,
                    'email'       => $user->user_email,
                    'name'        => $user->display_name,
                    'store_name'  => $vendor_info['store_name'] ?? $user->display_name,
                    'slug'        => $vendor_info['slug'] ?? $user->user_nicename,
                    'phone'       => $vendor_info['whatsapp_number'] ?? '',
                    'district'    => $vendor_info['location_district'] ?? 'Serang',
                ]
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

    // REGISTER
    register_rest_route('maschan/v1', '/auth/register', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $params = $request->get_json_params() ?: $request->get_params();

            $store_name = sanitize_text_field($params['store_name'] ?? '');
            $owner_name = sanitize_text_field($params['owner_name'] ?? '');
            $email      = sanitize_email($params['email'] ?? '');
            $password   = $params['password'] ?? '';
            $phone      = sanitize_text_field($params['whatsapp_number'] ?? ($params['phone'] ?? ''));
            $district   = sanitize_text_field($params['location_district'] ?? ($params['district'] ?? 'Cipocok Jaya'));

            if (empty($store_name) || empty($email) || empty($password)) {
                return new WP_Error('missing_fields', 'Nama Toko, Email, dan Password wajib diisi.', ['status' => 400]);
            }

            if (email_exists($email)) {
                return new WP_Error('email_exists', 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau login.', ['status' => 409]);
            }

            $username = sanitize_user(str_replace(' ', '', strtolower($store_name))) . rand(10, 99);
            if (username_exists($username)) {
                $username = sanitize_user(str_replace(' ', '', strtolower($store_name))) . rand(100, 999);
            }

            $user_id = wp_create_user($username, $password, $email);
            if (is_wp_error($user_id)) return $user_id;

            $wp_user = new WP_User($user_id);
            $wp_user->set_role('wcfm_vendor');

            if (!empty($owner_name)) wp_update_user(['ID' => $user_id, 'display_name' => $owner_name]);

            $clean_phone = preg_replace('/[^0-9]/', '', $phone);
            if (!empty($clean_phone)) {
                if (str_starts_with($clean_phone, '0')) $clean_phone = '62' . substr($clean_phone, 1);
                elseif (str_starts_with($clean_phone, '8')) $clean_phone = '62' . $clean_phone;
            }

            $store_slug = sanitize_title($store_name);

            $wcfm_settings = [
                'store_name'  => $store_name,
                'store_slug'  => $store_slug,
                'phone'       => $clean_phone,
                'store_phone' => $clean_phone,
                'address'     => [
                    'street_1' => 'Kota Serang',
                    'city'     => $district,
                    'zip'      => '42111',
                    'country'  => 'ID',
                ],
                'shop_description' => "Selamat datang di toko $store_name di Kota Serang.",
            ];

            update_user_meta($user_id, 'wcfmmp_profile_settings', $wcfm_settings);
            update_user_meta($user_id, 'store_name', $store_name);
            update_user_meta($user_id, 'wcfmmp_store_name', $store_name);
            update_user_meta($user_id, 'billing_phone', $clean_phone);
            update_user_meta($user_id, 'phone', $clean_phone);
            update_user_meta($user_id, 'location_district', $district);

            // Inisialisasi Paket Starter UMKM otomatis (gratis selamanya, maks 3 produk).
            // Status langsung 'active' (bukan 'trial') karena paket ini permanen —
            // tidak ada lagi konsep "masa uji coba" yang bisa habis.
            update_user_meta($user_id, 'maschan_subscription_status', 'active');
            update_user_meta($user_id, 'maschan_plan_id', 'free_forever');
            update_user_meta($user_id, 'maschan_subscription_end_date', null);

            $token = maschan_generate_jwt($user_id);

            return rest_ensure_response([
                'success' => true,
                'message' => 'Pendaftaran toko vendor berhasil!',
                'token'   => $token,
                'user'    => [
                    'id'          => $user_id,
                    'email'       => $email,
                    'name'        => $owner_name ?: $store_name,
                    'store_name'  => $store_name,
                    'slug'        => $store_slug,
                    'phone'       => $clean_phone,
                    'district'    => $district,
                ]
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

    // PRODUCTS GET
    register_rest_route('maschan/v1', '/products', [
        'methods'  => 'GET',
        'callback' => function ($request) {
            $raw_slug  = $request->get_param('slug');
            $raw_id    = $request->get_param('id');
            $vendor_id = $request->get_param('vendor_id');
            $category  = $request->get_param('category');
            $search    = $request->get_param('search');

            if (!empty($raw_id)) {
                $item = maschan_format_product_data(intval($raw_id));
                return rest_ensure_response($item ? [$item] : []);
            }

            if (!empty($raw_slug)) {
                $decoded_slug = sanitize_title(urldecode($raw_slug));
                $post = get_page_by_path($decoded_slug, OBJECT, 'product');
                if (!$post) {
                    $q = new WP_Query([
                        'name'        => $decoded_slug,
                        'post_type'   => 'product',
                        'post_status' => ['publish', 'draft'],
                        'posts_per_page' => 1,
                    ]);
                    if ($q->have_posts()) $post = $q->posts[0];
                }
                if ($post) {
                    $item = maschan_format_product_data($post->ID);
                    return rest_ensure_response($item ? [$item] : []);
                }
                return rest_ensure_response([]);
            }

            $args = [
                'post_type'      => 'product',
                'post_status'    => ['publish', 'draft'],
                'posts_per_page' => 100,
            ];
            if (!empty($vendor_id)) $args['author'] = intval($vendor_id);
            if (!empty($search)) $args['s'] = sanitize_text_field($search);
            if (!empty($category)) {
                $args['tax_query'] = [
                    [
                        'taxonomy' => 'product_cat',
                        'field'    => 'slug',
                        'terms'    => sanitize_title($category),
                    ]
                ];
            }

            $query = new WP_Query($args);
            $products = [];
            if ($query->have_posts()) {
                while ($query->have_posts()) {
                    $query->the_post();
                    $item = maschan_format_product_data(get_the_ID());
                    if ($item) $products[] = $item;
                }
                wp_reset_postdata();
            }
            return rest_ensure_response($products);
        },
        'permission_callback' => '__return_true',
    ]);

    // CREATE PRODUCT
    register_rest_route('maschan/v1', '/products', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $params = $request->get_json_params() ?: $request->get_params();

            $name = sanitize_text_field($params['name'] ?? '');
            if (empty($name)) {
                return new WP_Error('missing_name', 'Nama produk wajib diisi.', ['status' => 400]);
            }

            $author_id = maschan_get_current_user_from_request($request);
            if (!$author_id) {
                // Fallback eksplisit HANYA jika author_id/vendor_id benar-benar dikirim di body request.
                // Tidak ada lagi default diam-diam ke user ID tertentu — ini penyebab produk uji coba
                // pernah salah tertaut ke vendor lain saat token tidak terkirim/kedaluwarsa.
                if (!empty($params['author_id'])) {
                    $author_id = intval($params['author_id']);
                } elseif (!empty($params['vendor_id'])) {
                    $author_id = intval($params['vendor_id']);
                } else {
                    return new WP_Error(
                        'unauthenticated',
                        'Sesi login tidak valid atau kedaluwarsa. Silakan login ulang sebelum menambah produk.',
                        ['status' => 401]
                    );
                }
            }

            // GATING LANGGANAN: cek status & kuota produk sebelum izinkan tambah produk.
            // Dihitung via maschan_get_vendor_subscription() — satu fungsi yang sama
            // dipakai di endpoint GET /billing, supaya definisinya tidak pernah menyimpang.
            $subscription = maschan_get_vendor_subscription($author_id);
            if ($subscription && !$subscription['can_add_product']) {
                $reason = in_array($subscription['status'], maschan_subscription_statuses_can_add_product(), true)
                    ? 'Kuota produk paket Anda sudah penuh. Upgrade paket untuk menambah produk lagi.'
                    : 'Langganan Anda sedang tidak aktif untuk menambah produk. Silakan perpanjang langganan terlebih dahulu.';
                return new WP_Error('subscription_limit', $reason, ['status' => 403]);
            }

            $type = ($params['type'] ?? '') === 'affiliate' ? 'external' : 'simple';

            $post_id = wp_insert_post([
                'post_title'   => $name,
                'post_content' => wp_kses_post($params['description'] ?? ''),
                'post_excerpt' => sanitize_textarea_field($params['short_description'] ?? ''),
                'post_status'  => 'publish',
                'post_type'    => 'product',
                'post_author'  => $author_id,
            ]);

            if (is_wp_error($post_id)) return $post_id;

            wp_set_object_terms($post_id, $type, 'product_type');

            $regular_price = sanitize_text_field($params['regular_price'] ?? ($params['price'] ?? '0'));
            $sale_price    = sanitize_text_field($params['sale_price'] ?? '');
            $on_sale       = !empty($params['on_sale']) && !empty($sale_price);

            update_post_meta($post_id, '_regular_price', $regular_price);
            if ($on_sale) {
                update_post_meta($post_id, '_sale_price', $sale_price);
                update_post_meta($post_id, '_price', $sale_price);
            } else {
                delete_post_meta($post_id, '_sale_price');
                update_post_meta($post_id, '_price', $regular_price);
            }

            if ($type === 'external') {
                update_post_meta($post_id, '_product_url', esc_url_raw($params['external_url'] ?? ''));
                update_post_meta($post_id, '_button_text', sanitize_text_field($params['button_text'] ?? 'Beli via Link'));
            }

            $image_id = intval($params['image_id'] ?? 0);
            if (!$image_id && !empty($params['images'][0]['id'])) {
                $image_id = intval($params['images'][0]['id']);
            }
            if (!$image_id && !empty($params['images'][0]['src'])) {
                $image_id = attachment_url_to_postid($params['images'][0]['src']);
            }

            if ($image_id > 0) {
                set_post_thumbnail($post_id, $image_id);
                update_post_meta($post_id, '_thumbnail_id', $image_id);
                $wc_product = wc_get_product($post_id);
                if ($wc_product) {
                    $wc_product->set_image_id($image_id);
                    $wc_product->save();
                }
            }

            if (!empty($params['category_ids']) && is_array($params['category_ids'])) {
                wp_set_object_terms($post_id, array_map('intval', $params['category_ids']), 'product_cat');
            }

            if (!empty($params['seo']) && is_array($params['seo'])) {
                if (!empty($params['seo']['focus_keyword'])) update_post_meta($post_id, 'rank_math_focus_keyword', sanitize_text_field($params['seo']['focus_keyword']));
                if (!empty($params['seo']['meta_title'])) update_post_meta($post_id, 'rank_math_title', sanitize_text_field($params['seo']['meta_title']));
                if (!empty($params['seo']['meta_description'])) update_post_meta($post_id, 'rank_math_description', sanitize_textarea_field($params['seo']['meta_description']));
            }

            wc_delete_product_transients($post_id);
            wp_cache_flush();

            return rest_ensure_response([
                'success' => true,
                'message' => 'Produk berhasil diterbitkan atas nama toko vendor Anda.',
                'product' => maschan_format_product_data($post_id),
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

    // UPDATE PRODUCT
    register_rest_route('maschan/v1', '/products/(?P<id>\d+)', [
        'methods'  => ['POST', 'PUT'],
        'callback' => function ($request) {
            $post_id = intval($request['id']);
            if (!$post_id || get_post_type($post_id) !== 'product') {
                return new WP_Error('invalid_product', 'Produk tidak ditemukan.', ['status' => 404]);
            }

            $params = $request->get_json_params() ?: $request->get_params();

            $update_data = ['ID' => $post_id];
            if (!empty($params['name'])) $update_data['post_title'] = sanitize_text_field($params['name']);
            if (isset($params['description'])) $update_data['post_content'] = wp_kses_post($params['description']);
            if (isset($params['short_description'])) $update_data['post_excerpt'] = sanitize_textarea_field($params['short_description']);
            
            $req_author = maschan_get_current_user_from_request($request);
            if ($req_author) {
                $update_data['post_author'] = $req_author;
            } elseif (!empty($params['author_id'])) {
                $update_data['post_author'] = intval($params['author_id']);
            }

            wp_update_post($update_data);

            if (!empty($params['type'])) {
                $type = $params['type'] === 'affiliate' ? 'external' : 'simple';
                wp_set_object_terms($post_id, $type, 'product_type');
            }

            if (isset($params['regular_price'])) {
                $regular_price = sanitize_text_field($params['regular_price']);
                $sale_price    = sanitize_text_field($params['sale_price'] ?? '');
                $on_sale       = !empty($params['on_sale']) && !empty($sale_price);

                update_post_meta($post_id, '_regular_price', $regular_price);
                if ($on_sale) {
                    update_post_meta($post_id, '_sale_price', $sale_price);
                    update_post_meta($post_id, '_price', $sale_price);
                } else {
                    delete_post_meta($post_id, '_sale_price');
                    update_post_meta($post_id, '_price', $regular_price);
                }
            }

            if (isset($params['external_url'])) update_post_meta($post_id, '_product_url', esc_url_raw($params['external_url']));
            if (isset($params['button_text'])) update_post_meta($post_id, '_button_text', sanitize_text_field($params['button_text']));

            $image_id = intval($params['image_id'] ?? 0);
            if (!$image_id && !empty($params['images'][0]['id'])) {
                $image_id = intval($params['images'][0]['id']);
            }
            if (!$image_id && !empty($params['images'][0]['src'])) {
                $image_id = attachment_url_to_postid($params['images'][0]['src']);
            }

            if ($image_id > 0) {
                set_post_thumbnail($post_id, $image_id);
                update_post_meta($post_id, '_thumbnail_id', $image_id);
                $wc_product = wc_get_product($post_id);
                if ($wc_product) {
                    $wc_product->set_image_id($image_id);
                    $wc_product->save();
                }
            }

            if (!empty($params['category_ids']) && is_array($params['category_ids'])) {
                wp_set_object_terms($post_id, array_map('intval', $params['category_ids']), 'product_cat');
            }

            if (!empty($params['seo']) && is_array($params['seo'])) {
                if (isset($params['seo']['focus_keyword'])) update_post_meta($post_id, 'rank_math_focus_keyword', sanitize_text_field($params['seo']['focus_keyword']));
                if (isset($params['seo']['meta_title'])) update_post_meta($post_id, 'rank_math_title', sanitize_text_field($params['seo']['meta_title']));
                if (isset($params['seo']['meta_description'])) update_post_meta($post_id, 'rank_math_description', sanitize_textarea_field($params['seo']['meta_description']));
            }

            wc_delete_product_transients($post_id);
            wp_cache_flush();

            return rest_ensure_response([
                'success' => true,
                'message' => 'Perubahan produk berhasil disimpan.',
                'product' => maschan_format_product_data($post_id),
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

    // DELETE PRODUCT
    register_rest_route('maschan/v1', '/products/(?P<id>\d+)', [
        'methods'  => 'DELETE',
        'callback' => function ($request) {
            $post_id = intval($request['id']);
            if (!$post_id) return new WP_Error('invalid_id', 'ID produk tidak valid.', ['status' => 400]);
            $deleted = wp_delete_post($post_id, true);
            return rest_ensure_response(['success' => (bool)$deleted]);
        },
        'permission_callback' => '__return_true',
    ]);

    // GET SINGLE VENDOR BY ID
    register_rest_route('maschan/v1', '/vendors/(?P<id>\d+)', [
        'methods'  => 'GET',
        'callback' => function ($request) {
            $user_id = intval($request['id']);
            $v = maschan_extract_full_vendor($user_id);
            if (!$v) {
                return new WP_Error('vendor_not_found', 'Vendor tidak ditemukan.', ['status' => 404]);
            }
            return rest_ensure_response($v);
        },
        'permission_callback' => '__return_true',
    ]);

    // UPDATE VENDOR FULL SETTINGS (POST/PUT /wp-json/maschan/v1/vendors/<id>)
    register_rest_route('maschan/v1', '/vendors/(?P<id>\d+)', [
        'methods'  => ['POST', 'PUT'],
        'callback' => function ($request) {
            $user_id = intval($request['id']);
            if (!$user_id || !get_userdata($user_id)) {
                return new WP_Error('invalid_vendor', 'Vendor tidak ditemukan.', ['status' => 404]);
            }

            $params = $request->get_json_params() ?: $request->get_params();

            $wcfm = get_user_meta($user_id, 'wcfmmp_profile_settings', true);
            if (!is_array($wcfm)) $wcfm = [];

            // 1. Basic Details
            if (isset($params['store_name'])) {
                $store_name = sanitize_text_field($params['store_name']);
                $wcfm['store_name'] = $store_name;
                update_user_meta($user_id, 'store_name', $store_name);
                update_user_meta($user_id, 'wcfmmp_store_name', $store_name);
            }
            if (isset($params['owner_name'])) {
                wp_update_user(['ID' => $user_id, 'display_name' => sanitize_text_field($params['owner_name'])]);
            }
            if (isset($params['email'])) {
                wp_update_user(['ID' => $user_id, 'user_email' => sanitize_email($params['email'])]);
            }
            if (isset($params['whatsapp_number']) || isset($params['phone'])) {
                $phone = sanitize_text_field($params['whatsapp_number'] ?? $params['phone']);
                $wcfm['phone'] = $phone;
                $wcfm['store_phone'] = $phone;
                update_user_meta($user_id, 'billing_phone', $phone);
                update_user_meta($user_id, 'phone', $phone);
            }
            if (isset($params['description'])) {
                $desc = wp_kses_post($params['description']);
                $wcfm['shop_description'] = $desc;
                update_user_meta($user_id, 'description', $desc);
                update_user_meta($user_id, 'wcfmmp_store_description', $desc);
            }
            if (isset($params['location_district'])) {
                $district = sanitize_text_field($params['location_district']);
                $wcfm['address']['city'] = $district;
                update_user_meta($user_id, 'location_district', $district);
            }
            if (isset($params['address']['street_1'])) {
                $wcfm['address']['street_1'] = sanitize_text_field($params['address']['street_1']);
                update_user_meta($user_id, 'billing_address_1', sanitize_text_field($params['address']['street_1']));
            }

            // 2. Branding (Avatar & Banner)
            if (isset($params['avatar'])) {
                $wcfm['gravatar'] = esc_url_raw($params['avatar']);
                update_user_meta($user_id, 'wcfmmp_avatar', esc_url_raw($params['avatar']));
            }
            if (isset($params['banner'])) {
                $wcfm['banner'] = esc_url_raw($params['banner']);
                update_user_meta($user_id, 'wcfmmp_banner', esc_url_raw($params['banner']));
            }

            // 3. Social Media
            if (isset($params['socials']) && is_array($params['socials'])) {
                $social_data = [
                    'instagram' => esc_url_raw($params['socials']['instagram'] ?? ''),
                    'tiktok'    => esc_url_raw($params['socials']['tiktok'] ?? ''),
                    'fb'        => esc_url_raw($params['socials']['facebook'] ?? ''),
                    'facebook'  => esc_url_raw($params['socials']['facebook'] ?? ''),
                    'youtube'   => esc_url_raw($params['socials']['youtube'] ?? ''),
                    'website'   => esc_url_raw($params['socials']['website'] ?? ''),
                ];

                $wcfm['social'] = $social_data;
                update_user_meta($user_id, 'wcfm_store_social', $social_data);
                update_user_meta($user_id, 'wcfm_social_instagram', $social_data['instagram']);
                update_user_meta($user_id, 'wcfm_social_tiktok', $social_data['tiktok']);
                update_user_meta($user_id, 'wcfm_social_facebook', $social_data['fb']);
                update_user_meta($user_id, 'wcfm_social_youtube', $social_data['youtube']);
            }

            // 4. Store Hours
            if (isset($params['store_hours']) && is_array($params['store_hours'])) {
                $hours_save = $params['store_hours'];
                $days_map = ['senin' => 'mon', 'selasa' => 'tue', 'rabu' => 'wed', 'kamis' => 'thu', 'jumat' => 'fri', 'sabtu' => 'sat', 'minggu' => 'sun'];
                
                $wcfm_hours_format = ['enabled' => 'yes'];
                foreach ($days_map as $id_day => $en_day) {
                    if (isset($params['store_hours'][$id_day])) {
                        $d = $params['store_hours'][$id_day];
                        $wcfm_hours_format[$en_day] = [
                            'open'  => !empty($d['isOpen']) ? 'yes' : 'no',
                            'start' => sanitize_text_field($d['openTime'] ?? '08:00'),
                            'end'   => sanitize_text_field($d['closeTime'] ?? '17:00'),
                        ];
                    }
                }

                $wcfm['wcfm_vendor_store_hours'] = $wcfm_hours_format;
                update_user_meta($user_id, 'wcfm_store_hours', $hours_save);
                update_user_meta($user_id, 'wcfm_vendor_store_hours', $wcfm_hours_format);
            }

            // 5. Vacation Mode (Tutup / Libur Toggle)
            if (isset($params['vacation_mode']) && is_array($params['vacation_mode'])) {
                $is_enabled = !empty($params['vacation_mode']['isEnabled']) && ($params['vacation_mode']['isEnabled'] === true || $params['vacation_mode']['isEnabled'] === 'yes');
                $v_enabled = $is_enabled ? 'yes' : 'no';
                $v_msg     = sanitize_textarea_field($params['vacation_mode']['vacationMessage'] ?? '');

                $wcfm['vacation_mode']          = $v_enabled;
                $wcfm['wcfm_vacation_mode']      = $v_enabled;
                $wcfm['vacation_mode_msg']       = $v_msg;
                $wcfm['wcfm_vacation_mode_msg']   = $v_msg;

                update_user_meta($user_id, 'wcfm_vacation_mode', $v_enabled);
                update_user_meta($user_id, 'wcfm_vacation_mode_msg', $v_msg);
            }

            // 6. Store SEO
            if (isset($params['store_seo']) && is_array($params['store_seo'])) {
                $seo_title = sanitize_text_field($params['store_seo']['seoTitle'] ?? '');
                $seo_desc  = sanitize_textarea_field($params['store_seo']['metaDescription'] ?? '');
                $seo_kw    = sanitize_text_field($params['store_seo']['metaKeywords'] ?? '');

                $wcfm['store_seo']['wcfmmp_seo_meta_title']    = $seo_title;
                $wcfm['store_seo']['wcfmmp_seo_meta_desc']     = $seo_desc;
                $wcfm['store_seo']['wcfmmp_seo_meta_keywords'] = $seo_kw;

                update_user_meta($user_id, 'wcfm_store_seo_title', $seo_title);
                update_user_meta($user_id, 'wcfm_store_seo_meta_desc', $seo_desc);
                update_user_meta($user_id, 'wcfm_store_seo_meta_keywords', $seo_kw);
                update_user_meta($user_id, 'wcfmmp_seo_meta_title', $seo_title);
                update_user_meta($user_id, 'wcfmmp_seo_meta_desc', $seo_desc);
                update_user_meta($user_id, 'wcfmmp_seo_meta_keywords', $seo_kw);
            }

            update_user_meta($user_id, 'wcfmmp_profile_settings', $wcfm);
            clean_user_cache($user_id);
            wp_cache_flush();

            return rest_ensure_response([
                'success' => true,
                'message' => 'Pengaturan profil toko WCFM berhasil diperbarui ke database.',
                'vendor'  => maschan_extract_full_vendor($user_id),
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

    // ---------------------------------------------------------------
    // 8. BILLING / SUBSCRIPTION REST API ENDPOINTS
    // Catatan: header no-cache untuk seluruh path /wp-json/maschan/v1/
    // sudah ditangani secara generik di blok CORS+Cache Bypass (bagian 1),
    // jadi tidak perlu ditambahkan ulang di sini.
    // ---------------------------------------------------------------

    // GET BILLING INFO — status langganan vendor yang sedang login + riwayat invoice
    register_rest_route('maschan/v1', '/billing', [
        'methods'  => 'GET',
        'callback' => function ($request) {
            $vendor_id = maschan_get_current_user_from_request($request);
            if (!$vendor_id) {
                return new WP_Error('unauthenticated', 'Sesi login tidak valid atau kedaluwarsa.', ['status' => 401]);
            }

            $subscription = maschan_get_vendor_subscription($vendor_id);

            $invoice_posts = get_posts([
                'post_type'      => 'maschan_invoice',
                'author'         => $vendor_id,
                'post_status'    => 'any',
                'posts_per_page' => 50,
                'orderby'        => 'ID',
                'order'          => 'DESC',
            ]);
            $invoices = array_values(array_filter(array_map(
                fn($p) => maschan_format_invoice($p->ID),
                $invoice_posts
            )));

            return rest_ensure_response([
                'subscription' => $subscription,
                'plans'        => maschan_get_subscription_plans(),
                'invoices'     => $invoices,
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

    // CREATE RENEWAL INVOICE — vendor memilih paket, sistem buat tagihan baru
    register_rest_route('maschan/v1', '/billing/renew', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $vendor_id = maschan_get_current_user_from_request($request);
            if (!$vendor_id) {
                return new WP_Error('unauthenticated', 'Sesi login tidak valid atau kedaluwarsa.', ['status' => 401]);
            }

            $params  = $request->get_json_params() ?: $request->get_params();
            $plan_id = sanitize_text_field($params['plan_id'] ?? '');
            $plan    = maschan_get_plan($plan_id);

            if (!$plan) {
                return new WP_Error('invalid_plan', 'Paket langganan tidak dikenali.', ['status' => 400]);
            }

            // Paket gratis (harga Rp 0, mis. Starter UMKM): tidak masuk akal minta
            // bukti transfer & menunggu approval admin untuk uang nol rupiah.
            // Langsung diterapkan — ini juga jalur vendor berbayar "turun kelas"
            // balik ke Starter secara sukarela lewat halaman billing.
            if ((int)$plan['price'] === 0) {
                $current_end_date = get_user_meta($vendor_id, 'maschan_subscription_end_date', true);
                $new_end_date = maschan_calculate_new_end_date($current_end_date, $plan['duration_days']);

                update_user_meta($vendor_id, 'maschan_subscription_status', 'active');
                update_user_meta($vendor_id, 'maschan_subscription_end_date', $new_end_date);
                update_user_meta($vendor_id, 'maschan_plan_id', $plan_id);

                // Tetap dicatat sebagai invoice untuk jejak riwayat, langsung berstatus
                // approved (tidak pernah melalui 'unpaid'/'waiting_approval').
                $post_id = wp_insert_post([
                    'post_type'   => 'maschan_invoice',
                    'post_title'  => 'Invoice (draft)',
                    'post_status' => 'publish',
                    'post_author' => $vendor_id,
                ]);
                if (is_wp_error($post_id)) return $post_id;

                wp_update_post([
                    'ID'         => $post_id,
                    'post_title' => 'INV-' . str_pad($post_id, 6, '0', STR_PAD_LEFT),
                ]);
                update_post_meta($post_id, 'plan_id', $plan_id);
                update_post_meta($post_id, 'amount', 0);
                update_post_meta($post_id, 'payment_method', 'Gratis (Paket Starter UMKM)');
                update_post_meta($post_id, 'invoice_status', 'approved');
                update_post_meta($post_id, 'approved_at', current_time('c'));

                return rest_ensure_response([
                    'success'      => true,
                    'message'      => 'Berhasil beralih ke Paket Starter UMKM.',
                    'invoice'      => maschan_format_invoice($post_id),
                    'subscription' => maschan_get_vendor_subscription($vendor_id),
                ]);
            }

            // Idempotensi: kalau vendor sudah punya invoice yang masih berjalan
            // (belum dibayar / menunggu approval), pakai itu lagi — jangan bikin
            // tagihan duplikat tiap kali vendor buka halaman billing.
            $existing = get_posts([
                'post_type'      => 'maschan_invoice',
                'author'         => $vendor_id,
                'post_status'    => 'any',
                'posts_per_page' => 1,
                'meta_query'     => [
                    [
                        'key'     => 'invoice_status',
                        'value'   => ['unpaid', 'waiting_approval'],
                        'compare' => 'IN',
                    ],
                ],
            ]);
            if (!empty($existing)) {
                return rest_ensure_response([
                    'success' => true,
                    'message' => 'Anda sudah punya tagihan yang belum selesai.',
                    'invoice' => maschan_format_invoice($existing[0]->ID),
                ]);
            }

            // Harga TIDAK PERNAH diambil dari client — selalu dari definisi paket di server,
            // supaya tidak bisa dimanipulasi lewat request langsung.
            $post_id = wp_insert_post([
                'post_type'   => 'maschan_invoice',
                'post_title'  => 'Invoice (draft)',
                'post_status' => 'publish',
                'post_author' => $vendor_id,
            ]);
            if (is_wp_error($post_id)) return $post_id;

            wp_update_post([
                'ID'         => $post_id,
                'post_title' => 'INV-' . str_pad($post_id, 6, '0', STR_PAD_LEFT),
            ]);
            update_post_meta($post_id, 'plan_id', $plan_id);
            update_post_meta($post_id, 'amount', $plan['price']);
            update_post_meta($post_id, 'invoice_status', 'unpaid');

            return rest_ensure_response([
                'success' => true,
                'message' => 'Tagihan berhasil dibuat.',
                'invoice' => maschan_format_invoice($post_id),
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

    // CONFIRM PAYMENT — vendor unggah bukti bayar untuk invoice tertentu
    register_rest_route('maschan/v1', '/billing/confirm', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $vendor_id = maschan_get_current_user_from_request($request);
            if (!$vendor_id) {
                return new WP_Error('unauthenticated', 'Sesi login tidak valid atau kedaluwarsa.', ['status' => 401]);
            }

            $params     = $request->get_json_params() ?: $request->get_params();
            $invoice_id = intval($params['invoice_id'] ?? 0);
            if (!$invoice_id) {
                return new WP_Error('missing_invoice_id', 'invoice_id wajib disertakan.', ['status' => 400]);
            }

            $post = get_post($invoice_id);
            if (!$post || $post->post_type !== 'maschan_invoice') {
                return new WP_Error('invoice_not_found', 'Tagihan tidak ditemukan.', ['status' => 404]);
            }
            // Vendor hanya boleh konfirmasi invoice miliknya sendiri.
            if ((int)$post->post_author !== $vendor_id) {
                return new WP_Error('forbidden', 'Tagihan ini bukan milik akun Anda.', ['status' => 403]);
            }

            $current_status = get_post_meta($invoice_id, 'invoice_status', true);
            if (!in_array($current_status, ['unpaid', 'rejected'], true)) {
                return new WP_Error(
                    'invalid_state',
                    'Tagihan ini sudah dikonfirmasi/diproses sebelumnya.',
                    ['status' => 409]
                );
            }

            $proof_image_url     = esc_url_raw($params['proof_image_url'] ?? '');
            $sender_account_name = sanitize_text_field($params['sender_account_name'] ?? '');
            $payment_method      = sanitize_text_field($params['payment_method'] ?? 'Transfer Bank Manual');

            if (empty($proof_image_url) || empty($sender_account_name)) {
                return new WP_Error(
                    'missing_fields',
                    'Foto bukti transfer dan nama pemilik rekening wajib diisi.',
                    ['status' => 400]
                );
            }

            update_post_meta($invoice_id, 'proof_image_url', $proof_image_url);
            update_post_meta($invoice_id, 'sender_account_name', $sender_account_name);
            update_post_meta($invoice_id, 'payment_method', $payment_method);
            update_post_meta($invoice_id, 'invoice_status', 'waiting_approval');
            update_post_meta($invoice_id, 'confirmed_at', current_time('c'));
            delete_post_meta($invoice_id, 'rejected_reason'); // bersihkan alasan tolak lama kalau ini resubmit
            delete_post_meta($invoice_id, 'admin_priority_flag'); // reset penanda mendesak kalau ini resubmit setelah ditolak

            // Grace Protection Window: status vendor jadi pending_approval,
            // toko TETAP BUKA di publik (lihat maschan_subscription_closes_store()).
            update_user_meta($vendor_id, 'maschan_subscription_status', 'pending_approval');

            return rest_ensure_response([
                'success' => true,
                'message' => 'Bukti pembayaran berhasil dikirim. Menunggu verifikasi Admin.',
                'invoice' => maschan_format_invoice($invoice_id),
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

    // ADMIN: APPROVE INVOICE
    register_rest_route('maschan/v1', '/admin/billing/approve', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $admin_id = maschan_get_authenticated_admin_id($request);
            if (!$admin_id) {
                return new WP_Error('forbidden', 'Hanya Administrator yang boleh menyetujui tagihan.', ['status' => 403]);
            }

            $params     = $request->get_json_params() ?: $request->get_params();
            $invoice_id = intval($params['invoice_id'] ?? 0);

            $result = maschan_approve_invoice($invoice_id, $admin_id);
            if (!$result['success']) {
                return new WP_Error('approve_failed', $result['message'], ['status' => 400]);
            }
            return rest_ensure_response($result);
        },
        'permission_callback' => '__return_true',
    ]);

    // ADMIN: REJECT INVOICE
    register_rest_route('maschan/v1', '/admin/billing/reject', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $admin_id = maschan_get_authenticated_admin_id($request);
            if (!$admin_id) {
                return new WP_Error('forbidden', 'Hanya Administrator yang boleh menolak tagihan.', ['status' => 403]);
            }

            $params     = $request->get_json_params() ?: $request->get_params();
            $invoice_id = intval($params['invoice_id'] ?? 0);
            $reason     = sanitize_textarea_field($params['reason'] ?? '');

            $result = maschan_reject_invoice($invoice_id, $reason);
            if (!$result['success']) {
                return new WP_Error('reject_failed', $result['message'], ['status' => 400]);
            }
            return rest_ensure_response($result);
        },
        'permission_callback' => '__return_true',
    ]);

    // ADMIN: MIGRASI VENDOR LAMA (satu-kali, sebelum sistem langganan ada)
    // Dipakai untuk menetapkan status awal vendor yang sudah terdaftar SEBELUM
    // fitur ini dibangun. Sengaja jadi endpoint eksplisit (bukan kode otomatis
    // yang menebak vendor mana yang "lama") — supaya setiap perubahan tercatat
    // sebagai aksi admin yang disengaja, sesuai prinsip anti-silent-fallback.
    register_rest_route('maschan/v1', '/admin/billing/migrate-legacy-vendor', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $admin_id = maschan_get_authenticated_admin_id($request);
            if (!$admin_id) {
                return new WP_Error('forbidden', 'Hanya Administrator yang boleh menjalankan migrasi ini.', ['status' => 403]);
            }

            $params    = $request->get_json_params() ?: $request->get_params();
            $vendor_id = intval($params['vendor_id'] ?? 0);
            $mode      = sanitize_text_field($params['mode'] ?? ''); // 'exempt' | 'starter'

            if (!$vendor_id) {
                return new WP_Error(
                    'missing_vendor_id',
                    "Parameter 'vendor_id' kosong atau tidak terkirim. Cek: body request di Postman harus 'raw' + tipe 'JSON', dan header Content-Type: application/json.",
                    ['status' => 400]
                );
            }
            if (!get_userdata($vendor_id)) {
                return new WP_Error('invalid_vendor', "Vendor dengan ID {$vendor_id} tidak ditemukan di database.", ['status' => 404]);
            }

            if ($mode === 'exempt') {
                update_user_meta($vendor_id, 'maschan_subscription_exempt', 'yes');
                return rest_ensure_response([
                    'success' => true,
                    'message' => 'Vendor ditandai sebagai akun internal/demo — dikecualikan dari sistem langganan.',
                    'subscription' => maschan_get_vendor_subscription($vendor_id),
                ]);
            }

            if ($mode === 'starter') {
                $plan = maschan_get_plan('free_forever');
                update_user_meta($vendor_id, 'maschan_subscription_status', 'active');
                update_user_meta($vendor_id, 'maschan_plan_id', 'free_forever');
                update_user_meta(
                    $vendor_id,
                    'maschan_subscription_end_date',
                    maschan_calculate_new_end_date(null, $plan['duration_days'])
                );
                return rest_ensure_response([
                    'success' => true,
                    'message' => 'Vendor dipindahkan ke Paket Starter UMKM.',
                    'subscription' => maschan_get_vendor_subscription($vendor_id),
                ]);
            }

            return new WP_Error('invalid_mode', "Parameter 'mode' harus 'exempt' atau 'starter'.", ['status' => 400]);
        },
        'permission_callback' => '__return_true',
    ]);
});

// 9. CRON HARIAN: EVALUASI STATUS LANGGANAN VENDOR
// -----------------------------------------------------------------------

// Satu sumber kebenaran untuk daftar role vendor — dipakai di sini DAN di resolver
// wcfmVendors (GraphQL), supaya tidak ada dua definisi yang bisa saling menyimpang
// (ini persis kelas bug yang pernah terjadi: administrator sempat ikut ke-include
// karena role__in di-hardcode terpisah di lebih dari satu tempat).
function maschan_get_vendor_roles() {
    return ['wcfm_vendor', 'seller', 'vendor'];
}

// Daftarkan jadwal cron saat plugin dimuat. Mu-plugin TIDAK punya activation hook
// (register_activation_hook tidak berlaku untuk file di mu-plugins/), jadi cara
// yang benar adalah cek wp_next_scheduled() di 'init' — cek ini murah/cepat dan
// aman dipanggil di setiap request.
add_action('init', function () {
    if (!wp_next_scheduled('maschan_daily_subscription_check')) {
        // Dijadwalkan mulai jam 01:00 waktu server, lalu berulang tiap 24 jam.
        wp_schedule_event(strtotime('tomorrow 01:00:00'), 'daily', 'maschan_daily_subscription_check');
    }
});

add_action('maschan_daily_subscription_check', 'maschan_run_daily_subscription_check');

/**
 * Evaluasi harian status langganan SELURUH vendor. Aturan (sesuai kesepakatan
 * 21 Agustus 2026, dicatat juga di AGENTS.md bagian 4E):
 *
 * - active/renewal_due/trial, H-7 dari end_date  → renewal_due
 * - lewat end_date (masih dalam toleransi 3 hari) → grace_period
 * - lewat toleransi 3 hari TANPA bayar            → auto-downgrade ke
 *   active + free_forever (BUKAN 'expired' — toko TETAP TAMPIL di publik,
 *   cuma kuota produk turun ke 3)
 * - pending_approval                              → TIDAK PERNAH diubah otomatis,
 *   apa pun tanggalnya (Grace Protection Window — vendor sudah bayar, jangan
 *   dirugikan kalau admin telat verifikasi). Kalau sudah lewat toleransi,
 *   invoice-nya cuma ditandai prioritas mendesak untuk admin.
 * - free_forever / vendor exempt / belum pernah punya data langganan → dilewati,
 *   tidak ada yang perlu dievaluasi.
 */
function maschan_run_daily_subscription_check() {
    $vendors = get_users([
        'role__in' => maschan_get_vendor_roles(),
        'fields'   => ['ID'],
    ]);

    $now                = current_time('timestamp');
    $renewal_due_days    = 7;
    $grace_tolerance_days = 3;

    foreach ($vendors as $u) {
        $vendor_id = $u->ID;

        if (maschan_is_subscription_exempt($vendor_id)) continue;

        $status  = get_user_meta($vendor_id, 'maschan_subscription_status', true);
        $end_date = get_user_meta($vendor_id, 'maschan_subscription_end_date', true);
        $plan_id = get_user_meta($vendor_id, 'maschan_plan_id', true);

        // Belum pernah punya data langganan sama sekali (mis. akun sangat lama
        // yang belum sempat dimigrasi) — jangan menebak statusnya, lewati saja.
        if (empty($status) || empty($plan_id)) continue;

        // Paket permanen (end_date kosong, mis. free_forever) tidak pernah kedaluwarsa.
        if (empty($end_date)) continue;

        // Grace Protection Window: pending_approval TIDAK PERNAH auto-transisi.
        if ($status === 'pending_approval') {
            maschan_flag_overdue_pending_invoice($vendor_id, $grace_tolerance_days);
            continue;
        }

        // payment_rejected: vendor harus ambil aksi (upload ulang bukti bayar)
        // untuk keluar dari status ini — cron tidak ikut campur di sini.
        if (!in_array($status, ['active', 'renewal_due', 'grace_period', 'trial'], true)) {
            continue;
        }

        $end_ts = strtotime($end_date);
        if (!$end_ts) continue; // Data tanggal rusak/tidak terbaca — jangan menebak, lewati.

        $grace_end_ts = strtotime("+{$grace_tolerance_days} days", $end_ts);

        if ($now > $grace_end_ts) {
            // Lewat masa tenggang tanpa pembayaran → turun otomatis ke Starter UMKM.
            update_user_meta($vendor_id, 'maschan_subscription_status', 'active');
            update_user_meta($vendor_id, 'maschan_plan_id', 'free_forever');
            update_user_meta($vendor_id, 'maschan_subscription_end_date', null);
        } elseif ($now > $end_ts) {
            if ($status !== 'grace_period') {
                update_user_meta($vendor_id, 'maschan_subscription_status', 'grace_period');
            }
        } elseif (($end_ts - $now) <= ($renewal_due_days * DAY_IN_SECONDS)) {
            if ($status !== 'renewal_due') {
                update_user_meta($vendor_id, 'maschan_subscription_status', 'renewal_due');
            }
        } elseif (in_array($status, ['renewal_due', 'grace_period'], true)) {
            // Masa aktif baru diperpanjang tapi status lama belum sempat kembali normal
            // (jaring pengaman — biasanya endpoint approve sudah langsung set 'active').
            update_user_meta($vendor_id, 'maschan_subscription_status', 'active');
        }
    }
}

/**
 * Tandai invoice yang masih 'waiting_approval' sebagai prioritas mendesak kalau
 * sudah melewati toleransi waktu sejak vendor mengonfirmasi pembayaran (BUKAN
 * dihitung dari subscription_end_date lama — dihitung dari kapan vendor benar-benar
 * mengunggah bukti bayar, via meta 'confirmed_at' yang diisi di endpoint /billing/confirm).
 * Tidak pernah mengubah status vendor — cuma penanda visual untuk admin.
 */
function maschan_flag_overdue_pending_invoice($vendor_id, $tolerance_days) {
    $invoices = get_posts([
        'post_type'      => 'maschan_invoice',
        'author'         => $vendor_id,
        'posts_per_page' => 1,
        'post_status'    => 'publish',
        'orderby'        => 'ID',
        'order'          => 'DESC',
        'meta_query'     => [
            ['key' => 'invoice_status', 'value' => 'waiting_approval'],
        ],
    ]);
    if (empty($invoices)) return;

    $invoice_id  = $invoices[0]->ID;
    $confirmed_at = get_post_meta($invoice_id, 'confirmed_at', true);
    if (empty($confirmed_at)) return; // Data lama sebelum field ini ada — jangan menebak.

    $confirmed_ts = strtotime($confirmed_at);
    if (!$confirmed_ts) return;

    $overdue_ts = strtotime("+{$tolerance_days} days", $confirmed_ts);
    if (current_time('timestamp') > $overdue_ts) {
        update_post_meta($invoice_id, 'admin_priority_flag', 'overdue');
    }
}

// Tampilkan kolom "Prioritas" di daftar wp-admin untuk invoice yang terlambat
// diverifikasi, supaya admin langsung lihat mana yang mendesak tanpa buka satu-satu.
add_filter('manage_maschan_invoice_posts_columns', function ($columns) {
    $columns['maschan_priority'] = 'Prioritas';
    return $columns;
});
add_action('manage_maschan_invoice_posts_custom_column', function ($column, $post_id) {
    if ($column !== 'maschan_priority') return;
    $flag = get_post_meta($post_id, 'admin_priority_flag', true);
    $status = get_post_meta($post_id, 'invoice_status', true);
    if ($flag === 'overdue' && $status === 'waiting_approval') {
        echo '<span style="color:#dc2626;font-weight:600;">⚠ Terlambat diverifikasi</span>';
    }
}, 10, 2);

// 10. ENDPOINT KHUSUS TESTING (admin only) — TIDAK berbahaya untuk data produksi
// (cuma memicu logika yang sama seperti cron biasa / cuma ubah data vendor yang
// eksplisit disebutkan admin), tapi sengaja diberi prefix jelas 'admin/testing/'
// supaya gampang dikenali & dihapus nanti kalau sudah tidak diperlukan.
// -----------------------------------------------------------------------
add_action('rest_api_init', function () {

    // Picu evaluasi cron SEKARANG JUGA, tanpa menunggu jadwal jam 01:00.
    register_rest_route('maschan/v1', '/admin/testing/run-subscription-cron', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $admin_id = maschan_get_authenticated_admin_id($request);
            if (!$admin_id) {
                return new WP_Error('forbidden', 'Hanya Administrator yang boleh menjalankan ini.', ['status' => 403]);
            }
            maschan_run_daily_subscription_check();
            return rest_ensure_response([
                'success' => true,
                'message' => 'Evaluasi cron selesai dijalankan secara manual.',
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

    // Atur langsung status/plan/tanggal langganan vendor tertentu, untuk simulasi
    // skenario testing (mis. "seolah-olah sudah lewat jatuh tempo 5 hari").
    // end_date_offset_days: angka hari relatif dari SEKARANG (boleh negatif = masa lalu).
    // Kosongkan / null untuk paket permanen (mis. free_forever).
    register_rest_route('maschan/v1', '/admin/testing/set-vendor-state', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $admin_id = maschan_get_authenticated_admin_id($request);
            if (!$admin_id) {
                return new WP_Error('forbidden', 'Hanya Administrator yang boleh menjalankan ini.', ['status' => 403]);
            }

            $params    = $request->get_json_params() ?: $request->get_params();
            $vendor_id = intval($params['vendor_id'] ?? 0);
            $status    = sanitize_text_field($params['status'] ?? '');
            $plan_id   = sanitize_text_field($params['plan_id'] ?? '');
            $offset    = $params['end_date_offset_days'] ?? null;

            if (!$vendor_id || !get_userdata($vendor_id)) {
                return new WP_Error('invalid_vendor', 'Vendor tidak ditemukan.', ['status' => 404]);
            }
            if (!in_array($status, ['trial', 'active', 'renewal_due', 'pending_approval', 'payment_rejected', 'grace_period', 'expired'], true)) {
                return new WP_Error('invalid_status', 'Status tidak dikenali.', ['status' => 400]);
            }
            if (!maschan_get_plan($plan_id)) {
                return new WP_Error('invalid_plan', 'plan_id tidak dikenali.', ['status' => 400]);
            }

            $end_date = null;
            if ($offset !== null && $offset !== '') {
                $end_date = date('c', strtotime((intval($offset) >= 0 ? '+' : '') . intval($offset) . ' days', current_time('timestamp')));
            }

            update_user_meta($vendor_id, 'maschan_subscription_status', $status);
            update_user_meta($vendor_id, 'maschan_plan_id', $plan_id);
            update_user_meta($vendor_id, 'maschan_subscription_end_date', $end_date);

            return rest_ensure_response([
                'success' => true,
                'message' => 'Kondisi vendor untuk testing berhasil diatur.',
                'subscription' => maschan_get_vendor_subscription($vendor_id),
            ]);
        },
        'permission_callback' => '__return_true',
    ]);
});


// =======================================================================
// ADMIN UI: CUSTOM COLUMNS & METABOX UNTUK TAGIHAN VENDOR DI WP-ADMIN
// =======================================================================

// 1. Kustomisasi Kolom Tabel Daftar Tagihan
add_filter('manage_maschan_invoice_posts_columns', function($columns) {
    return [
        'cb'                   => $columns['cb'],
        'title'                => 'No. Invoice',
        'vendor_store'         => 'Toko Vendor',
        'plan_info'            => 'Paket & Nominal',
        'sender_account'       => 'Rekening Pengirim',
        'proof_thumbnail'      => 'Bukti Transfer',
        'invoice_status_badge' => 'Status Tagihan',
        'date'                 => 'Tanggal Dibuat',
    ];
});

add_action('manage_maschan_invoice_posts_custom_column', function($column, $post_id) {
    $vendor_id   = (int)get_post_field('post_author', $post_id);
    $vendor_info = maschan_extract_full_vendor($vendor_id);
    $plan_id     = get_post_meta($post_id, 'plan_id', true);
    $plan        = maschan_get_plan($plan_id);
    $amount      = (int)get_post_meta($post_id, 'amount', true);
    $status      = get_post_meta($post_id, 'invoice_status', true) ?: 'unpaid';
    $sender      = get_post_meta($post_id, 'sender_account_name', true) ?: '-';
    $proof_url   = get_post_meta($post_id, 'proof_image_url', true);

    switch ($column) {
        case 'vendor_store':
            echo '<strong>' . esc_html($vendor_info['store_name'] ?? "Vendor #$vendor_id") . '</strong><br>';
            if (!empty($vendor_info['whatsapp_number'])) {
                echo '<a href="https://wa.me/' . esc_attr($vendor_info['whatsapp_number']) . '" target="_blank" style="color:#059669; font-size:11px;">WA: +' . esc_html($vendor_info['whatsapp_number']) . '</a>';
            }
            break;

        case 'plan_info':
            echo '<strong>' . esc_html($plan['name'] ?? $plan_id) . '</strong><br>';
            echo '<span style="color:#093c96; font-weight:bold;">Rp ' . number_format($amount, 0, ',', '.') . '</span>';
            break;

        case 'sender_account':
            echo esc_html($sender);
            break;

        case 'proof_thumbnail':
            if (!empty($proof_url)) {
                echo '<a href="' . esc_url($proof_url) . '" target="_blank" title="Klik untuk memperbesar">';
                echo '<img src="' . esc_url($proof_url) . '" style="width:50px; height:50px; object-fit:cover; border-radius:8px; border:1px solid #cbd5e1;" />';
                echo '</a>';
            } else {
                echo '<span style="color:#94a3b8; font-size:11px;">Belum upload</span>';
            }
            break;

        case 'invoice_status_badge':
            if ($status === 'waiting_approval') {
                echo '<span style="background:#fef08a; color:#854d0e; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:11px;">⏳ Menunggu Verifikasi</span>';
            } elseif ($status === 'approved') {
                echo '<span style="background:#bbf7d0; color:#166534; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:11px;">✓ Disetujui</span>';
            } elseif ($status === 'rejected') {
                echo '<span style="background:#fecdd3; color:#9f1239; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:11px;">✕ Ditolak</span>';
            } else {
                echo '<span style="background:#e2e8f0; color:#475569; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:11px;">Belum Bayar</span>';
            }
            break;
    }
}, 10, 2);

// 2. Tambahkan Meta Box Detail & Tombol Approve/Reject di Halaman Edit Invoice
add_action('add_meta_boxes', function() {
    add_meta_box(
        'maschan_invoice_details_metabox',
        'Rincian Pembayaran & Verifikasi Admin',
        function($post) {
            $vendor_id   = (int)$post->post_author;
            $vendor_info = maschan_extract_full_vendor($vendor_id);
            $plan_id     = get_post_meta($post->ID, 'plan_id', true);
            $plan        = maschan_get_plan($plan_id);
            $amount      = (int)get_post_meta($post->ID, 'amount', true);
            $status      = get_post_meta($post->ID, 'invoice_status', true) ?: 'unpaid';
            $sender      = get_post_meta($post->ID, 'sender_account_name', true) ?: '-';
            $proof_url   = get_post_meta($post->ID, 'proof_image_url', true);
            $reason      = get_post_meta($post->ID, 'rejected_reason', true);

            // Handle Tombol Approve / Reject Langsung dari wp-admin.
            // Hanya Administrator yang boleh (bukan sekadar siapa pun yang bisa buka
            // halaman edit post ini) — CPT masih pakai capability_type standar 'post',
            // jadi pengecekan eksplisit ini WAJIB ada di sini, bukan cuma andalkan nonce.
            if (
                isset($_POST['maschan_admin_action'])
                && check_admin_referer('maschan_invoice_action_nonce')
                && current_user_can('manage_options')
            ) {
                if ($_POST['maschan_admin_action'] === 'approve') {
                    // Panggil fungsi bersama yang SAMA dengan endpoint REST
                    // /admin/billing/approve — termasuk pengecekan idempotensi di
                    // dalamnya, supaya klik dua kali tidak menambah masa aktif dua kali.
                    $result = maschan_approve_invoice($post->ID, get_current_user_id());
                    if ($result['success']) {
                        echo '<div class="notice notice-success is-dismissible"><p><strong>Berhasil!</strong> ' . esc_html($result['message']) . '</p></div>';
                        $status = get_post_meta($post->ID, 'invoice_status', true) ?: $status;
                    } else {
                        echo '<div class="notice notice-error is-dismissible"><p><strong>Gagal:</strong> ' . esc_html($result['message']) . '</p></div>';
                    }
                } elseif ($_POST['maschan_admin_action'] === 'reject') {
                    $reject_msg = sanitize_textarea_field($_POST['maschan_reject_reason'] ?? 'Bukti pembayaran tidak sesuai.');
                    $result     = maschan_reject_invoice($post->ID, $reject_msg);
                    if ($result['success']) {
                        echo '<div class="notice notice-error is-dismissible"><p><strong>Tagihan Ditolak.</strong> Alasan telah dikirimkan ke dashboard vendor.</p></div>';
                        $status = 'rejected';
                        $reason = $reject_msg;
                    } else {
                        echo '<div class="notice notice-error is-dismissible"><p><strong>Gagal:</strong> ' . esc_html($result['message']) . '</p></div>';
                    }
                }
            } elseif (isset($_POST['maschan_admin_action']) && !current_user_can('manage_options')) {
                echo '<div class="notice notice-error is-dismissible"><p><strong>Ditolak:</strong> Hanya Administrator yang boleh melakukan aksi ini.</p></div>';
            }
            ?>
            <table class="form-table" style="max-width: 800px;">
                <tr>
                    <th style="width: 200px;">Toko Vendor</th>
                    <td>
                        <strong><?php echo esc_html($vendor_info['store_name'] ?? "Vendor #$vendor_id"); ?></strong> 
                        (ID: <?php echo esc_html($vendor_id); ?> - <?php echo esc_html($vendor_info['email'] ?? ''); ?>)
                        <?php if (!empty($vendor_info['whatsapp_number'])): ?>
                            <br><a href="https://wa.me/<?php echo esc_attr($vendor_info['whatsapp_number']); ?>" target="_blank" class="button button-small" style="margin-top:4px;">💬 Chat WhatsApp Vendor</a>
                        <?php endif; ?>
                    </td>
                </tr>
                <tr>
                    <th>Paket Langganan</th>
                    <td><strong><?php echo esc_html($plan['name'] ?? $plan_id); ?></strong> — Durasi: <?php echo esc_html($plan['duration_days']); ?> Hari</td>
                </tr>
                <tr>
                    <th>Total Nominal Transfer</th>
                    <td><span style="font-size: 18px; font-weight: bold; color: #093c96;">Rp <?php echo number_format($amount, 0, ',', '.'); ?></span></td>
                </tr>
                <tr>
                    <th>Nama Pemilik Rekening</th>
                    <td><strong><?php echo esc_html($sender); ?></strong></td>
                </tr>
                <tr>
                    <th>Status Saat Ini</th>
                    <td>
                        <?php if ($status === 'waiting_approval'): ?>
                            <span style="background:#fef08a; color:#854d0e; padding:6px 12px; border-radius:6px; font-weight:bold;">⏳ Menunggu Verifikasi Admin</span>
                        <?php elseif ($status === 'approved'): ?>
                            <span style="background:#bbf7d0; color:#166534; padding:6px 12px; border-radius:6px; font-weight:bold;">✓ Pembayaran Telah Disetujui</span>
                        <?php elseif ($status === 'rejected'): ?>
                            <span style="background:#fecdd3; color:#9f1239; padding:6px 12px; border-radius:6px; font-weight:bold;">✕ Pembayaran Ditolak</span>
                            <p style="color:#e11d48; margin-top:4px;"><em>Alasan: "<?php echo esc_html($reason); ?>"</em></p>
                        <?php else: ?>
                            <span style="background:#e2e8f0; color:#475569; padding:6px 12px; border-radius:6px; font-weight:bold;">Belum Ada Bukti Pembayaran</span>
                        <?php endif; ?>
                    </td>
                </tr>
                <tr>
                    <th>Foto Struk Transfer</th>
                    <td>
                        <?php if (!empty($proof_url)): ?>
                            <a href="<?php echo esc_url($proof_url); ?>" target="_blank">
                                <img src="<?php echo esc_url($proof_url); ?>" style="max-width: 320px; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />
                            </a>
                            <p style="font-size: 11px; color: #64748b;">(Klik gambar untuk melihat ukuran penuh)</p>
                        <?php else: ?>
                            <p style="color: #94a3b8;">Vendor belum mengunggah struk pembayaran.</p>
                        <?php endif; ?>
                    </td>
                </tr>
            </table>

            <?php if ($status === 'waiting_approval' || $status === 'unpaid'): ?>
                <hr style="margin: 20px 0;">
                <?php wp_nonce_field('maschan_invoice_action_nonce'); ?>
                <div style="display: flex; gap: 15px; align-items: flex-start;">
                    <div>
                        <button type="submit" name="maschan_admin_action" value="approve" class="button button-primary button-large" style="background:#16a34a; border-color:#15803d;" onclick="return confirm('Apakah Anda yakin ingin menyetujui pembayaran ini dan memperpanjang masa aktif toko?');">
                            ✓ Setujui Pembayaran (Approve)
                        </button>
                    </div>

                    <div style="background: #fff1f2; padding: 12px; border-radius: 8px; border: 1px solid #fecdd3;">
                        <textarea name="maschan_reject_reason" placeholder="Tulis alasan penolakan jika bukti salah..." style="width: 280px; height: 60px;"></textarea><br>
                        <button type="submit" name="maschan_admin_action" value="reject" class="button button-secondary" style="color:#e11d48; border-color:#fda4af; margin-top: 6px;" onclick="return confirm('Tolak pembayaran tagihan ini?');">
                            ✕ Tolak Tagihan (Reject)
                        </button>
                    </div>
                </div>
            <?php endif; ?>
            <?php
        },
        'maschan_invoice',
        'normal',
        'high'
    );
});