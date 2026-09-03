<?php
/**
 * Plugin Name: Mas Chan Digital - Headless Marketplace Engine (JWT Universal Bypass & Vacation Fix)
 * Description: Engine REST API & GraphQL terverifikasi untuk Marketplace Kota Serang (Bypass Signature verification conflict, Base64URL JWT, Instant Vacation Toggle).
 * Author: Mas Chan Digital
 * Version: 14.3.1
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. CORS Headers + Cache Bypass untuk endpoint maschan/v1
add_action('init', function () {
    $req_uri = $_SERVER['REQUEST_URI'] ?? '';
    $is_maschan_endpoint = strpos($req_uri, '/wp-json/maschan/v1/') !== false;

    if ($is_maschan_endpoint) {
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

// 2. Secret Key Resolver
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
        $fallback_expected = base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
        $valid = hash_equals($fallback_expected, $signature);
    }

    if (!$valid) return false;

    $data = json_decode(maschan_base64url_decode($payload), true);
    if (!$data || !isset($data['exp']) || $data['exp'] < time()) return false;

    return $data['data']['user']['id'] ?? ($data['user']['id'] ?? false);
}

// 5. Bypass Error REST Auth
add_filter('rest_authentication_errors', function ($error) {
    if (is_wp_error($error)) {
        $req_uri = $_SERVER['REQUEST_URI'] ?? '';
        if (strpos($req_uri, '/maschan/v1/') !== false) {
            return null;
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

    $raw_social = get_user_meta($user_id, 'wcfm_store_social', true);
    if (!is_array($raw_social)) $raw_social = [];

    $socials = [
        'instagram' => $raw_social['instagram'] ?? ($wcfm['social']['instagram'] ?? ''),
        'tiktok'    => $raw_social['tiktok'] ?? ($wcfm['social']['tiktok'] ?? ''),
        'facebook'  => $raw_social['fb'] ?? ($raw_social['facebook'] ?? ($wcfm['social']['fb'] ?? ($wcfm['social']['facebook'] ?? ''))),
        'youtube'   => $raw_social['youtube'] ?? ($wcfm['social']['youtube'] ?? ''),
        'website'   => $raw_social['website'] ?? ($wcfm['social']['website'] ?? ($user->user_url ?: '')),
    ];

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

    $store_seo = [
        'seoTitle'        => get_user_meta($user_id, 'wcfm_store_seo_title', true) ?: (get_user_meta($user_id, 'wcfmmp_seo_meta_title', true) ?: ($wcfm['store_seo']['wcfmmp_seo_meta_title'] ?? '')),
        'metaDescription' => get_user_meta($user_id, 'wcfm_store_seo_meta_desc', true) ?: (get_user_meta($user_id, 'wcfmmp_seo_meta_desc', true) ?: ($wcfm['store_seo']['wcfmmp_seo_meta_desc'] ?? '')),
        'metaKeywords'    => get_user_meta($user_id, 'wcfm_store_seo_meta_keywords', true) ?: (get_user_meta($user_id, 'wcfmmp_seo_meta_keywords', true) ?: ($wcfm['store_seo']['wcfmmp_seo_meta_keywords'] ?? '')),
    ];

    // Integrasi Live Chat Tawk.to per-vendor (opsional, "Zero Silent Fallback"):
    // `enabled` DIHITUNG di sini, bukan pass-through toggle mentah dari DB — supaya
    // kalau vendor centang "aktifkan" tapi lupa isi salah satu ID, frontend tidak
    // pernah menerima enabled:true dengan ID kosong (yang bisa bikin widget Tawk.to
    // gagal senyap / salah sambung ke chat vendor lain).
    $tawkto_property_id = get_user_meta($user_id, 'maschan_tawkto_property_id', true) ?: '';
    $tawkto_widget_id   = get_user_meta($user_id, 'maschan_tawkto_widget_id', true) ?: '';
    $tawkto_raw_enabled = get_user_meta($user_id, 'maschan_tawkto_enabled', true) === 'yes';

    $chat_integration = [
        'enabled'     => $tawkto_raw_enabled && !empty($tawkto_property_id) && !empty($tawkto_widget_id),
        'property_id' => $tawkto_property_id,
        'widget_id'   => $tawkto_widget_id,
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
        'views_count'       => (int) (get_user_meta($user_id, '_wcfm_store_views', true) ?: get_user_meta($user_id, 'wcfm_store_views', true) ?: 0),
        'joined_date'       => date('Y-m-d', strtotime($user->user_registered)),
        'socials'           => $socials,
        'store_hours'       => $store_hours,
        'vacation_mode'     => $vacation_mode,
        'store_seo'         => $store_seo,
        'chat_integration'  => $chat_integration,
    ];
}

/**
 * Resolve array `images` dari request (index 0 = foto utama, sisanya = galeri)
 * jadi daftar attachment ID WordPress. Diterima dalam bentuk {id} ATAU {src}
 * (URL Media Library) — sama seperti pola resolve image_id yang sudah ada.
 * SATU-SATUNYA tempat logika ini boleh berada — dipakai CREATE & UPDATE product,
 * supaya tidak ada dua definisi berbeda yang bisa menyimpang.
 */
function maschan_resolve_gallery_ids($images) {
    if (empty($images) || !is_array($images)) return [];

    $ids = [];
    foreach ($images as $idx => $img) {
        if ($idx === 0) continue; // index 0 = foto utama, bukan bagian galeri
        if (!empty($img['id'])) {
            $ids[] = intval($img['id']);
        } elseif (!empty($img['src'])) {
            $resolved = attachment_url_to_postid($img['src']);
            if ($resolved) $ids[] = $resolved;
        }
    }
    return array_values(array_unique(array_filter($ids)));
}

/**
 * Simpan galeri ke produk WooCommerce. $images bisa null (field tidak dikirim
 * sama sekali — biarkan galeri lama apa adanya, jangan dianggap "kosongkan"),
 * atau array (termasuk array kosong `[]` — artinya vendor sengaja menghapus
 * semua galeri, HARUS ditulis sebagai galeri kosong, bukan diabaikan).
 */
