import { Product, Vendor, ProductCategory } from "@/types";
import { getVendorSession } from "@/lib/api/auth";
import { resolveVendorDistrict } from "@/lib/utils";

const WP_API_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://app.maschandigital.id";
const GRAPHQL_URL = `${WP_API_URL}/graphql`;

/**
 * Bentuk data mentah dari GraphQL/REST WordPress belum bisa dipastikan
 * strukturnya secara statis (tergantung skema WPGraphQL & WCFM di server),
 * jadi dipakai alias longgar ini di titik-titik "batas" API saja —
 * bukan `any` yang menyebar bebas ke seluruh kode.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawApiNode = Record<string, any>;

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/**
/**
 * Universal GraphQL Fetcher dengan Opsi Cache Terkontrol
 */
async function fetchGraphQL(
  query: string,
  variables: Record<string, unknown> = {},
  revalidateSeconds: number | false = 60, // Default 60 detik untuk query publik
) {
  try {
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    };

    if (revalidateSeconds === false || revalidateSeconds === 0) {
      fetchOptions.cache = "no-store";
    } else {
      fetchOptions.next = { revalidate: revalidateSeconds };
    }

    const res = await fetch(GRAPHQL_URL, fetchOptions);

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err: unknown) {
    return null;
  }
}

/**
 * Format Data Produk (ID dijamin > 0 dan Unik)
 */
function formatGraphQLProduct(
  node: RawApiNode,
  fallbackIndex: number = 0,
): Product {
  const isExternal =
    node.type === "EXTERNAL" ||
    node.type === "affiliate" ||
    node.type === "external";
  const isSale = Boolean(
    node.onSale || (node.salePrice && parseFloat(node.salePrice) > 0),
  );

  const parsedId =
    Number(node.databaseId) ||
    (node.id && !isNaN(Number(node.id)) ? Number(node.id) : 0);
  const finalId = parsedId > 0 ? parsedId : fallbackIndex + 1;

  const vStore = node.vendorStore || {};
  const vendorId =
    vStore.id ||
    (node.author?.node?.databaseId
      ? Number(node.author.node.databaseId)
      : node.vendor?.id
        ? Number(node.vendor.id)
        : 2);
  const vendorName =
    vStore.storeName ||
    node.author?.node?.name ||
    node.vendor?.store_name ||
    "Chan Store";
  const vendorSlug =
    vStore.slug ||
    node.vendor?.slug ||
    (vendorName
      ? vendorName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "chanstore");
  const vendorPhone =
    vStore.whatsappNumber || node.vendor?.whatsapp_number || "6282298148474";
  const vendorDistrict =
    vStore.locationDistrict || node.vendor?.city || "Kota Serang";
  const vendorAvatar = vStore.avatarUrl || node.vendor?.avatar || "";

  let categories: ProductCategory[] = [];
  let categoryIds: number[] = [];
  if (
    node.productCategories?.nodes &&
    Array.isArray(node.productCategories.nodes)
  ) {
    categories = node.productCategories.nodes.map((c: RawApiNode) => ({
      id: Number(c.databaseId || c.id || 1),
      name: String(c.name || "Umum"),
      slug: String(c.slug || "umum"),
      parent: Number(c.parentDatabaseId || c.parentId || c.parent || 0),
    }));
    categoryIds = categories.map((c) => c.id);
  } else if (node.categories && Array.isArray(node.categories)) {
    categories = node.categories.map((c: RawApiNode) => ({
      id: Number(c.id || 1),
      name: String(c.name || "Umum"),
      slug: String(c.slug || "umum"),
      parent: Number(c.parent || 0),
      count: typeof c.count === "number" ? c.count : undefined,
      description: typeof c.description === "string" ? c.description : undefined,
    }));
    categoryIds = categories.map((c) => c.id);
  }
  if (categories.length === 0) {
    categories = [{ id: 1, name: "Umum", slug: "umum", parent: 0 }];
    categoryIds = [];
  }

  let images: { id: number; src: string; alt: string }[] = [];
  if (node.image?.sourceUrl) {
    images.push({
      id: node.image.databaseId || 1,
      src: node.image.sourceUrl,
      alt: node.image.altText || node.name || "Foto Produk",
    });
  } else if (
    node.images &&
    Array.isArray(node.images) &&
    node.images.length > 0
  ) {
    images = node.images;
  }
  if (node.galleryImages?.nodes && Array.isArray(node.galleryImages.nodes)) {
    node.galleryImages.nodes.forEach((g: RawApiNode, idx: number) => {
      if (g.sourceUrl) {
        images.push({
          id: g.databaseId || idx + 2,
          src: g.sourceUrl,
          alt: g.altText || node.name || "",
        });
      }
    });
  }
  if (images.length === 0) {
    images = [
      {
        id: 1,
        src: "https://app.maschandigital.id/wp-content/uploads/woocommerce-placeholder.webp",
        alt: node.name || "Produk Serang",
      },
    ];
  }

  const rawPrice = node.price || "0";
  const rawRegularPrice = node.regularPrice || node.regular_price || rawPrice;
  const rawSalePrice = node.salePrice || node.sale_price || "";
  const viewsCount =
    Number(node.views_count) || Number(node.wcfm_product_views) || 0;

  return {
    id: finalId,
    name: node.name || "Madu Akasia",
    slug: node.slug || `produk-${finalId}`,
    type: isExternal ? "affiliate" : "simple",
    status: "publish",
    description: (node.description || "").replace(/<[^>]*>?/gm, ""),
    short_description: (
      node.shortDescription ||
      node.short_description ||
      ""
    ).replace(/<[^>]*>?/gm, ""),
    price: String(rawPrice),
    regular_price: String(rawRegularPrice),
    sale_price: String(rawSalePrice),
    on_sale: isSale,
    categories,
    category_ids: categoryIds,
    images,
    external_url: node.externalUrl || node.external_url || "",
    button_text: node.buttonText || node.button_text || "Beli via Link",
    views_count: viewsCount,
    vendor: {
      id: vendorId,
      store_name: vendorName,
      slug: vendorSlug,
      whatsapp_number: vendorPhone,
      avatar: vendorAvatar,
      city: vendorDistrict,
      is_verified: true,
      store_hours: vStore.storeHours || node.vendor?.store_hours,
      vacation_mode: vStore.vacationMode || node.vendor?.vacation_mode,
    },
    seo: {
      focus_keyword:
        node.seo?.focusKeywords?.[0] || node.seo?.focus_keyword || "",
      meta_title: node.seo?.title || node.seo?.meta_title || node.name || "",
      meta_description:
        node.seo?.description ||
        node.seo?.meta_description ||
        node.shortDescription ||
        "",
    },
    created_at: node.created_at || new Date().toISOString(),
  };
}

