import { LostItemForm } from '@/components/LostItemForm';

export default function LostItemPage() {
  return (
    <div className="container mx-auto max-w-lg py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">I Lost Something</h1>
      <p className="text-muted-foreground mb-8">Let the community help you find your lost item. Fill out the form below to create a report.</p>
      <LostItemForm />
    </div>
  );
}
