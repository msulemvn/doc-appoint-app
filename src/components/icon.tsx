import { cn } from "@/lib/utils";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { type LucideProps } from "lucide-react";
import { type ComponentType, lazy, Suspense } from "react";

export interface IconProps extends Omit<LucideProps, "ref"> {
  name?: string;
  iconNode?: ComponentType<LucideProps>;
}

const lazyIconCache = new Map<string, ComponentType<LucideProps>>();

function getOrCreateLazyIcon(name: string): ComponentType<LucideProps> {
  if (!lazyIconCache.has(name)) {
    lazyIconCache.set(name, lazy(dynamicIconImports[name]));
  }
  return lazyIconCache.get(name)!;
}

export function Icon({
  name,
  iconNode: IconComponent,
  className,
  ...props
}: IconProps) {
  if (name) {
    const LazyIcon = getOrCreateLazyIcon(name);
    return (
      <Suspense fallback={<div className={cn("h-4 w-4", className)} />}>
        {/* eslint-disable-next-line react-hooks/static-components */}
        <LazyIcon className={cn("h-4 w-4", className)} {...props} />
      </Suspense>
    );
  }

  if (IconComponent) {
    return (
      <IconComponent className={cn("h-4 w-4", className)} {...props} />
    );
  }

  return <div className="h-4 w-4" />;
}