/**
 * Format Data Vendor Lengkap
 */
function formatGraphQLVendor(v: RawApiNode): Vendor {
  const storeName = v.storeName || v.store_name || "Chan Store";
  const slug =
    v.slug ||
    (storeName
      ? storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "chanstore");

  return {
    id: Number(v.id) || 2,
    store_name: storeName,
    slug: slug,
    owner_name: v.ownerName || v.owner_name || storeName,
    email: v.email || "",
    whatsapp_number: v.whatsappNumber || v.whatsapp_number || "6282298148474",
    address: {
      street_1: v.streetAddress || v.address?.street_1 || "Kota Serang",
      street_2:
        v.locationSubdistrict ||
        v.location_subdistrict ||
        v.subdistrict ||
        v.address?.street_2 ||
        "",
      city: v.locationDistrict || v.location_district || "Kota Serang",
      zip: v.address?.zip || "42111",
    },
    location_district:
      v.locationDistrict || v.location_district || "Kota Serang",
    location_subdistrict:
      v.locationSubdistrict ||
      v.location_subdistrict ||
      v.subdistrict ||
      v.address?.street_2 ||
      "",
    subdistrict:
      v.locationSubdistrict ||
      v.location_subdistrict ||
      v.subdistrict ||
      v.address?.street_2 ||
      "",
    avatar:
      v.avatarUrl ||
      v.avatar ||
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    banner: v.bannerUrl || v.banner || "",
    description:
      v.description || "Penyedia produk dan jasa lokal di Kota Serang.",
    is_verified: true,
    rating: 5.0,
    review_count: 1,
    products_count: Number(v.productsCount || v.products_count) || 0,
    views_count: Number(v.views_count) || Number(v.viewsCount) || 0,
    joined_date: v.joinedDate || v.joined_date || "2026-01-01",
    socials: v.socials || {
      instagram: "",
      tiktok: "",
      facebook: "",
      youtube: "",
      website: "",
    },
    store_hours: v.storeHours || v.store_hours,
    vacation_mode: v.vacationMode ||
      v.vacation_mode || { isEnabled: false, vacationMessage: "" },
    store_seo: v.storeSeo ||
      v.store_seo || { seoTitle: "", metaDescription: "", metaKeywords: "" },
    chat_integration: v.chatIntegration
      ? {
          enabled: Boolean(v.chatIntegration.enabled),
          property_id: v.chatIntegration.propertyId || "",
          widget_id: v.chatIntegration.widgetId || "",
        }
      : v.chat_integration || {
          enabled: false,
          property_id: "",
          widget_id: "",
        },
  };
}

