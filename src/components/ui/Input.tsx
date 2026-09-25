import { cn } from "@/lib/utils";
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props }, ref
) {
  const inputId = id ?? props.name;
  return (
    <div>
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <input ref={ref} id={inputId} className={cn("input", error && "border-red-500", className)} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string };
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, id, children, ...props }, ref
) {
  const inputId = id ?? props.name;
  return (
    <div>
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <select ref={ref} id={inputId} className={cn("input", error && "border-red-500", className)} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string };
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, ...props }, ref
) {
  const inputId = id ?? props.name;
  return (
    <div>
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <textarea ref={ref} id={inputId} className={cn("input", error && "border-red-500", className)} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});
