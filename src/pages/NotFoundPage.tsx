import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[60dvh] flex items-center justify-center px-6">
      <div className="max-w-xs w-full text-center space-y-4 animate-fade-in">
        <div className="text-6xl font-display font-extrabold text-zinc-200 dark:text-zinc-800">
          404
        </div>
        <h1 className="font-display font-bold text-lg text-zinc-900 dark:text-zinc-50">
          Page not found
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button fullWidth onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