/**
 * AMBIL PROFIL KHUSUS ID VENDOR YANG SEDANG LOGIN (BEBAS CACHE)
 */
export async function getVendorProfileById(
  vendorId: number | string,
): Promise<Vendor | null> {
  if (!vendorId) return null;
  try {
    const session = getVendorSession();
    const headers: Record<string, string> = {};
    if (session?.token) headers["Authorization"] = `Bearer ${session.token}`;

    const res = await fetch(
      `${WP_API_URL}/wp-json/maschan/v1/vendors/${vendorId}`,
      {
        headers,
        cache: "no-store",
      },
    );
    if (res.ok) {
      const data = await res.json();
      return formatGraphQLVendor(data);
    }
  } catch (err) {
    console.error("Gagal mengambil data vendor by ID:", err);
  }
  return null;
}

/**
 * AMBIL SEMUA PRODUK (PUBLIK / FILTER VENDOR)
 */
export async function getProducts(
  categorySlug?: string,
  searchQuery?: string,
  vendorId?: number,
): Promise<Product[]> {
  const query = `
    query GetAllProducts {
      products(first: 100) {
        nodes {
          databaseId
          name
          slug
          type
          description
          shortDescription
          onSale
          ... on SimpleProduct {
            price(format: RAW)
            regularPrice(format: RAW)
            salePrice(format: RAW)
          }
          ... on ExternalProduct {
            price(format: RAW)
            regularPrice(format: RAW)
            salePrice(format: RAW)
            externalUrl
            buttonText
          }
          image {
            databaseId
            sourceUrl
            altText
          }
          galleryImages {
            nodes {
              databaseId
              sourceUrl
            }
          }
          productCategories {
            nodes {
              databaseId
              name
              slug
            }
          }
          author {
            node {
              databaseId
              name
            }
          }
          vendorStore {
            id
            storeName
            slug
            whatsappNumber
            locationDistrict
            avatarUrl
            storeHours {
              senin { isOpen openTime closeTime }
              selasa { isOpen openTime closeTime }
              rabu { isOpen openTime closeTime }
              kamis { isOpen openTime closeTime }
              jumat { isOpen openTime closeTime }
              sabtu { isOpen openTime closeTime }
              minggu { isOpen openTime closeTime }
            }
            vacationMode {
              isEnabled
              vacationMessage
            }
          }
          seo {
            title
            description
            focusKeywords
          }
        }
      }
    }
  `;

  let list: Product[] = [];
  const data = await fetchGraphQL(query);
  if (data?.products?.nodes && Array.isArray(data.products.nodes)) {
    list = data.products.nodes.map((node: RawApiNode, idx: number) =>
      formatGraphQLProduct(node, idx),
    );
  } else {
    try {
      const url = vendorId
        ? `${WP_API_URL}/wp-json/maschan/v1/products?vendor_id=${vendorId}`
        : `${WP_API_URL}/wp-json/maschan/v1/products`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const restData = await res.json();
        if (Array.isArray(restData))
          list = restData.map((node: RawApiNode, idx: number) =>
            formatGraphQLProduct(node, idx),
          );
      }
    } catch {
      // diamkan: fallback berikutnya tetap dicoba
    }
  }

  if (vendorId) {
    list = list.filter((p) => Number(p.vendor?.id) === Number(vendorId));
  }

  if (categorySlug && categorySlug !== "semua") {
    list = list.filter((p) =>
      p.categories.some(
        (c) => c.slug.toLowerCase() === categorySlug.toLowerCase(),
      ),
    );
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }

  return list;
}

/**
 * AMBIL PRODUK KHUSUS VENDOR YANG SEDANG LOGIN (ROBUST ENGINE)
 */
