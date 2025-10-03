
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, FileText, FileQuestion, FilePlus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getLostItems } from '@/actions';
import { ItemCard } from '@/components/ItemCard';


export default async function Home() {
  const allLostItems = await getLostItems();
  const activeLostItems = allLostItems.filter(item => item.status === 'open');
  const itemsReturned = allLostItems.filter(item => item.status === 'returned').length;
  const activePosts = activeLostItems.length;
  
  const recentLostItems = [...activeLostItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8">
      
      <div className="relative w-full max-w-5xl bg-gradient-to-r from-blue-500 to-yellow-400 rounded-2xl p-8 md:p-12 text-white overflow-hidden mb-12">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Lost Something? Found Something?
          </h1>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">We'll Help You!</h2>
          <p className="text-lg md:text-xl text-blue-100 max-w-lg mb-8">
            Connect, share, and help each other find what matters on campus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-white/90 text-primary hover:bg-white">
              <Link href="/lost-item">
                <FileQuestion className="mr-2" /> I lost something
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/found-item">
                <FilePlus className="mr-2" /> I found something
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-16">
        <Card className="shadow-lg">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground">Active Posts</p>
              <p className="text-4xl font-bold">{activePosts}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <FileText className="text-primary" size={28}/>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground">Items Returned</p>
              <p className="text-4xl font-bold">{itemsReturned}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="text-green-600" size={28}/>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="w-full max-w-5xl">
        <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Recently Lost Items</h2>
        {recentLostItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentLostItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-16">No lost items have been reported yet.</p>
        )}
      </div>

    </div>
  );
}
