import * as React from "react";
import { cn } from "@/lib/utils";

interface ProductFormLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface ProductFormSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

interface ProductFormMainProps {
  children: React.ReactNode;
  className?: string;
}

interface ProductFormSidebarProps {
  children: React.ReactNode;
  className?: string;
}

// Main layout container - responsive grid
export function ProductFormLayout({ children, className }: ProductFormLayoutProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {children}
    </div>
  );
}

// Main content area (spans 2 columns on large screens)
export function ProductFormMain({ children, className }: ProductFormMainProps) {
  return (
    <div className={cn("lg:col-span-2 space-y-6", className)}>
      {children}
    </div>
  );
}

// Sidebar area (spans 1 column, sticky on desktop)
export function ProductFormSidebar({ children, className }: ProductFormSidebarProps) {
  return (
    <div className={cn("lg:col-span-1", className)}>
      <div className="sticky top-24 space-y-6">
        {children}
      </div>
    </div>
  );
}

// Form section wrapper with consistent styling
export function ProductFormSection({ children, className, id }: ProductFormSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "bg-card rounded-lg border border-border shadow-sm",
        className
      )}
    >
      {children}
    </section>
  );
}

// Section header
interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionHeader({ icon, title, description, badge, action }: SectionHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          <h3 className="font-semibold text-foreground">{title}</h3>
          {badge}
        </div>
        {action}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}

// Section content
interface SectionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionContent({ children, className }: SectionContentProps) {
  return (
    <div className={cn("px-6 py-4 space-y-4", className)}>
      {children}
    </div>
  );
}

// Two column grid for form fields
interface FieldGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2;
}

export function FieldGrid({ children, className, columns = 2 }: FieldGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1",
        className
      )}
    >
      {children}
    </div>
  );
}

// Full width field wrapper
interface FullWidthFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FullWidthField({ children, className }: FullWidthFieldProps) {
  return (
    <div className={cn("md:col-span-2", className)}>
      {children}
    </div>
  );
}

export default ProductFormLayout;
