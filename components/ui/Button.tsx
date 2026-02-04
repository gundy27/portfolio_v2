import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
  href?: string
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  asChild,
  href,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-label inline-flex items-center justify-center transition-colors rounded-md disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-[var(--color-accent-dark)] text-white hover:text-gray-300 disabled:text-gray-500',
    secondary: 'bg-transparent text-accent hover:bg-accent/10',
    outline: 'border border-accent text-accent hover:bg-accent/10'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm'
  }
  
  const classes = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    className
  )
  
  if (asChild && href) {
    return (
      <Link href={href}>
        <span className={classes}>
          {children}
        </span>
      </Link>
    )
  }
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

