import { CloudOff, SearchX, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ApiError } from '@/lib/api';

export function ErrorState({ error }: { error: unknown }) {
  if (error instanceof ApiError && error.isDatabaseUnreachable) {
    return (
      <Alert variant="destructive">
        <CloudOff className="size-4" />
        <AlertTitle>CognoDB is unreachable</AlertTitle>
        <AlertDescription>
          The API couldn&apos;t reach the graph database. It may be waking up from idle on the free tier — try
          again in a moment.
        </AlertDescription>
      </Alert>
    );
  }

  if (error instanceof ApiError && error.isNotFound) {
    return (
      <Alert>
        <SearchX className="size-4" />
        <AlertTitle>Not found</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <TriangleAlert className="size-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{error instanceof Error ? error.message : 'Please try again.'}</AlertDescription>
    </Alert>
  );
}