export async function getMyVendorProducts(): Promise<Product[]> {
  try {
    const session = getVendorSession();

    // Tidak ada lagi fallback ke vendor tertentu atau "tampilkan semua produk"
    // saat sesi tidak terdeteksi — itu bisa membocorkan katalog vendor lain
    // ke akun yang salah/belum login. Kalau tidak ada sesi valid, kembalikan kosong.
    if (!session || !session.user?.id) {
      return [];
    }
    const targetVendorId = Number(session.user.id);

    // 1. Coba panggil REST API langsung dengan filter author vendor_id
    const res = await fetch(
      `${WP_API_URL}/wp-json/maschan/v1/products?vendor_id=${targetVendorId}`,
      {
        cache: "no-store",
      },
    );
    if (res.ok) {
      const restData = await res.json();
      if (Array.isArray(restData) && restData.length > 0) {
        return restData.map((node: RawApiNode, idx: number) =>
          formatGraphQLProduct(node, idx),
        );
      }
    }

    // 2. Fallback: ambil semua produk lalu filter berdasarkan vendor ID
    //    (tetap disaring per-vendor, tidak pernah mengembalikan katalog vendor lain)
    const all = await getProducts();
    const matched = all.filter((p) => Number(p.vendor?.id) === targetVendorId);
    return matched;
  } catch (err) {
    console.error("Gagal mengambil produk vendor:", err);
    return [];
  }
}

/**
 * AMBIL SINGLE PRODUK BERDASARKAN SLUG / ID
 */
export async function getProductBySlug(
  slugOrId?: string | null,
): Promise<Product | null> {
  if (!slugOrId || typeof slugOrId !== "string") return null;
  const clean = slugOrId.trim();

  const isNumeric = !isNaN(Number(clean));
  const idType = isNumeric ? "DATABASE_ID" : "SLUG";

  const query = `
    query GetProductBySlug($id: ID!, $idType: ProductIdTypeEnum!) {
      product(id: $id, idType: $idType) {
        databaseId
        name
        slug
        type
        description
        shortDescription
        onSale
        ... on SimpleProduct {
          price(format: RAW)
          regularPrice(format: RAW)
          salePrice(format: RAW)
        }
        ... on ExternalProduct {
          price(format: RAW)
          regularPrice(format: RAW)
          salePrice(format: RAW)
          externalUrl
          buttonText
        }
        image {
          databaseId
          sourceUrl
          altText
        }
        galleryImages {
          nodes {
            databaseId
            sourceUrl
          }
        }
        productCategories {
          nodes {
            databaseId
            name
            slug
          }
        }
        vendorStore {
          id
          storeName
          slug
          whatsappNumber
          locationDistrict
          avatarUrl
          storeHours {
            senin { isOpen openTime closeTime }
            selasa { isOpen openTime closeTime }
            rabu { isOpen openTime closeTime }
            kamis { isOpen openTime closeTime }
            jumat { isOpen openTime closeTime }
            sabtu { isOpen openTime closeTime }
            minggu { isOpen openTime closeTime }
          }
          vacationMode {
            isEnabled
            vacationMessage
          }
        }
        seo {
          title
          description
          focusKeywords
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { id: clean, idType });
  if (data?.product) {
    return formatGraphQLProduct(data.product);
  }

  const all = await getProducts();
  return (
    all.find(
      (p) =>
        (p.slug && p.slug.toLowerCase() === clean.toLowerCase()) ||
        String(p.id) === clean,
    ) || null
  );
}

/**
 * AMBIL SEMUA VENDOR WCFM
 */
export async function getVendors(
  district?: string,
  searchQuery?: string,
): Promise<Vendor[]> {
  const query = `
    query GetWcfmVendors {
      wcfmVendors {
        id
        storeName
        slug
        ownerName
        email
        whatsappNumber
        locationDistrict
        streetAddress
        avatarUrl
        bannerUrl
        description
        productsCount
        socials {
          instagram
          tiktok
          facebook
          youtube
          website
        }
        vacationMode {
          isEnabled
          vacationMessage
        }
        storeHours {
          senin { isOpen openTime closeTime }
          selasa { isOpen openTime closeTime }
          rabu { isOpen openTime closeTime }
          kamis { isOpen openTime closeTime }
          jumat { isOpen openTime closeTime }
          sabtu { isOpen openTime closeTime }
          minggu { isOpen openTime closeTime }
        }
        storeSeo {
          seoTitle
          metaDescription
          metaKeywords
        }
        chatIntegration {
          enabled
          propertyId
          widgetId
        }
      }
    }
  `;

  const data = await fetchGraphQL(query);
  let vendors: Vendor[] = [];

  if (data?.wcfmVendors && Array.isArray(data.wcfmVendors)) {
    vendors = data.wcfmVendors.map(formatGraphQLVendor);
  } else {
    try {
      const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/vendors`, {
        cache: "no-store",
      });
      if (res.ok) {
        const restData = await res.json();
        if (Array.isArray(restData))
          vendors = restData.map(formatGraphQLVendor);
      }
    } catch {
      // diamkan: fallback berikutnya tetap dicoba
    }
  }

  if (district && district !== "Semua" && district !== "Semua Kecamatan") {
    const cleanDist = district.replace(/^kec(\.|\s+)?/i, "").trim().toLowerCase();
    vendors = vendors.filter((v) => {
      const resolved = resolveVendorDistrict(v).toLowerCase();
      return resolved.includes(cleanDist) || cleanDist.includes(resolved);
    });
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    vendors = vendors.filter((v) => {
      const storeMatch = v.store_name?.toLowerCase().includes(q);
      const ownerMatch = v.owner_name?.toLowerCase().includes(q);
      const descMatch = v.description?.toLowerCase().includes(q);
      const districtMatch =
        v.location_district?.toLowerCase().includes(q) ||
        v.address?.city?.toLowerCase().includes(q);
      const subdistrictMatch =
        v.location_subdistrict?.toLowerCase().includes(q) ||
        v.subdistrict?.toLowerCase().includes(q) ||
        v.address?.street_2?.toLowerCase().includes(q);
      const streetMatch = v.address?.street_1?.toLowerCase().includes(q);

      return Boolean(
        storeMatch ||
          ownerMatch ||
          descMatch ||
          districtMatch ||
          subdistrictMatch ||
          streetMatch
      );
    });
  }

  return vendors;
}

