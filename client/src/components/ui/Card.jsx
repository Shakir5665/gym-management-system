import { cn } from "../../lib/cn";

export default function Card({ className, children, ...props }) {
  return (
    <div className={cn("glass p-5", className)} {...props}>
      {children}
    </div>
  );
}

