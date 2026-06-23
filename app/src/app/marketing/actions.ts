"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { campaigns, products } from "@/db/schema";
import { redirect } from "next/navigation";

const PRODUCT_DEFS = {
  place_traffic: {
    id: "00000000-0000-4000-8001-000000000001",
    productType: "place_traffic" as const,
    title: "네이버 플레이스 유입",
    description: "네이버 플레이스 유입 마케팅 활동 지원 서비스",
    unit: "per_visit_day" as const,
    unitPrice: "100",
    minQty: 10,
    maxQty: 500,
    estDurationDays: 7,
    formSchema: {},
    isActive: true,
  },
  store_traffic: {
    id: "00000000-0000-4000-8002-000000000002",
    productType: "store_traffic" as const,
    title: "스마트스토어 · 쿠팡 트래픽 유입",
    description: "스마트스토어·쿠팡 상품 유입 마케팅 활동 지원 서비스",
    unit: "per_visit_day" as const,
    unitPrice: "80",
    minQty: 10,
    maxQty: 1000,
    estDurationDays: 7,
    formSchema: {},
    isActive: true,
  },
  blog_review: {
    id: "00000000-0000-4000-8003-000000000003",
    productType: "blog_review" as const,
    title: "블로그 기자단",
    description: "블로그 체험단·기자단 모집 서비스",
    unit: "per_item" as const,
    unitPrice: "50000",
    minQty: 1,
    maxQty: 100,
    estDurationDays: 14,
    formSchema: {},
    isActive: true,
  },
} as const;

type ProductKey = keyof typeof PRODUCT_DEFS;

async function upsertProduct(key: ProductKey): Promise<string> {
  const def = PRODUCT_DEFS[key];
  await db.insert(products).values(def).onConflictDoNothing();
  return def.id;
}

export async function createPlaceCampaign(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const storeName = formData.get("store_name") as string;
  const placeUrl = formData.get("place_url") as string;
  const keyword = formData.get("keyword") as string;
  const region = (formData.get("region") as string) || "";
  const mission = (formData.get("mission") as string) || "save";
  const dailyQty = Number(formData.get("daily_qty")) || 50;
  const durationDays = Number(formData.get("duration_days")) || 7;

  if (!storeName || !placeUrl || !keyword) {
    return { error: "필수 항목을 모두 입력해주세요." };
  }

  try {
    const productId = await upsertProduct("place_traffic");
    const totalQty = dailyQty * durationDays;
    const quotedAmount = String(totalQty * 100);

    await db.insert(campaigns).values({
      userId: user.id,
      productId,
      status: "submitted",
      inputs: { storeName, placeUrl, keyword, region, mission },
      dailyQty,
      totalQty,
      quotedAmount,
    });
  } catch (err) {
    console.error("createPlaceCampaign error:", err);
    return { error: "캠페인 생성 중 오류가 발생했습니다." };
  }

  redirect("/marketing/my/campaigns");
}

export async function createShoppingCampaign(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const productName = formData.get("product_name") as string;
  const productUrl = formData.get("product_url") as string;
  const keyword = formData.get("keyword") as string;
  const dailyQty = Number(formData.get("daily_qty")) || 50;
  const durationDays = Number(formData.get("duration_days")) || 7;

  if (!productName || !productUrl || !keyword) {
    return { error: "필수 항목을 모두 입력해주세요." };
  }

  try {
    const productId = await upsertProduct("store_traffic");
    const totalQty = dailyQty * durationDays;
    const quotedAmount = String(totalQty * 80);

    await db.insert(campaigns).values({
      userId: user.id,
      productId,
      status: "submitted",
      inputs: { productName, productUrl, keyword },
      dailyQty,
      totalQty,
      quotedAmount,
    });
  } catch (err) {
    console.error("createShoppingCampaign error:", err);
    return { error: "캠페인 생성 중 오류가 발생했습니다." };
  }

  redirect("/marketing/my/campaigns");
}

export async function createBlogCampaign(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const businessName = formData.get("business_name") as string;
  const intro = formData.get("intro") as string;
  const guideline = (formData.get("guideline") as string) || "";
  const reviewCount = Number(formData.get("review_count")) || 5;

  if (!businessName || !intro) {
    return { error: "필수 항목을 모두 입력해주세요." };
  }

  try {
    const productId = await upsertProduct("blog_review");
    const quotedAmount = String(reviewCount * 50000);

    await db.insert(campaigns).values({
      userId: user.id,
      productId,
      status: "submitted",
      inputs: { businessName, intro, guideline },
      totalQty: reviewCount,
      quotedAmount,
    });
  } catch (err) {
    console.error("createBlogCampaign error:", err);
    return { error: "캠페인 생성 중 오류가 발생했습니다." };
  }

  redirect("/marketing/my/campaigns");
}
