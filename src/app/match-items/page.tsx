import { MatchItems } from '@/components/MatchItems';
import { getFoundItems, getLostItems } from '@/app/actions';

export default async function MatchItemsPage() {
  const lostItems = await getLostItems();
  const foundItems = await getFoundItems();

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AI-Powered Item Matching</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select a lost item and a found item from the lists below. Our AI will analyze the descriptions and images to calculate the probability of a match.
        </p>
      </div>
      <MatchItems lostItems={lostItems} foundItems={foundItems} />
    </div>
  );
}
