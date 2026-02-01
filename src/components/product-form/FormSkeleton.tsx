import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProductFormLayout, ProductFormMain, ProductFormSidebar } from "./ProductFormLayout";

interface FormSkeletonProps {
  showSidebar?: boolean;
  sections?: number;
}

export function FormSkeleton({ showSidebar = true, sections = 4 }: FormSkeletonProps) {
  return (
    <ProductFormLayout>
      <ProductFormMain>
        {Array.from({ length: sections }).map((_, index) => (
          <SectionSkeleton key={index} />
        ))}
      </ProductFormMain>

      {showSidebar && (
        <ProductFormSidebar>
          <SidebarSkeleton />
        </ProductFormSidebar>
      )}
    </ProductFormLayout>
  );
}

// Single section skeleton
function SectionSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-48 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <FieldSkeleton fullWidth />
      </CardContent>
    </Card>
  );
}

// Single field skeleton
function FieldSkeleton({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <div className={`space-y-2 ${fullWidth ? "md:col-span-2" : ""}`}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// Sidebar skeleton
function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Progress skeleton */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>

      {/* Preview card skeleton */}
      <Card>
        <Skeleton className="aspect-[4/3] w-full" />
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  );
}

// Product list skeleton (for edit page)
export function ProductListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-14 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Full page skeleton
export function ProductFormPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Form skeleton */}
      <FormSkeleton />
    </div>
  );
}

export default FormSkeleton;
