import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { TutorialSidebar } from "@/components/tutorial/TutorialSidebar";
import { getTutorialBySlug, getAllTutorialChapters } from "@/lib/tutorialData";
import { PanduanJsonLd } from "@/components/seo/PanduanJsonLd";

export const revalidate = 3600; // Materi panduan revalidasi tiap 1 jam
type TutorialPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const chapters = getAllTutorialChapters();
  return chapters.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({
  params,
}: TutorialPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const result = getTutorialBySlug(slug);

  if (!result) {
    return { title: "Panduan Tidak Ditemukan - Mas Chan Digital" };
  }

  const { chapter } = result;
  const pageTitle = `${chapter.title} - Panduan Vendor Mas Chan Digital`;
  const pageDesc = chapter.shortDescription;

  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `https://maschandigital.id/panduan/${chapter.slug}`,
      siteName: "Mas Chan Digital",
      locale: "id_ID",
      type: "article",
      images: [
        {
          url: "/mas-chan-digital.webp",
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: ["/mas-chan-digital.webp"],
    },
  };
}

export default async function SingleTutorialLessonPage({
  params,
}: TutorialPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const result = getTutorialBySlug(slug);

  if (!result) {
    notFound();
  }

  const { chapter, prev, next } = result;

  return (
    <div className="space-y-8 py-8 sm:py-12">
      <PanduanJsonLd chapter={chapter} />
      {/* Breadcrumb */}
      <SectionContainer className="py-0">
        <nav
          aria-label="Breadcrumb"
          className="text-slate-500 dark:text-slate-400 text-xs"
        >
          <ol className="flex flex-wrap items-center gap-2 m-0 p-0 list-none">
            <li>
              <Link
                href="/"
                className="hover:text-brand-800 dark:hover:text-brand-400 transition-colors"
              >
                Beranda
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/panduan"
                className="hover:text-brand-800 dark:hover:text-brand-400 transition-colors"
              >
                Pusat Panduan
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-bold text-slate-700 dark:text-slate-300">
              Modul {chapter.moduleNumber}
            </li>
            <li aria-hidden="true">/</li>
            <li
              aria-current="page"
              className="max-w-xs font-bold text-brand-800 dark:text-brand-400 truncate"
            >
              {chapter.title}
            </li>
          </ol>
        </nav>
      </SectionContainer>

      {/* Main LMS Layout: Sidebar (Kiri) + Konten Materi (Kanan) */}
      <SectionContainer className="py-0">
        <div className="flex lg:flex-row flex-col items-start gap-8">
          {/* 1. Left LMS Sidebar Curriculum */}
          <TutorialSidebar />

          {/* 2. Main Lesson Article Body */}
          <article className="flex-1 space-y-8 bg-white dark:bg-surface-darkCard shadow-subtle p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full">
            {/* Lesson Header */}
            <header className="space-y-3 pb-6 border-slate-100 dark:border-slate-800 border-b">
              <div className="flex items-center gap-3 font-medium text-slate-400 text-xs">
                <span className="bg-brand-50 dark:bg-brand-950/80 px-2.5 py-0.5 rounded-full font-mono font-bold text-brand-800 dark:text-brand-300">
                  Modul {chapter.moduleNumber}: {chapter.moduleTitle}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Estimasi baca: {chapter.estimatedMinutes} menit</span>
                </span>
              </div>

              <h1 className="font-slab font-black text-slate-900 dark:text-white text-2xl sm:text-3xl leading-tight">
                {chapter.title}
              </h1>

              <p className="font-normal text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {chapter.content.overview}
              </p>
            </header>

            {/* Step-by-Step Instructions */}
            <section aria-labelledby="steps-heading" className="space-y-6">
              <h2
                id="steps-heading"
                className="flex items-center gap-2 font-slab font-bold text-slate-900 dark:text-white text-lg"
              >
                <FileText className="w-5 h-5 text-brand-600" />
                <span>Langkah-Langkah Pelaksanaan:</span>
              </h2>

              <div className="space-y-6">
                {chapter.content.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-5 border border-slate-200/80 dark:border-slate-800 rounded-2xl"
                  >
                    <h3 className="flex items-center gap-2 font-slab font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      <span className="flex justify-center items-center bg-brand-800 rounded-full w-6 h-6 text-white text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step.title}</span>
                    </h3>
                    <p className="pl-8 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {step.description}
                    </p>
                    {step.tips && (
                      <div className="flex items-start gap-2 bg-amber-50/80 dark:bg-amber-950/40 mt-2 ml-8 p-3 border border-amber-200/80 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs">
                        <Lightbulb className="mt-0.5 w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          <strong>Tips Praktis:</strong> {step.tips}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Pro Tip Callout Box */}
            {chapter.content.proTip && (
              <aside
                aria-label="Tips Ahli"
                className="space-y-1.5 bg-brand-50/70 dark:bg-brand-950/60 shadow-xs p-5 border border-brand-200 dark:border-brand-800 rounded-2xl text-brand-900 dark:text-brand-200"
              >
                <div className="flex items-center gap-2 font-slab font-bold text-brand-800 dark:text-brand-300 text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Kiat Sukses Penjualan Mas Chan:</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  {chapter.content.proTip}
                </p>
              </aside>
            )}

            {/* FAQ Section */}
            {chapter.content.faq && chapter.content.faq.length > 0 && (
              <section
                aria-labelledby="lesson-faq-heading"
                className="space-y-4 pt-4 border-slate-100 dark:border-slate-800 border-t"
              >
                <h3
                  id="lesson-faq-heading"
                  className="flex items-center gap-2 font-slab font-bold text-slate-900 dark:text-white text-base"
                >
                  <HelpCircle className="w-4 h-4 text-brand-600" />
                  <span>Pertanyaan Seputar Materi Ini:</span>
                </h3>
                <div className="space-y-3">
                  {chapter.content.faq.map((item, idx) => (
                    <div
                      key={idx}
                      className="space-y-1 bg-slate-50 dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-xl"
                    >
                      <h4 className="font-slab font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {item.question}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* LMS Next & Previous Navigation Bar */}
            <footer className="flex sm:flex-row flex-col justify-between items-center gap-4 pt-6 border-slate-100 dark:border-slate-800 border-t">
              {prev ? (
                <Link
                  href={`/panduan/${prev.slug}`}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl w-full sm:w-auto font-bold text-slate-700 dark:text-slate-300 text-xs transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-brand-600" />
                  <div className="text-left">
                    <span className="block font-normal text-[10px] text-slate-400">
                      Materi Sebelumnya
                    </span>
                    <span className="block max-w-[200px] truncate">
                      {prev.title}
                    </span>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {next ? (
                <Link
                  href={`/panduan/${next.slug}`}
                  className="flex justify-between sm:justify-end items-center gap-2 bg-brand-gradient shadow-subtle p-3.5 rounded-2xl w-full sm:w-auto font-bold text-white text-xs hover:scale-[1.02] transition-transform"
                >
                  <div className="text-left sm:text-right">
                    <span className="block font-normal text-[10px] text-amber-200">
                      Materi Selanjutnya
                    </span>
                    <span className="block max-w-[200px] truncate">
                      {next.title}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>
              ) : (
                <Link
                  href="/panduan"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-subtle p-3.5 rounded-2xl w-full sm:w-auto font-bold text-white text-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesai Seluruh Panduan</span>
                </Link>
              )}
            </footer>
          </article>
        </div>
      </SectionContainer>
    </div>
  );
}
