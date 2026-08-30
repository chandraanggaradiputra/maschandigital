import { NextRequest, NextResponse } from "next/server";
import { getProducts, getVendors, getCategories } from "@/lib/api/wordpress";
import { Product, Vendor, ProductCategory } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    // Ambil data paralel
    const [allProducts, allVendors, allCategories] = await Promise.all([
      getProducts(),
      getVendors(),
      getCategories(),
    ]);

    if (!query) {
      // Kembalikan item rekomendasi jika query kosong
      return NextResponse.json({
        success: true,
        query: "",
        products: allProducts.slice(0, 6),
        vendors: allVendors.slice(0, 4),
        categories: allCategories.slice(0, 8),
      });
    }

    // 1. Filter Produk (Nama, Deskripsi, Kategori, Nama Toko, Kota/Kecamatan)
    const matchedProducts = allProducts.filter((product: Product) => {
      const nameMatch = product.name?.toLowerCase().includes(query);
      const descMatch =
        product.description?.toLowerCase().includes(query) ||
        product.short_description?.toLowerCase().includes(query);
      const storeMatch = product.vendor?.store_name?.toLowerCase().includes(query);
      const cityMatch = product.vendor?.city?.toLowerCase().includes(query);
      const catMatch = product.categories?.some(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.slug?.toLowerCase().includes(query)
      );

      return Boolean(nameMatch || descMatch || storeMatch || cityMatch || catMatch);
    });

    // 2. Filter Vendor (Nama Toko, Nama Pemilik, Deskripsi, Alamat, Kecamatan)
    const matchedVendors = allVendors.filter((vendor: Vendor) => {
      const storeMatch = vendor.store_name?.toLowerCase().includes(query);
      const ownerMatch = vendor.owner_name?.toLowerCase().includes(query);
      const descMatch = vendor.description?.toLowerCase().includes(query);
      const districtMatch =
        vendor.location_district?.toLowerCase().includes(query) ||
        vendor.address?.city?.toLowerCase().includes(query);
      const subdistrictMatch =
        vendor.location_subdistrict?.toLowerCase().includes(query) ||
        vendor.subdistrict?.toLowerCase().includes(query) ||
        vendor.address?.street_2?.toLowerCase().includes(query);
      const addressMatch = vendor.address?.street_1?.toLowerCase().includes(query);

      return Boolean(
        storeMatch ||
          ownerMatch ||
          descMatch ||
          districtMatch ||
          subdistrictMatch ||
          addressMatch
      );
    });

    // 3. Filter Kategori (Nama & Slug)
    const matchedCategories = allCategories.filter((category: ProductCategory) => {
      const nameMatch = category.name?.toLowerCase().includes(query);
      const slugMatch = category.slug?.toLowerCase().includes(query);
      return Boolean(nameMatch || slugMatch);
    });

    return NextResponse.json(
      {
        success: true,
        query,
        products: matchedProducts.slice(0, 10),
        vendors: matchedVendors.slice(0, 6),
        categories: matchedCategories.slice(0, 8),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error: unknown) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memproses pencarian",
        products: [],
        vendors: [],
        categories: [],
      },
      { status: 500 }
    );
  }
}
