import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ className, error, ...props }: InputProps) {
  const isInvalid = Boolean(error) || props['aria-invalid'] === true

  return (
    <div className="w-full">
      <input
        {...props}
        aria-invalid={isInvalid || undefined}
        className={cn(
          'w-full rounded-md border bg-white px-3 py-2 text-sm',
          'border-gray-200 text-[color:var(--color-text-body)] placeholder:text-gray-400',
          'focus:outline-none focus:border-accent',
          isInvalid ? 'border-red-400 focus:border-red-500' : '',
          props.disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : '',
          className
        )}
      />
      {error ? (
        <div className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  )
}

