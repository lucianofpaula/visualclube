import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-xs font-medium text-zinc-300 uppercase tracking-wider select-none",
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-amber-500 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";
