
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { runMatchItems } from '@/app/actions';
import Image from 'next/image';
import { ThumbsUp, Sparkles, AlertCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import type { Item } from '@/lib/types';

type MatchResult = {
  matchProbability: number;
  reasoning: string;
} | null;

interface MatchItemsProps {
  lostItems: Item[];
  foundItems: Item[];
}

export function MatchItems({ lostItems, foundItems }: MatchItemsProps) {
  const [lostItemId, setLostItemId] = useState<string>('');
  const [foundItemId, setFoundItemId] = useState<string>('');
  const [matchResult, setMatchResult] = useState<MatchResult>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async () => {
    if (!lostItemId || !foundItemId) {
      setError('Please select both a lost and a found item.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setMatchResult(null);

    try {
      const result = await runMatchItems(lostItemId, foundItemId);
       if (result.matchProbability === 0 && result.reasoning.includes('error')) {
        setError(result.reasoning);
        setMatchResult(null);
      } else {
        setMatchResult(result);
      }
    } catch (e: any) {
      setError('An unexpected error occurred. Please try again.');
      setMatchResult(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectedLostItem = lostItems.find(item => item.id === lostItemId);
  const selectedFoundItem = foundItems.find(item => item.id === foundItemId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Select Items to Compare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="font-medium">Lost Item</label>
            <Select onValueChange={setLostItemId} value={lostItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lost item" />
              </SelectTrigger>
              <SelectContent>
                {lostItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
             {selectedLostItem && (
                <div className="flex items-center gap-4 pt-2">
                    <Image src={selectedLostItem.imageUrl} alt={selectedLostItem.name} width={80} height={80} className="rounded-md object-cover" />
                    <div>
                        <p className="font-semibold">{selectedLostItem.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{selectedLostItem.description}</p>
                    </div>
                </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="font-medium">Found Item</label>
            <Select onValueChange={setFoundItemId} value={foundItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a found item to compare" />
              </SelectTrigger>
              <SelectContent>
                {foundItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
             {selectedFoundItem && (
                <div className="flex items-center gap-4 pt-2">
                    <Image src={selectedFoundItem.imageUrl} alt={selectedFoundItem.name} width={80} height={80} className="rounded-md object-cover" />
                    <div>
                        <p className="font-semibold">{selectedFoundItem.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{selectedFoundItem.description}</p>
                    </div>
                </div>
            )}
          </div>
          <Button onClick={handleMatch} disabled={isLoading || !lostItemId || !foundItemId} className="w-full bg-accent hover:bg-accent/90">
            {isLoading ? 'Matching...' : 'Run AI Match'}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> AI Match Result</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[280px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Sparkles className="animate-spin text-accent" />
                <p>Analyzing items...</p>
            </div>
          ) : error ? (
             <div className="text-center text-destructive flex flex-col items-center gap-2">
                <AlertCircle />
                <p>{error}</p>
             </div>
          ) : matchResult ? (
            <div className="w-full space-y-4">
              <div className='text-center'>
                 <p className="text-sm text-muted-foreground">Match Probability</p>
                 <p className="text-5xl font-bold text-primary">{Math.round(matchResult.matchProbability * 100)}%</p>
              </div>

              <Progress value={matchResult.matchProbability * 100} className="w-full" />
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2"><ThumbsUp size={16}/> Reasoning</h4>
                <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md">{matchResult.reasoning}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center">Select items and run the match to see results.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
