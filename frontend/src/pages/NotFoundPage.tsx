import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center p-8">
      <div className="rounded-full bg-slate-100 p-6 mb-6">
        <FileQuestion className="h-12 w-12 text-slate-400" />
      </div>
      <h1 className="text-6xl font-bold text-slate-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-slate-700 mb-2">Page Not Found</h2>
      <p className="text-slate-500 mb-6 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
