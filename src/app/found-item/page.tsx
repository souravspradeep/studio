import { FoundItemForm } from '@/components/FoundItemForm';

export default function FoundItemPage() {
  return (
    <div className="container mx-auto max-w-lg py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">I Found Something</h1>
      <p className="text-muted-foreground mb-8">
        Thank you for helping our community. Fill out the form below to report an item you&apos;ve found.
      </p>
      <FoundItemForm />
    </div>
  );
}
