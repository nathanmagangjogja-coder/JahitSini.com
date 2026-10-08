import type { MetadataRoute } from "next";
import { getServicesRemote } from "@/lib/services";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/layanan", "/cara-kerja", "/hasil-jahitan", "/faq", "/hubungi-kami"];
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = pages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  let serviceEntries: MetadataRoute.Sitemap = [];
  try {
    const services = await getServicesRemote();
    serviceEntries = services.map((s) => ({
      url: `${siteUrl}/layanan/${s.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }));
  } catch {
    // sitemap tetap jalan tanpa halaman layanan
  }

  return [...staticEntries, ...serviceEntries];
}