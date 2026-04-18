import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export { Skeleton };

// Statistics Card Skeleton
export const StatsCardSkeleton: React.FC = () => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-4 w-32" />
    </CardContent>
  </Card>
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <tr className="border-b">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="p-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Job Card Skeleton
export const JobCardSkeleton: React.FC = () => (
  <Card className="p-6">
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  </Card>
);

// Applicant Card Skeleton
export const ApplicantCardSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4 p-4 border rounded-lg">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
    <Skeleton className="h-8 w-20" />
  </div>
);

// Dashboard Stats Grid Skeleton
export const DashboardStatsGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <StatsCardSkeleton key={i} />
    ))}
  </div>
);

// Job Seeker Dashboard Skeleton
export const JobSeekerDashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[#f1f5f9]">
    <div className="pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-8">
          <ProfileCardSkeleton />
          <RecentActivityCardSkeleton />
        </div>
        <div className="lg:col-span-8 flex flex-col gap-8">
          <ProfileCompletionCardSkeleton />
          <DashboardStatsGridSkeleton />
        </div>
      </div>
    </div>
  </div>
);

// Employer Dashboard Skeleton
export const EmployerDashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-64" />
      </CardHeader>
      <CardContent>
        <DashboardStatsGridSkeleton />
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-64" />
      </CardHeader>
      <CardContent>
        <RecentApplicationsTableSkeleton />
      </CardContent>
    </Card>
  </div>
);

// Job Listings Table Skeleton
export const JobListingsTableSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-8 w-64" /> {/* Search bar */}
      <Skeleton className="h-10 w-32" /> {/* Filter button */}
    </div>
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            {['Job Title', 'Company', 'Location', 'Applications', 'Status', 'Actions'].map((header) => (
              <th key={header} className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRowSkeleton key={i} columns={6} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Recent Applications Table Skeleton
export const RecentApplicationsTableSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <ApplicantCardSkeleton key={i} />
    ))}
  </div>
);

// Profile Card Skeleton
export const ProfileCardSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-full" />
        ))}
      </div>
    </CardContent>
  </Card>
);

// Generic Content Skeleton
export const ContentSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
    ))}
  </div>
);

// Page Header Skeleton
export const PageHeaderSkeleton: React.FC = () => (
  <div className="space-y-4 mb-8">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-96" />
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="space-y-6">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <Skeleton className="h-10 w-32" />
  </div>
);

export const PageLoaderSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background">
    <div className="border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Skeleton className="h-8 w-32" />
        <div className="hidden gap-3 sm:flex">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4 max-w-2xl" />
        <Skeleton className="h-5 w-1/2 max-w-xl" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  </div>
);

export const AuthPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex items-center justify-center px-4">
    <Card className="w-full max-w-md border-0 shadow-2xl shadow-blue-950/5">
      <CardHeader className="space-y-3 pb-2">
        <Skeleton className="mx-auto h-9 w-40" />
        <Skeleton className="mx-auto h-4 w-72 max-w-full" />
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <div className="flex items-center justify-between gap-3 pt-2">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-40 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export const CallbackSkeleton: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <Card className="w-full max-w-md border-0 shadow-xl">
      <CardHeader className="space-y-3 text-center pb-2">
        <Skeleton className="mx-auto h-8 w-56" />
        <Skeleton className="mx-auto h-4 w-72 max-w-full" />
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <Skeleton className="mx-auto h-14 w-14 rounded-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
      </CardContent>
    </Card>
  </div>
);

// ─── Job Details Page Skeleton ──────────────────────────────────────────────
// Mirrors: 12-col grid — 8-col main (header card + details card) + 4-col sidebar
export const JobDetailsSkeleton: React.FC = () => (
  <div className="min-h-screen bg-surface">
    <div className="pt-12 pb-20 px-6 max-w-7xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main content — 8 cols */}
        <div className="lg:col-span-8 space-y-8">
          {/* Job header card */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <div className="flex flex-wrap gap-2 pt-1">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
              </div>
            </div>
          </Card>
          {/* Job details card */}
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <Skeleton className="h-6 w-32 mt-4" />
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full" />
              ))}
            </div>
          </Card>
        </div>
        {/* Sidebar — 4 cols */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Action card */}
          <Card className="p-6 space-y-4">
            <Skeleton className="h-10 w-full rounded-full" />
            <Skeleton className="h-10 w-full rounded-full" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </Card>
          {/* Company info card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Card>
        </aside>
      </div>
    </div>
  </div>
);

// ─── Profile Page Skeleton ───────────────────────────────────────────────────
// Mirrors: employer 4-col layout (1-col sidebar + 3-col main cards)
export const ProfilePageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[#eef1f5]">
    <div className="container py-8 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-11 w-32 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-3xl border border-slate-200 shadow-none">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <Skeleton className="h-32 w-32 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-5 w-20 mx-auto rounded-full" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border border-slate-200 shadow-none">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right column — 3 cards */}
        <div className="lg:col-span-3 space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="rounded-3xl border border-slate-200 shadow-none">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Profile Completion Card Skeleton ────────────────────────────────────────
// Mirrors: Card with title, progress bar, next-step box, checklist items
export const ProfileCompletionCardSkeleton: React.FC = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
    <CardHeader>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-36" />
      </div>
      <Skeleton className="h-4 w-64 mt-1" />
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-40" />
      </div>
      {/* Next step box */}
      <div className="rounded-lg p-3 border space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
      {/* Checklist */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// ─── Recent Activity Card Skeleton ───────────────────────────────────────────
// Mirrors: Card with 3–4 activity rows (icon dot + text + time)
export const RecentActivityCardSkeleton: React.FC = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
    <CardHeader>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-4 w-48 mt-1" />
    </CardHeader>
    <CardContent className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <div className="flex-1 space-y-1">
            <Skeleton className={`h-4 ${i % 2 === 0 ? 'w-3/4' : 'w-5/6'}`} />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

// ─── Saved Job Card Skeleton ─────────────────────────────────────────────────
// Mirrors: article row — avatar + title block + badges + action buttons
export const SavedJobCardSkeleton: React.FC = () => (
  <article className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-32" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    </div>
  </article>
);

// ─── Applicants Table Row Skeleton ───────────────────────────────────────────
// Mirrors: AllApplicants <tr> with 6 <td> columns
export const ApplicantsTableRowSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <>
    {[...Array(rows)].map((_, i) => (
      <tr key={i} className="border-b">
        <td className="p-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        </td>
        <td className="p-4">
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </td>
        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
        <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
        <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
        <td className="p-4">
          <div className="flex items-center justify-end gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </td>
      </tr>
    ))}
  </>
);