/**
 * AMBIL SINGLE VENDOR BERDASARKAN SLUG / ID
 */
export async function getVendorBySlug(
  slugOrId?: string | null,
): Promise<Vendor | null> {
  if (!slugOrId || typeof slugOrId !== "string") return null;
  const clean = slugOrId.trim().toLowerCase();

  if (!isNaN(Number(clean))) {
    return getVendorProfileById(Number(clean));
  }

  const all = await getVendors();
  return (
    all.find(
      (v) =>
        (v.slug && v.slug.toLowerCase() === clean) ||
        String(v.id) === clean ||
        (v.store_name &&
          v.store_name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === clean),
    ) || null
  );
}

/**
 * AMBIL PRODUK MILIK VENDOR TERTENTU
 */
export async function getVendorProducts(vendorId: number): Promise<Product[]> {
  try {
    const res = await fetch(
      `${WP_API_URL}/wp-json/maschan/v1/products?vendor_id=${vendorId}`,
      {
        cache: "no-store",
      },
    );
    if (res.ok) {
      const restData = await res.json();
      if (Array.isArray(restData) && restData.length > 0) {
        return restData.map((node: RawApiNode, idx: number) =>
          formatGraphQLProduct(node, idx),
        );
      }
    }
  } catch {
    // diamkan: fallback berikutnya tetap dicoba
  }

  return getProducts(undefined, undefined, vendorId);
}

/**
 * TAMBAH PRODUK BARU
 */
export async function createProduct(
  productData: Record<string, unknown>,
): Promise<{ success: boolean; product?: Product; message?: string }> {
  try {
    const session = getVendorSession();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session?.token) headers["Authorization"] = `Bearer ${session.token}`;

    const payload = {
      ...productData,
      author_id: productData.author_id || session?.user?.id,
    };

    const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/products`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message, product: data.product };
    }
    return {
      success: false,
      message: data.message || "Gagal menambahkan produk ke backend.",
    };
  } catch (err) {
    return {
      success: false,
      message: getErrorMessage(err, "Gagal menghubungkan ke server WordPress."),
    };
  }
}

/**
 * EDIT PRODUK
 */
export async function updateProduct(
  id: number | string,
  productData: Record<string, unknown>,
): Promise<{ success: boolean; message?: string }> {
  try {
    const session = getVendorSession();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session?.token) headers["Authorization"] = `Bearer ${session.token}`;

    const payload = {
      ...productData,
      author_id: productData.author_id || session?.user?.id,
    };

    const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/products/${id}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return {
      success: false,
      message: data.message || "Gagal menyimpan perubahan produk.",
    };
  } catch (err) {
    return {
      success: false,
      message: getErrorMessage(err, "Gagal menghubungkan ke server WordPress."),
    };
  }
}

/**
 * HAPUS PRODUK
 */
export async function deleteProduct(id: number | string): Promise<boolean> {
  try {
    const session = getVendorSession();
    const headers: Record<string, string> = {};
    if (session?.token) headers["Authorization"] = `Bearer ${session.token}`;

    const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/products/${id}`, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    return Boolean(res.ok && data.success);
  } catch {
    return false;
  }
}