function maschan_save_product_gallery($post_id, $images) {
    if ($images === null) return; // field tidak dikirim — jangan sentuh galeri yang sudah ada

    $gallery_ids = maschan_resolve_gallery_ids($images);
    update_post_meta($post_id, '_product_image_gallery', implode(',', $gallery_ids));

    $wc_product = wc_get_product($post_id);
    if ($wc_product) {
        $wc_product->set_gallery_image_ids($gallery_ids);
        $wc_product->save();
    }
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
        'views_count'       => (int) get_post_meta($product_id, 'wcfm_product_views', true),
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
function maschan_get_subscription_plans() {
    return [
        'free_forever' => [
            'name'          => 'Paket Starter UMKM',
            'duration_days' => -1,
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
            'max_products'  => -1,
        ],
        'annual_1y' => [
            'name'          => 'Paket 1 Tahun',
            'duration_days' => 365,
            'price'         => 280000,
            'max_products'  => -1,
        ],
    ];
}

function maschan_get_plan($plan_id) {
    $plans = maschan_get_subscription_plans();
    return $plans[$plan_id] ?? null;
}

function maschan_is_subscription_exempt($user_id) {
    return get_user_meta($user_id, 'maschan_subscription_exempt', true) === 'yes';
}

function maschan_subscription_statuses_can_add_product() {
    return ['trial', 'active', 'renewal_due', 'pending_approval'];
}

function maschan_subscription_closes_store($user_id) {
    if (maschan_is_subscription_exempt($user_id)) return false;
    $status = get_user_meta($user_id, 'maschan_subscription_status', true);
    return $status === 'expired';
}

function maschan_get_vendor_subscription($user_id) {
    $products_count = (int)(new WP_Query([
        'post_type'      => 'product',
        'author'         => $user_id,
        'post_status'    => ['publish', 'draft'],
        'posts_per_page' => -1,
        'fields'         => 'ids',
    ]))->found_posts;

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
        return null;
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

function maschan_calculate_new_end_date($current_end_date, $duration_days) {
    if ($duration_days === -1) {
        return null;
    }
    $now = current_time('timestamp');
    $current_ts = !empty($current_end_date) ? strtotime($current_end_date) : 0;
    $base_ts = max($now, $current_ts);
    return date('c', strtotime("+{$duration_days} days", $base_ts));
}

/**
 * Beri nomor invoice format INV-000123 (berdasarkan post ID) setelah post
 * dibuat. SATU-SATUNYA tempat logika penomoran ini boleh berada — dipanggil
 * di setiap titik pembuatan invoice, supaya tidak ada invoice yang tertinggal
 * dengan judul generic "Invoice (draft)".
 */
function maschan_assign_invoice_number($post_id) {
    wp_update_post([
        'ID'         => $post_id,
        'post_title' => 'INV-' . str_pad($post_id, 6, '0', STR_PAD_LEFT),
    ]);
}

// =======================================================================
// 5C. CUSTOM POST TYPE: maschan_invoice
// =======================================================================
add_action('init', function () {
    register_post_type('maschan_invoice', [
        'labels' => [
            'name'               => 'Tagihan Langganan',
            'singular_name'      => 'Tagihan Langganan',
            'menu_name'          => 'Tagihan Langganan',
            'all_items'          => 'Semua Tagihan Vendor',
            'add_new'            => 'Tambah Tagihan',
            'add_new_item'       => 'Tambah Tagihan Baru',
            'edit_item'          => 'Rincian & Verifikasi Tagihan',
            'view_item'          => 'Lihat Tagihan',
            'search_items'       => 'Cari Tagihan',
            'not_found'          => 'Tidak ada tagihan ditemukan.',
            'not_found_in_trash' => 'Tidak ada tagihan di kotak sampah.',
        ],
        'public'          => false,
        'show_ui'         => true,
        'show_in_menu'    => true,
        'menu_position'   => 26,
        'menu_icon'       => 'dashicons-money-alt',
        'supports'        => ['title', 'author', 'custom-fields'],
        'capability_type' => 'post',
        'map_meta_cap'    => true,
    ]);
});

add_action('admin_init', function () {
    global $pagenow;
    if (in_array($pagenow, ['edit.php', 'post.php', 'post-new.php'], true)) {
        $post_type = $_GET['post_type'] ?? (isset($_GET['post']) ? get_post_type($_GET['post']) : '');
        if ($post_type === 'maschan_invoice' && !current_user_can('manage_options')) {
            wp_die('Akses ditolak: Hanya Administrator yang berhak mengelola tagihan langganan vendor.');
        }
    }
});

function maschan_invoice_valid_statuses() {
    return ['unpaid', 'waiting_approval', 'approved', 'rejected', 'cancelled'];
}

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

function maschan_approve_invoice($invoice_id, $admin_id) {
    $post = get_post($invoice_id);
    if (!$post || $post->post_type !== 'maschan_invoice') {
        return ['success' => false, 'message' => 'Tagihan tidak ditemukan.', 'invoice' => null, 'subscription' => null];
    }

    if (get_post_meta($invoice_id, 'invoice_status', true) === 'approved') {
        return [
            'success' => true,
            'message' => 'Tagihan ini sudah disetujui sebelumnya.',
            'invoice' => maschan_format_invoice($invoice_id),
            'subscription' => null,
        ];
    }

    $vendor_id = (int)$post->post_author;
    $plan_id   = get_post_meta($invoice_id, 'plan_id', true);
    $plan      = maschan_get_plan($plan_id);
    if (!$plan) {
        return ['success' => false, 'message' => 'Paket pada tagihan ini tidak dikenali.', 'invoice' => null, 'subscription' => null];
    }

    $current_end_date = get_user_meta($vendor_id, 'maschan_subscription_end_date', true);
    $new_end_date     = maschan_calculate_new_end_date($current_end_date, $plan['duration_days']);

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

function maschan_reject_invoice($invoice_id, $reason) {
    $post = get_post($invoice_id);
    if (!$post || $post->post_type !== 'maschan_invoice') {
        return ['success' => false, 'message' => 'Tagihan tidak ditemukan.', 'invoice' => null];
    }

    if (empty($reason)) {
        $reason = 'Dibatalkan oleh Administrator.';
    }

    $current_status = get_post_meta($invoice_id, 'invoice_status', true) ?: 'unpaid';
    
    if (!in_array($current_status, ['unpaid', 'waiting_approval'], true)) {
        return ['success' => false, 'message' => 'Tagihan ini sudah diproses atau disetujui sebelumnya.', 'invoice' => null];
    }

    $vendor_id = (int)$post->post_author;

    update_post_meta($invoice_id, 'invoice_status', 'rejected');
    update_post_meta($invoice_id, 'rejected_reason', $reason);

    $vendor_sub_status = get_user_meta($vendor_id, 'maschan_subscription_status', true);
    if ($vendor_sub_status === 'pending_approval') {
        update_user_meta($vendor_id, 'maschan_subscription_status', 'payment_rejected');
    }

    return [
        'success' => true,
        'message' => 'Tagihan berhasil ditolak/dibatalkan.',
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

    register_graphql_object_type('ChatIntegrationInfo', [
        'fields' => [
            'enabled'    => ['type' => 'Boolean'],
            'propertyId' => ['type' => 'String'],
            'widgetId'   => ['type' => 'String'],
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
            'subscriptionExpired' => ['type' => 'Boolean'],
            'storeSeo'         => ['type' => 'StoreSEOInfo'],
            'chatIntegration'  => ['type' => 'ChatIntegrationInfo'],
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
                    'chatIntegration'  => [
                        'enabled'    => $v['chat_integration']['enabled'],
                        'propertyId' => $v['chat_integration']['property_id'],
                        'widgetId'   => $v['chat_integration']['widget_id'],
                    ],
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
                            'chatIntegration'  => [
                                'enabled'    => $v['chat_integration']['enabled'],
                                'propertyId' => $v['chat_integration']['property_id'],
                                'widgetId'   => $v['chat_integration']['widget_id'],
                            ],
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

    // LOGIN (BULLETPROOF EMAIL & USERNAME RESOLVER)
    register_rest_route('maschan/v1', '/auth/login', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $params    = $request->get_json_params() ?: $request->get_params();
            $raw_login = trim($params['username'] ?? ($params['email'] ?? ''));
            $password  = (string)($params['password'] ?? '');

            if (empty($raw_login) || empty($password)) {
                return new WP_Error('missing_credentials', 'Email/Username dan Password wajib diisi.', ['status' => 400]);
            }

            // 1. Cari user di database via Email atau Username
            $user = null;
            if (is_email($raw_login)) {
                $user = get_user_by('email', $raw_login);
            }
            if (!$user) {
                $user = get_user_by('login', $raw_login);
            }
            if (!$user) {
                $user = get_user_by('slug', sanitize_title($raw_login));
            }

            // 2. Verifikasi Password secara aman
            if ($user && wp_check_password($password, $user->user_pass, $user->ID)) {
                // Password cocok!
            } else {
                // Fallback verifikasi standard
                $auth_user = wp_authenticate($raw_login, $password);
                if (is_wp_error($auth_user)) {
                    return new WP_Error('invalid_login', 'Email/Username atau Password salah. Silakan periksa kembali.', ['status' => 401]);
                }
                $user = $auth_user;
            }

            // 3. Terbitkan Token JWT & Profil Toko Vendor
            $token       = maschan_generate_jwt($user->ID);
            $vendor_info = maschan_extract_full_vendor($user->ID);

            return rest_ensure_response([
                'success' => true,
                'token'   => $token,
                'user'    => [
                    'id'          => (int)$user->ID,
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

            update_user_meta($user_id, 'maschan_subscription_status', 'active');
            update_user_meta($user_id, 'maschan_plan_id', 'free_forever');
            update_user_meta($user_id, 'maschan_subscription_end_date', null);

            $token       = maschan_generate_jwt($user_id);
            $full_vendor = maschan_extract_full_vendor($user_id);

            if ($full_vendor) {
                maschan_email_vendor_welcome($full_vendor);
                maschan_email_admin_new_vendor($full_vendor);
            }
            maschan_add_subscriber_to_list($email, (!empty($owner_name) ? $owner_name : $store_name), $clean_phone, '', $store_name);

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

    // GET CATEGORIES
    register_rest_route('maschan/v1', '/categories', [
        'methods'  => 'GET',
        'callback' => function () {
            $terms = get_terms([
                'taxonomy'   => 'product_cat',
                'hide_empty' => false,
            ]);
            if (is_wp_error($terms)) {
                return rest_ensure_response([]);
            }

            $excluded_slugs = ['uncategorized', 'tanpa-kategori'];

            $result = [];
            foreach ($terms as $term) {
                if (in_array($term->slug, $excluded_slugs, true)) continue;
                $result[] = [
                    'id'     => (int)$term->term_id,
                    'name'   => $term->name,
                    'slug'   => $term->slug,
                    'count'  => (int)$term->count,
                    'parent' => (int)$term->parent,
                ];
            }

            return rest_ensure_response($result);
        },
        'permission_callback' => '__return_true',
    ]);

    // CREATE CATEGORY
    register_rest_route('maschan/v1', '/categories', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $vendor_id = maschan_get_current_user_from_request($request);
            if (!$vendor_id) {
                return new WP_Error('unauthenticated', 'Sesi login tidak valid atau kedaluwarsa.', ['status' => 401]);
            }

            $params = $request->get_json_params() ?: $request->get_params();
            $name   = sanitize_text_field($params['name'] ?? '');
            $parent = intval($params['parent'] ?? 0);

            if (empty($name)) {
                return new WP_Error('missing_name', 'Nama kategori wajib diisi.', ['status' => 400]);
            }

            $result = wp_insert_term($name, 'product_cat', ['parent' => $parent]);

            if (is_wp_error($result) && $result->get_error_code() === 'term_exists') {
                $existing_id = $result->get_error_data();
                $term = get_term($existing_id, 'product_cat');
                return rest_ensure_response([
                    'success'  => true,
                    'category' => [
                        'id' => (int)$term->term_id, 'name' => $term->name,
                        'slug' => $term->slug, 'parent' => (int)$term->parent,
                    ],
                ]);
            }
            if (is_wp_error($result)) {
                return new WP_Error('create_failed', $result->get_error_message(), ['status' => 400]);
            }

            $term = get_term($result['term_id'], 'product_cat');
            return rest_ensure_response([
                'success'  => true,
                'category' => [
                    'id' => (int)$term->term_id, 'name' => $term->name,
                    'slug' => $term->slug, 'parent' => (int)$term->parent,
                ],
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

    // UPLOAD MEDIA
    register_rest_route('maschan/v1', '/media/upload', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $vendor_id = maschan_get_current_user_from_request($request);
            if (!$vendor_id) {
                return new WP_Error('unauthenticated', 'Sesi login tidak valid atau kedaluwarsa.', ['status' => 401]);
            }

            if (empty($_FILES['file'])) {
                return new WP_Error('missing_file', 'Tidak ada file yang diunggah.', ['status' => 400]);
            }

            $file = $_FILES['file'];
            $allowed_types = ['image/jpeg', 'image/png', 'image/webp'];
            if (!in_array($file['type'], $allowed_types, true)) {
                return new WP_Error('invalid_type', 'Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.', ['status' => 400]);
            }
            $max_size = 5 * 1024 * 1024;
            if ($file['size'] > $max_size) {
                return new WP_Error('file_too_large', 'Ukuran file maksimal 5MB.', ['status' => 400]);
            }

            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/image.php';
            require_once ABSPATH . 'wp-admin/includes/media.php';

            $attachment_id = media_handle_upload('file', 0);
            if (is_wp_error($attachment_id)) {
                return new WP_Error('upload_failed', $attachment_id->get_error_message(), ['status' => 500]);
            }

            update_post_meta($attachment_id, 'uploaded_by_vendor', $vendor_id);

            return rest_ensure_response([
                'success' => true,
                'id'      => $attachment_id,
                'url'     => wp_get_attachment_url($attachment_id),
            ]);
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

            maschan_save_product_gallery($post_id, $params['images'] ?? null);

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

            maschan_save_product_gallery($post_id, $params['images'] ?? null);

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
    
    // ENDPOINT REKAM TAYANGAN PRODUK (WCFM VIEWS TRACKER)
    register_rest_route('maschan/v1', '/products/(?P<id>\d+)/view', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $product_id = (int)$request['id'];
            if (!$product_id || get_post_type($product_id) !== 'product') {
                return new WP_Error('invalid_product', 'Produk tidak ditemukan.', ['status' => 404]);
            }

            // 1. Tambah +1 pada meta wcfm_product_views
            $views = (int) get_post_meta($product_id, 'wcfm_product_views', true);
            $new_views = $views + 1;
            update_post_meta($product_id, 'wcfm_product_views', $new_views);

            // 2. Tambah juga +1 pada total tayangan toko vendor di usermeta WCFM
            $author_id = (int) get_post_field('post_author', $product_id);
            if ($author_id > 0) {
                $vendor_views = (int) (get_user_meta($author_id, '_wcfm_store_views', true) ?: 0);
                update_user_meta($author_id, '_wcfm_store_views', $vendor_views + 1);
            }

            return rest_ensure_response([
                'success'     => true,
                'views_count' => $new_views,
            ]);
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

    // UPDATE VENDOR FULL SETTINGS
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

            if (isset($params['avatar'])) {
                $wcfm['gravatar'] = esc_url_raw($params['avatar']);
                update_user_meta($user_id, 'wcfmmp_avatar', esc_url_raw($params['avatar']));
            }
            if (isset($params['banner'])) {
                $wcfm['banner'] = esc_url_raw($params['banner']);
                update_user_meta($user_id, 'wcfmmp_banner', esc_url_raw($params['banner']));
            }

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

            // Integrasi Live Chat Tawk.to (opsional, per-vendor). Simpan APA ADANYA
            // yang dikirim vendor (termasuk toggle 'enabled' mentahnya) — perhitungan
            // "enabled sungguhan" (harus ada Property ID + Widget ID juga) dilakukan
            // di maschan_extract_full_vendor() saat data ini DIBACA, bukan di sini.
            if (isset($params['chat_integration']) && is_array($params['chat_integration'])) {
                $tawkto_enabled     = !empty($params['chat_integration']['enabled']) ? 'yes' : 'no';
                $tawkto_property_id = sanitize_text_field($params['chat_integration']['property_id'] ?? '');
                $tawkto_widget_id   = sanitize_text_field($params['chat_integration']['widget_id'] ?? '');

                update_user_meta($user_id, 'maschan_tawkto_enabled', $tawkto_enabled);
                update_user_meta($user_id, 'maschan_tawkto_property_id', $tawkto_property_id);
                update_user_meta($user_id, 'maschan_tawkto_widget_id', $tawkto_widget_id);
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

    // 8. BILLING / SUBSCRIPTION REST API ENDPOINTS
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

            if ((int)$plan['price'] === 0) {
                $current_end_date = get_user_meta($vendor_id, 'maschan_subscription_end_date', true);
                $new_end_date = maschan_calculate_new_end_date($current_end_date, $plan['duration_days']);

                update_user_meta($vendor_id, 'maschan_subscription_status', 'active');
                update_user_meta($vendor_id, 'maschan_subscription_end_date', $new_end_date);
                update_user_meta($vendor_id, 'maschan_plan_id', $plan_id);

                $post_id = wp_insert_post([
                    'post_type'   => 'maschan_invoice',
                    'post_title'  => 'Invoice (draft)',
                    'post_status' => 'publish',
                    'post_author' => $vendor_id,
                ]);
                if (is_wp_error($post_id)) return $post_id;
                maschan_assign_invoice_number($post_id);

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

            $post_id = wp_insert_post([
                'post_type'   => 'maschan_invoice',
                'post_title'  => 'Invoice (draft)',
                'post_status' => 'publish',
                'post_author' => $vendor_id,
            ]);
            if (is_wp_error($post_id)) return $post_id;
            maschan_assign_invoice_number($post_id);

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

    // CANCEL INVOICE (BATAL PILIH PAKET OLEH VENDOR)
    register_rest_route('maschan/v1', '/billing/cancel', [
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
            if ((int)$post->post_author !== $vendor_id) {
                return new WP_Error('forbidden', 'Tagihan ini bukan milik akun Anda.', ['status' => 403]);
            }

            // Tandai sebagai cancelled
            update_post_meta($invoice_id, 'invoice_status', 'cancelled');
            update_post_meta($invoice_id, 'rejected_reason', 'Dibatalkan oleh vendor (batal pilih paket).');

            $vendor_sub_status = get_user_meta($vendor_id, 'maschan_subscription_status', true);
            if ($vendor_sub_status === 'pending_approval') {
                // JANGAN biarkan status vendor "nyangkut" di pending_approval setelah
                // dibatalkan sendiri. Set 'active' dulu sebagai kondisi netral yang bisa
                // dievaluasi ulang, lalu maschan_recompute_vendor_status() akan menghitung
                // status SEBENARNYA (bisa tetap active, atau turun ke renewal_due/
                // grace_period/free_forever) berdasarkan tanggal sungguhan — bukan
                // ditebak atau dipaksa 'active' begitu saja.
                update_user_meta($vendor_id, 'maschan_subscription_status', 'active');
                maschan_recompute_vendor_status($vendor_id);
            }

            return rest_ensure_response([
                'success' => true,
                'message' => 'Tagihan berhasil dibatalkan. Silakan pilih paket baru di bawah.',
                'invoice' => maschan_format_invoice($invoice_id),
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

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
            delete_post_meta($invoice_id, 'rejected_reason');
            delete_post_meta($invoice_id, 'admin_priority_flag');

            update_user_meta($vendor_id, 'maschan_subscription_status', 'pending_approval');

            return rest_ensure_response([
                'success' => true,
                'message' => 'Bukti pembayaran berhasil dikirim. Menunggu verifikasi Admin.',
                'invoice' => maschan_format_invoice($invoice_id),
            ]);
        },
        'permission_callback' => '__return_true',
    ]);

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

    register_rest_route('maschan/v1', '/admin/billing/migrate-legacy-vendor', [
        'methods'  => 'POST',
        'callback' => function ($request) {
            $admin_id = maschan_get_authenticated_admin_id($request);
            if (!$admin_id) {
                return new WP_Error('forbidden', 'Hanya Administrator yang boleh menjalankan migrasi ini.', ['status' => 403]);
            }

            $params    = $request->get_json_params() ?: $request->get_params();
            $vendor_id = intval($params['vendor_id'] ?? 0);
            $mode      = sanitize_text_field($params['mode'] ?? '');

            if (!$vendor_id) {
                return new WP_Error('missing_vendor_id', "Parameter 'vendor_id' wajib diisi.", ['status' => 400]);
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
                update_user_meta($vendor_id, 'maschan_subscription_end_date', null);
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

    // DIAGNOSTIK / TEST MAILKETING
    register_rest_route('maschan/v1', '/debug/test-mailketing', [
        'methods'             => 'GET',
        'callback'            => function ($request) {
            $to_email = sanitize_email($request->get_param('email') ?: 'admin@maschandigital.id');
            $action   = sanitize_text_field($request->get_param('action') ?: 'all'); // 'send', 'addsub', 'all'

            $results = [
                'success'        => true,
                'timestamp'      => current_time('mysql'),
                'api_token_set'  => !empty(maschan_mailketing_api_token()),
                'vendor_list_id' => maschan_mailketing_vendor_list_id(),
                'sender'         => maschan_mailketing_sender(),
                'target_email'   => $to_email,
                'tests'          => [],
            ];

            if ($action === 'send' || $action === 'all') {
                $test_html = '<h3>Uji Coba Mailketing Mas Chan Digital</h3><p>Ini adalah email pengujian diagnostik integrasi Mailketing API v1.</p>';
                $send_res = maschan_send_mailketing_email(
                    $to_email,
                    'Tester Mas Chan',
                    '[Diagnostik] Uji Coba Mailketing Mas Chan Digital',
                    maschan_email_shell('Uji coba diagnostik Mailketing API v1', $test_html)
                );
                $results['tests']['send_email'] = $send_res;
            }

            if ($action === 'addsub' || $action === 'all') {
                $sub_res = maschan_add_subscriber_to_list(
                    $to_email,
                    'Tester Mas Chan',
                    '082298148474',
                    '082298148474',
                    'Toko Uji Coba'
                );
                if (is_wp_error($sub_res)) {
                    $results['tests']['add_subscriber'] = [
                        'success' => false,
                        'error'   => $sub_res->get_error_message(),
                    ];
                } elseif (is_array($sub_res)) {
                    $code = wp_remote_retrieve_response_code($sub_res);
                    $body = wp_remote_retrieve_body($sub_res);
                    $results['tests']['add_subscriber'] = [
                        'status_code' => $code,
                        'response'    => json_decode($body, true) ?: $body,
                    ];
                } else {
                    $results['tests']['add_subscriber'] = $sub_res;
                }
            }

            return rest_ensure_response($results);
        },
        'permission_callback' => '__return_true',
    ]);
});

// 9. CRON HARIAN: EVALUASI STATUS LANGGANAN VENDOR
function maschan_get_vendor_roles() {
    return ['wcfm_vendor', 'seller', 'vendor'];
}

add_action('init', function () {
    if (!wp_next_scheduled('maschan_daily_subscription_check')) {
        wp_schedule_event(strtotime('tomorrow 01:00:00'), 'daily', 'maschan_daily_subscription_check');
    }
});

add_action('maschan_daily_subscription_check', 'maschan_run_daily_subscription_check');

/**
 * Evaluasi & perbaiki status SATU vendor berdasarkan tanggal saat ini —
 * logika PERSIS yang dipakai cron harian, diekstrak jadi fungsi tersendiri
 * supaya bisa dipanggil ulang di luar loop cron (mis. saat vendor membatalkan
 * invoice dan status perlu "dikembalikan" ke kondisi yang benar-benar sesuai
 * tanggal — BUKAN ditebak/dipaksa 'active' begitu saja).
 * Tidak melakukan apa pun untuk vendor exempt, paket permanen, atau status
 * yang tidak relevan dievaluasi tanggal (pending_approval, payment_rejected).
 */
function maschan_recompute_vendor_status($vendor_id) {
    if (maschan_is_subscription_exempt($vendor_id)) return;

    $status   = get_user_meta($vendor_id, 'maschan_subscription_status', true);
    $end_date = get_user_meta($vendor_id, 'maschan_subscription_end_date', true);
    $plan_id  = get_user_meta($vendor_id, 'maschan_plan_id', true);

    if (empty($status) || empty($plan_id)) return;
    if (empty($end_date)) return; // paket permanen, tidak ada yang perlu dievaluasi

    if (!in_array($status, ['active', 'renewal_due', 'grace_period', 'trial'], true)) {
        return; // pending_approval/payment_rejected butuh aksi eksplisit, bukan evaluasi tanggal
    }

    $now = current_time('timestamp');
    $renewal_due_days = 7;
    $grace_tolerance_days = 3;

    $end_ts = strtotime($end_date);
    if (!$end_ts) return;

    $grace_end_ts = strtotime("+{$grace_tolerance_days} days", $end_ts);

    if ($now > $grace_end_ts) {
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
        update_user_meta($vendor_id, 'maschan_subscription_status', 'active');
    }
}

function maschan_run_daily_subscription_check() {
    $vendors = get_users([
        'role__in' => maschan_get_vendor_roles(),
        'fields'   => ['ID'],
    ]);

    $grace_tolerance_days = 3;

    foreach ($vendors as $u) {
        $vendor_id = $u->ID;

        if (maschan_is_subscription_exempt($vendor_id)) continue;

        $status = get_user_meta($vendor_id, 'maschan_subscription_status', true);

        if ($status === 'pending_approval') {
            maschan_flag_overdue_pending_invoice($vendor_id, $grace_tolerance_days);
            continue;
        }

        maschan_recompute_vendor_status($vendor_id);
    }
}

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

    $invoice_id   = $invoices[0]->ID;
    $confirmed_at = get_post_meta($invoice_id, 'confirmed_at', true);
    if (empty($confirmed_at)) return;

    $confirmed_ts = strtotime($confirmed_at);
    if (!$confirmed_ts) return;

    $overdue_ts = strtotime("+{$tolerance_days} days", $confirmed_ts);
    if (current_time('timestamp') > $overdue_ts) {
        update_post_meta($invoice_id, 'admin_priority_flag', 'overdue');
    }
}

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

// =======================================================================
// ADMIN UI: CUSTOM COLUMNS & METABOX UNTUK TAGIHAN VENDOR DI WP-ADMIN
// =======================================================================
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
            } elseif ($status === 'cancelled') {
                echo '<span style="background:#f1f5f9; color:#475569; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:11px;">✕ Dibatalkan</span>';
            } elseif ($status === 'rejected') {
                echo '<span style="background:#fecdd3; color:#9f1239; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:11px;">✕ Ditolak</span>';
            } else {
                echo '<span style="background:#e2e8f0; color:#475569; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:11px;">Belum Bayar</span>';
            }
            break;
    }
}, 10, 2);

// =======================================================================
// EKSEKUSI AKSI ADMIN: save_post_maschan_invoice
// =======================================================================
add_action('save_post_maschan_invoice', function($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('manage_options')) {
        return;
    }

    if (
        !isset($_POST['maschan_invoice_nonce_field']) ||
        !wp_verify_nonce($_POST['maschan_invoice_nonce_field'], 'maschan_invoice_action_nonce')
    ) {
        return;
    }

    if (isset($_POST['maschan_admin_action'])) {
        $action = sanitize_text_field($_POST['maschan_admin_action']);

        if ($action === 'approve') {
            maschan_approve_invoice($post_id, get_current_user_id());
        } elseif ($action === 'reject') {
            $reject_msg = sanitize_textarea_field($_POST['maschan_reject_reason'] ?? '');
            if (empty($reject_msg)) {
                $reject_msg = 'Dibatalkan oleh Administrator karena tidak ada pembayaran.';
            }
            maschan_reject_invoice($post_id, $reject_msg);
        }
    }
}, 10, 1);

// Meta Box Render
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
                        <?php elseif ($status === 'cancelled'): ?>
                            <span style="background:#f1f5f9; color:#475569; padding:6px 12px; border-radius:6px; font-weight:bold;">✕ Tagihan Dibatalkan oleh Vendor</span>
                        <?php elseif ($status === 'rejected'): ?>
                            <span style="background:#fecdd3; color:#9f1239; padding:6px 12px; border-radius:6px; font-weight:bold;">✕ Tagihan Ditolak Admin</span>
                            <p style="color:#e11d48; margin-top:4px;"><em>Alasan: "<?php echo esc_html($reason ?: 'Ditolak oleh Administrator.'); ?>"</em></p>
                        <?php else: ?>
                            <span style="background:#e2e8f0; color:#475569; padding:6px 12px; border-radius:6px; font-weight:bold;">Belum Ada Bukti Pembayaran (Unpaid)</span>
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
                <?php wp_nonce_field('maschan_invoice_action_nonce', 'maschan_invoice_nonce_field'); ?>
                <div style="display: flex; gap: 15px; align-items: flex-start; flex-wrap: wrap;">
                    <?php if ($status === 'waiting_approval'): ?>
                        <div>
                            <button type="submit" name="maschan_admin_action" value="approve" class="button button-primary button-large" style="background:#16a34a; border-color:#15803d;" onclick="return confirm('Apakah Anda yakin ingin menyetujui pembayaran ini dan memperpanjang masa aktif toko?');">
                                ✓ Setujui Pembayaran (Approve)
                            </button>
                        </div>
                    <?php endif; ?>

                    <div style="background: #fff1f2; padding: 12px; border-radius: 8px; border: 1px solid #fecdd3;">
                        <label style="font-size:11px; font-weight:bold; color:#9f1239; display:block; margin-bottom:4px;">Alasan Penolakan Tagihan:</label>
                        <textarea name="maschan_reject_reason" placeholder="Contoh: Ditolak karena bukti pembayaran tidak valid..." style="width: 300px; height: 60px;"></textarea><br>
                        <button type="submit" name="maschan_admin_action" value="reject" class="button button-secondary" style="color:#e11d48; border-color:#fda4af; margin-top: 6px;" onclick="return confirm('Tolak tagihan ini?');">
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

// =======================================================================
// 10. SISTEM NOTIFIKASI EMAIL TRANSAKSIONAL (MAILKETING API v2)
// =======================================================================

// Kredensial diambil dari konstanta wp-config.php kalau ada (praktik lebih
// aman — tidak ikut ke mana pun bersama file kode ini), fallback ke nilai
// yang diberikan langsung kalau belum sempat dipindah. Sama pola dengan
// maschan_get_jwt_secret() di atas.
function maschan_mailketing_api_token() {
    return defined('MAILKETING_API_TOKEN') && !empty(MAILKETING_API_TOKEN)
        ? MAILKETING_API_TOKEN
        : 'fd5208fcad3c4e08653a7709bd47f58c';
}

function maschan_mailketing_sender() {
    return [
        'name'  => 'Mas Chan Digital',
        'email' => 'admin@maschandigital.id',
    ];
}

function maschan_admin_notification_email() {
    return 'admin@maschandigital.id';
}

function maschan_mailketing_vendor_list_id() {
    return defined('MAILKETING_VENDOR_LIST_ID') && !empty(MAILKETING_VENDOR_LIST_ID)
        ? MAILKETING_VENDOR_LIST_ID
        : '92356';
}

/**
 * SATU-SATUNYA tempat pemanggilan API Mailketing boleh berada. Kontrak API
 * v1 (dikonfirmasi dari dokumentasi resmi https://api.mailketing.co.id/):
 * - Endpoint: https://api.mailketing.co.id/api/v1/send
 * - Content-Type: application/x-www-form-urlencoded
 * - Body: api_token, from_name, from_email, recipient, subject, content
 * - blocking: true, timeout: 15
 * - Fallback ke wp_mail() jika Mailketing gagal.
 */
function maschan_send_mailketing_email($to_email, $to_name, $subject, $html_content) {
    if (empty($to_email) || !is_email($to_email)) {
        error_log("Mas Chan Digital: email tidak dikirim, alamat tujuan tidak valid ({$to_email}) — subjek: {$subject}");
        return [
            'success' => false,
            'message' => 'Alamat email tujuan tidak valid: ' . $to_email,
        ];
    }

    $sender    = maschan_mailketing_sender();
    $api_token = maschan_mailketing_api_token();

    $body = [
        'api_token'  => $api_token,
        'from_name'  => $sender['name'],
        'from_email' => $sender['email'],
        'recipient'  => $to_email,
        'subject'    => $subject,
        'content'    => $html_content,
    ];

    $result = wp_remote_post('https://api.mailketing.co.id/api/v1/send', [
        'headers' => [
            'Content-Type' => 'application/x-www-form-urlencoded',
        ],
        'body'     => $body,
        'timeout'  => 15,
        'blocking' => true,
    ]);

    $success       = false;
    $status_code   = null;
    $response_body = null;

    if (!is_wp_error($result)) {
        $status_code   = wp_remote_retrieve_response_code($result);
        $response_body = wp_remote_retrieve_body($result);
        $res_json      = json_decode($response_body, true);

        if ($status_code >= 200 && $status_code < 300) {
            if (is_array($res_json) && isset($res_json['status']) && in_array(strtolower((string)$res_json['status']), ['failed', 'error'])) {
                $success = false;
                error_log("Mas Chan Digital: Mailketing API v1 menolak pengiriman ke {$to_email} — " . ($res_json['message'] ?? $response_body));
            } else {
                $success = true;
            }
        } else {
            error_log("Mas Chan Digital: Mailketing API v1 /send HTTP {$status_code} ke {$to_email} — {$response_body}");
        }
    } else {
        error_log("Mas Chan Digital: gagal menghubungi Mailketing API v1 ({$to_email}) — " . $result->get_error_message());
    }

    $fallback_sent = false;
    if (!$success) {
        // Fallback otomatis ke wp_mail() standar WordPress
        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $sender['name'] . ' <' . $sender['email'] . '>',
        ];
        $fallback_sent = wp_mail($to_email, $subject, $html_content, $headers);
        if ($fallback_sent) {
            error_log("Mas Chan Digital: Fallback wp_mail() berhasil terkirim ke {$to_email}");
        } else {
            error_log("Mas Chan Digital: Fallback wp_mail() gagal terkirim ke {$to_email}");
        }
    }

    return [
        'success'       => $success || $fallback_sent,
        'mailketing'    => [
            'status_code' => $status_code,
            'response'    => json_decode($response_body, true) ?: $response_body,
            'is_error'    => is_wp_error($result) ? $result->get_error_message() : null,
        ],
        'fallback_used' => !$success,
        'fallback_sent' => $fallback_sent,
    ];
}

/**
 * Tambah subscriber baru ke kontak list Mailketing (API v1 addsubtolist).
 * Field wajib/lengkap: api_token, list_id, email, first_name, mobile, phone, company.
 */
function maschan_add_subscriber_to_list($email, $name, $mobile = '', $phone = '', $company = '', $list_id = null) {
    if (empty($email) || !is_email($email)) {
        error_log("Mas Chan Digital: subscriber tidak ditambahkan, alamat email tidak valid ({$email})");
        return new WP_Error('invalid_email', 'Alamat email tidak valid');
    }

    $api_token = maschan_mailketing_api_token();
    if (empty($list_id)) {
        $list_id = maschan_mailketing_vendor_list_id();
    }

    $final_phone  = !empty($phone) ? $phone : $mobile;
    $final_mobile = !empty($mobile) ? $mobile : $phone;

    $body = [
        'api_token'  => $api_token,
        'list_id'    => $list_id,
        'email'      => $email,
        'first_name' => $name,
        'mobile'     => $final_mobile,
        'phone'      => $final_phone,
        'company'    => $company,
    ];

    $result = wp_remote_post('https://api.mailketing.co.id/api/v1/addsubtolist', [
        'headers'  => [
            'Content-Type' => 'application/x-www-form-urlencoded',
        ],
        'body'     => $body,
        'timeout'  => 15,
        'blocking' => true,
    ]);

    if (is_wp_error($result)) {
        error_log("Mas Chan Digital: gagal menambahkan subscriber {$email} ke list Mailketing — " . $result->get_error_message());
    }

    return $result;
}

/**
 * Bungkus konten email dengan template HTML bermerek yang konsisten — SATU-
 * SATUNYA tempat "tampilan" email boleh didefinisikan, supaya 10+ skenario
 * email di bawah tidak masing-masing menulis ulang HTML header/footer sendiri
 * (persis prinsip yang sama dengan maschan_approve_invoice/reject_invoice).
 */
function maschan_email_shell($preheader, $body_html) {
    $body_html = $body_html; // sudah HTML tersusun dari pemanggil, tidak di-escape ulang di sini
    return '
    <!DOCTYPE html>
    <html lang="id">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0; padding:0; background-color:#f1f5f9; font-family: Arial, Helvetica, sans-serif;">
        <div style="display:none; max-height:0; overflow:hidden;">' . esc_html($preheader) . '</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 24px 0;">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0;">
                        <tr>
                            <td style="background-color:#093c96; padding:24px 32px;">
                                <span style="color:#ffffff; font-size:18px; font-weight:bold;">Mas Chan Digital</span><br>
                                <span style="color:#c7d7f5; font-size:12px;">Marketplace Lokal Kota Serang</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:32px; color:#1e293b; font-size:14px; line-height:1.6;">
                                ' . $body_html . '
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:20px 32px; background-color:#f8fafc; border-top:1px solid #e2e8f0;">
                                <p style="margin:0; color:#94a3b8; font-size:11px; line-height:1.5;">
                                    Email ini dikirim otomatis oleh sistem Mas Chan Digital. Butuh bantuan? Hubungi Admin di WhatsApp
                                    <a href="https://wa.me/6282298148474" style="color:#093c96;">0822-9814-8474</a>.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>';
}

function maschan_email_button($text, $url) {
    return '<div style="margin:24px 0; text-align:center;">
        <a href="' . esc_url($url) . '" style="background-color:#093c96; color:#ffffff; text-decoration:none; padding:12px 28px; border-radius:10px; font-weight:bold; font-size:14px; display:inline-block;">' . esc_html($text) . '</a>
    </div>';
}

// --- 1. Pendaftaran Vendor Baru --------------------------------------------

function maschan_email_vendor_welcome($vendor) {
    $recipient_name = !empty($vendor['owner_name']) ? $vendor['owner_name'] : $vendor['store_name'];
    $store_name     = !empty($vendor['store_name']) ? $vendor['store_name'] : $recipient_name;
    $salute_name    = !empty($vendor['owner_name'])
        ? esc_html($vendor['owner_name']) . ' (Pemilik <strong>' . esc_html($store_name) . '</strong>)'
        : esc_html($store_name);

    $body = '
        <h2 style="margin:0 0 16px; color:#093c96; font-size:20px; font-weight:bold; line-height:1.4;">Selamat Bergabung, Toko Anda Telah Terdaftar! 🎉</h2>
        <p style="margin:0 0 12px; color:#334155; font-size:15px; line-height:1.6;">
            Halo <strong>' . $salute_name . '</strong>,
        </p>
        <p style="margin:0 0 20px; color:#475569; font-size:14px; line-height:1.6;">
            Terima kasih telah bergabung di Mas Chan Digital. Kini toko Anda telah resmi menjadi bagian dari ekosistem UMKM lokal terdepan di Kota Serang.
        </p>

        <div style="background-color:#f0f9ff; border-left:4px solid #0ea5e9; padding:16px 20px; border-radius:6px; margin:20px 0;">
            <h3 style="color:#0369a1; margin:0 0 12px 0; font-size:15px; font-weight:bold;">Kenapa Jualan di Mas Chan Digital?</h3>
            <ul style="margin:0; padding:0 0 0 18px; color:#334155; font-size:13px; line-height:1.6;">
                <li style="margin-bottom:8px;"><strong>Transaksi 100% Langsung via WhatsApp</strong> tanpa potongan biaya gateway (0% fee).</li>
                <li style="margin-bottom:8px;">Toko online aktif seketika dengan <strong>Paket Starter UMKM Gratis</strong> (maksimal 3 produk).</li>
                <li>Terhubung dengan calon pembeli di <strong>6 kecamatan Kota Serang</strong> (Serang, Cipocok Jaya, Kasemen, Curug, Taktakan, Walantaka).</li>
            </ul>
        </div>

        <div style="margin:24px 0 20px;">
            <h3 style="color:#0f172a; margin:0 0 16px 0; font-size:16px; font-weight:bold; text-align:center;">3 Langkah Mudah Memulai Jualan</h3>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                    <td width="28" valign="top" style="color:#093c96; font-size:16px; font-weight:bold; padding-top:2px;">1.</td>
                    <td style="color:#475569; font-size:13px; line-height:1.5;"><strong>Masuk ke Dashboard Toko Saya</strong> untuk mengelola toko Anda.</td>
                </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                    <td width="28" valign="top" style="color:#093c96; font-size:16px; font-weight:bold; padding-top:2px;">2.</td>
                    <td style="color:#475569; font-size:13px; line-height:1.5;"><strong>Unggah Foto &amp; Deskripsi Produk Lokal Anda</strong> semenarik mungkin agar pembeli tertarik.</td>
                </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td width="28" valign="top" style="color:#093c96; font-size:16px; font-weight:bold; padding-top:2px;">3.</td>
                    <td style="color:#475569; font-size:13px; line-height:1.5;"><strong>Pastikan Nomor WhatsApp Aktif</strong> untuk langsung menerima pesanan dari pembeli.</td>
                </tr>
            </table>
        </div>'
        . maschan_email_button('Masuk ke Dashboard Toko Saya', 'https://maschandigital.id/vendor/login') . '

        <div style="border-top:1px solid #e2e8f0; padding-top:16px; margin-top:24px; text-align:center;">
            <p style="color:#64748b; margin:0 0 6px 0; font-size:12px;">Butuh bantuan? Tim CS kami siap melayani Anda.</p>
            <p style="color:#334155; margin:0; font-size:13px; font-weight:bold;">
                WhatsApp CS: <a href="https://wa.me/6282298148474" style="color:#093c96; text-decoration:none;">0822-9814-8474</a> &bull; 
                Email CS: <a href="mailto:admin@maschandigital.id" style="color:#093c96; text-decoration:none;">admin@maschandigital.id</a>
            </p>
        </div>';

    maschan_send_mailketing_email(
        $vendor['email'],
        $recipient_name,
        'Selamat Datang di Mas Chan Digital, ' . $store_name . '!',
        maschan_email_shell('Selamat Bergabung, Toko Anda Telah Terdaftar!', $body)
    );
}

function maschan_email_admin_new_vendor($vendor) {
    $body = '
        <h2 style="margin:0 0 12px; color:#093c96;">Toko Baru Terdaftar</h2>
        <table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="font-size:13px;">
            <tr><td style="color:#64748b; width:140px;">Nama Toko</td><td><strong>' . esc_html($vendor['store_name']) . '</strong></td></tr>
            <tr><td style="color:#64748b;">Nama Pemilik</td><td>' . esc_html($vendor['owner_name']) . '</td></tr>
            <tr><td style="color:#64748b;">Email</td><td>' . esc_html($vendor['email']) . '</td></tr>
            <tr><td style="color:#64748b;">WhatsApp</td><td>+' . esc_html($vendor['whatsapp_number']) . '</td></tr>
            <tr><td style="color:#64748b;">Kecamatan</td><td>' . esc_html($vendor['location_district']) . '</td></tr>
        </table>';

    maschan_send_mailketing_email(
        maschan_admin_notification_email(),
        'Admin',
        'Vendor Baru Terdaftar: ' . $vendor['store_name'],
        maschan_email_shell('Toko baru terdaftar di Mas Chan Digital', $body)
    );
}

// --- 2. Pengajuan Perpanjangan / Upgrade Paket ------------------------------

function maschan_email_invoice_created($vendor, $invoice_number, $plan_name, $amount) {
    $body = '
        <h2 style="margin:0 0 12px; color:#093c96;">Tagihan Paket Langganan Anda</h2>
        <p>Halo ' . esc_html($vendor['store_name']) . ', berikut rincian tagihan untuk paket yang Anda pilih:</p>
        <table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="font-size:13px; background-color:#f8fafc; border-radius:10px; margin:16px 0;">
            <tr><td style="color:#64748b; width:140px; padding-left:12px;">No. Invoice</td><td><strong>' . esc_html($invoice_number) . '</strong></td></tr>
            <tr><td style="color:#64748b; padding-left:12px;">Paket</td><td>' . esc_html($plan_name) . '</td></tr>
            <tr><td style="color:#64748b; padding-left:12px;">Nominal Transfer</td><td><strong style="color:#093c96; font-size:16px;">Rp ' . number_format((int)$amount, 0, ',', '.') . '</strong></td></tr>
        </table>
        <p>Silakan buka dashboard billing untuk melihat nomor rekening tujuan transfer dan mengunggah bukti pembayaran Anda.</p>'
        . maschan_email_button('Buka Halaman Pembayaran', 'https://maschandigital.id/dashboard/billing');

    maschan_send_mailketing_email(
        $vendor['email'],
        $vendor['store_name'],
        'Tagihan Paket ' . $plan_name . ' — ' . $invoice_number,
        maschan_email_shell('Rincian tagihan paket langganan Anda', $body)
    );
}

// --- 3. Konfirmasi Upload Bukti Transfer ------------------------------------

function maschan_email_admin_payment_confirmed($vendor, $invoice_id, $invoice_number, $amount, $proof_url) {
    $admin_link = admin_url('post.php?post=' . intval($invoice_id) . '&action=edit');
    $body = '
        <h2 style="margin:0 0 12px; color:#093c96;">Konfirmasi Pembayaran Masuk</h2>
        <table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="font-size:13px;">
            <tr><td style="color:#64748b; width:140px;">Toko</td><td><strong>' . esc_html($vendor['store_name']) . '</strong></td></tr>
            <tr><td style="color:#64748b;">No. Invoice</td><td>' . esc_html($invoice_number) . '</td></tr>
            <tr><td style="color:#64748b;">Nominal</td><td>Rp ' . number_format((int)$amount, 0, ',', '.') . '</td></tr>
        </table>'
        . (!empty($proof_url) ? '<p style="margin-top:16px;"><a href="' . esc_url($proof_url) . '" style="color:#093c96;">Lihat foto bukti transfer →</a></p>' : '')
        . maschan_email_button('Verifikasi di WP-Admin', $admin_link);

    maschan_send_mailketing_email(
        maschan_admin_notification_email(),
        'Admin',
        'Konfirmasi Pembayaran Masuk: ' . $invoice_number,
        maschan_email_shell('Ada bukti transfer baru menunggu verifikasi', $body)
    );
}

function maschan_email_vendor_payment_received($vendor, $invoice_number) {
    $body = '
        <h2 style="margin:0 0 12px; color:#093c96;">Bukti Pembayaran Diterima ✓</h2>
        <p>Halo ' . esc_html($vendor['store_name']) . ', bukti transfer untuk tagihan <strong>' . esc_html($invoice_number) . '</strong> sudah kami terima dan sedang menunggu verifikasi Admin.</p>
        <p style="background-color:#eff6ff; border-radius:10px; padding:12px 16px; color:#1e40af;">Toko Anda <strong>tetap buka seperti biasa</strong> selama proses verifikasi berlangsung — tidak ada yang perlu dikhawatirkan.</p>';

    maschan_send_mailketing_email(
        $vendor['email'],
        $vendor['store_name'],
        'Bukti Pembayaran Diterima — ' . $invoice_number,
        maschan_email_shell('Bukti pembayaran Anda sedang diverifikasi', $body)
    );
}

// --- 4. Persetujuan Pembayaran ----------------------------------------------

function maschan_email_vendor_approved($vendor, $plan_name, $max_products) {
    $kuota_text = ($max_products === -1) ? 'Tanpa Batas (Unlimited)' : $max_products . ' Produk';
    $body = '
        <h2 style="margin:0 0 12px; color:#16a34a;">Pembayaran Terverifikasi ✓</h2>
        <p>Halo ' . esc_html($vendor['store_name']) . ', pembayaran Anda sudah disetujui dan masa aktif paket <strong>' . esc_html($plan_name) . '</strong> telah diperpanjang.</p>
        <p>Kuota produk Anda sekarang: <strong>' . esc_html($kuota_text) . '</strong></p>'
        . maschan_email_button('Buka Dashboard Vendor', 'https://maschandigital.id/dashboard');

    maschan_send_mailketing_email(
        $vendor['email'],
        $vendor['store_name'],
        'Pembayaran Disetujui — Paket ' . $plan_name . ' Aktif',
        maschan_email_shell('Paket langganan Anda sudah aktif', $body)
    );
}

// --- 5. Penolakan Pembayaran -------------------------------------------------

function maschan_email_vendor_rejected($vendor, $reason) {
    $body = '
        <h2 style="margin:0 0 12px; color:#e11d48;">Pembayaran Ditolak</h2>
        <p>Halo ' . esc_html($vendor['store_name']) . ', mohon maaf, bukti pembayaran yang Anda unggah belum bisa kami verifikasi.</p>
        <p style="background-color:#fff1f2; border-radius:10px; padding:12px 16px; color:#9f1239;"><strong>Alasan:</strong> ' . esc_html($reason) . '</p>
        <p>Silakan unggah ulang bukti transfer yang valid melalui dashboard billing Anda.</p>'
        . maschan_email_button('Unggah Ulang Bukti Transfer', 'https://maschandigital.id/dashboard/billing');

    maschan_send_mailketing_email(
        $vendor['email'],
        $vendor['store_name'],
        'Pembayaran Ditolak — Perlu Diunggah Ulang',
        maschan_email_shell('Bukti pembayaran perlu diunggah ulang', $body)
    );
}

// --- 6. Pembatalan Tagihan oleh Vendor ---------------------------------------

function maschan_email_vendor_cancelled($vendor) {
    $body = '
        <h2 style="margin:0 0 12px; color:#093c96;">Tagihan Dibatalkan</h2>
        <p>Halo ' . esc_html($vendor['store_name']) . ', tagihan yang Anda batalkan sudah kami proses. Anda dapat memilih paket baru kapan saja lewat dashboard billing.</p>'
        . maschan_email_button('Pilih Paket Lain', 'https://maschandigital.id/dashboard/billing');

    maschan_send_mailketing_email(
        $vendor['email'],
        $vendor['store_name'],
        'Konfirmasi Pembatalan Tagihan',
        maschan_email_shell('Tagihan Anda sudah dibatalkan', $body)
    );
}

// --- 7. Evaluasi Cron Harian --------------------------------------------------

function maschan_email_vendor_renewal_due($vendor, $end_date) {
    $tanggal = date_i18n('d F Y', strtotime($end_date));
    $body = '
        <h2 style="margin:0 0 12px; color:#d97706;">Masa Aktif Segera Berakhir</h2>
        <p>Halo ' . esc_html($vendor['store_name']) . ', paket langganan Anda akan berakhir pada <strong>' . esc_html($tanggal) . '</strong> (kurang dari 7 hari lagi).</p>
        <p>Perpanjang sekarang supaya kuota produk Anda tidak turun ke Paket Starter UMKM (maks. 3 produk).</p>'
        . maschan_email_button('Perpanjang Sekarang', 'https://maschandigital.id/dashboard/billing');

    maschan_send_mailketing_email(
        $vendor['email'],
        $vendor['store_name'],
        'Pengingat: Masa Aktif Paket Anda Segera Berakhir',
        maschan_email_shell('Paket Anda akan berakhir dalam 7 hari', $body)
    );
}

function maschan_email_vendor_grace_period($vendor) {
    $body = '
        <h2 style="margin:0 0 12px; color:#dc2626;">Masa Tenggang 3 Hari</h2>
        <p>Halo ' . esc_html($vendor['store_name']) . ', masa aktif paket Anda sudah berakhir. Anda punya <strong>toleransi 3 hari</strong> sebelum kuota produk otomatis disesuaikan ke Paket Starter UMKM.</p>
        <p>Toko Anda tetap tampil di publik seperti biasa selama masa tenggang ini.</p>'
        . maschan_email_button('Perpanjang Sekarang', 'https://maschandigital.id/dashboard/billing');

    maschan_send_mailketing_email(
        $vendor['email'],
        $vendor['store_name'],
        'Masa Tenggang 3 Hari — Segera Perpanjang',
        maschan_email_shell('Masa aktif paket Anda sudah berakhir', $body)
    );
}

function maschan_email_vendor_downgraded($vendor) {
    $body = '
        <h2 style="margin:0 0 12px; color:#093c96;">Toko Anda Kembali ke Paket Starter UMKM</h2>
        <p>Halo ' . esc_html($vendor['store_name']) . ', karena belum ada perpanjangan, akun Anda otomatis dipindahkan ke <strong>Paket Starter UMKM (Gratis, maks. 3 produk)</strong>.</p>
        <p style="background-color:#eff6ff; border-radius:10px; padding:12px 16px; color:#1e40af;">Tenang, <strong>produk lama Anda tetap aman</strong> dan tidak dihapus — hanya penambahan produk baru yang dibatasi sampai Anda upgrade lagi.</p>'
        . maschan_email_button('Upgrade Paket', 'https://maschandigital.id/dashboard/billing');

    maschan_send_mailketing_email(
        $vendor['email'],
        $vendor['store_name'],
        'Toko Anda Kembali ke Paket Starter UMKM',
        maschan_email_shell('Status paket Anda telah disesuaikan', $body)
    );
}