/**
 * UPDATE PROFIL VENDOR
 */
export async function updateVendorProfile(
  vendorId: number | string,
  profileData: Record<string, unknown>,
): Promise<{ success: boolean; message?: string }> {
  try {
    const session = getVendorSession();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session?.token) headers["Authorization"] = `Bearer ${session.token}`;

    const res = await fetch(
      `${WP_API_URL}/wp-json/maschan/v1/vendors/${vendorId}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(profileData),
      },
    );

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return {
      success: false,
      message: data.message || "Gagal menyimpan pengaturan vendor.",
    };
  } catch (err) {
    return {
      success: false,
      message: getErrorMessage(err, "Gagal menghubungi server WordPress."),
    };
  }
}

/**
 * AMBIL KATEGORI PRODUK (Murni dari Taksonomi WooCommerce / WCFM)
 */
export async function getCategories(): Promise<ProductCategory[]> {
  // 1. Coba GraphQL Taksonomi Kategori WooCommerce
  const query = `
    query GetProductCategories {
      productCategories(first: 100) {
        nodes {
          databaseId
          name
          slug
          count
          description
          parentDatabaseId
          image {
            sourceUrl
          }
        }
      }
    }
  `;

  try {
    const data = await fetchGraphQL(query);
    if (data?.productCategories?.nodes && Array.isArray(data.productCategories.nodes) && data.productCategories.nodes.length > 0) {
      return data.productCategories.nodes.map((node: RawApiNode) => ({
        id: Number(node.databaseId || node.id),
        name: String(node.name || ""),
        slug: String(node.slug || ""),
        parent: Number(node.parentDatabaseId || node.parentId || 0),
        count: typeof node.count === "number" ? node.count : 0,
        description: typeof node.description === "string" ? node.description : undefined,
        image: node.image?.sourceUrl || undefined,
      }));
    }
  } catch {
    // diamkan: fallback ke REST API di bawah
  }

  // 2. Fallback REST API Kategori
  try {
    const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/categories`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: RawApiNode) => ({
          id: Number(item.id || item.term_id),
          name: String(item.name || ""),
          slug: String(item.slug || ""),
          parent: Number(item.parent || 0),
          count: typeof item.count === "number" ? item.count : undefined,
          description: typeof item.description === "string" ? item.description : undefined,
          image: typeof item.image === "string" ? item.image : item.image?.src || undefined,
        }));
      }
    }
  } catch {
    // diamkan: kembalikan array kosong jika server tidak dapat dihubungi
  }

  return [];
}

/**
 * TAMBAH KATEGORI BARU
 */
export async function createCategory(
  name: string,
  parentId: number = 0,
): Promise<{ success: boolean; category?: ProductCategory; message?: string }> {
  try {
    const session = getVendorSession();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session?.token) headers["Authorization"] = `Bearer ${session.token}`;

    const res = await fetch(`${WP_API_URL}/wp-json/maschan/v1/categories`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name, parent: parentId }),
    });
    const data = await res.json();
    if (res.ok && data.success)
      return { success: true, category: data.category };
    return {
      success: false,
      message: data.message || "Gagal menambahkan kategori.",
    };
  } catch (err) {
    return {
      success: false,
      message: getErrorMessage(err, "Gagal menghubungi server."),
    };
  }
}

/**
 * PELACAK STATISTIK PRODUK (VIEWS & KLIK WHATSAPP)
 */
export async function trackProductView(productId: number): Promise<void> {
  if (!productId) return;
  try {
    await fetch(`${WP_API_URL}/wp-json/maschan/v1/products/${productId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    // Background telemetry non-blocking
  }
}

export async function trackWhatsAppClick(productId?: number): Promise<void> {
  if (!productId) return;
  try {
    await fetch(
      `${WP_API_URL}/wp-json/maschan/v1/products/${productId}/wa-click`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err: unknown) {
    // Background telemetry non-blocking
  }
}
