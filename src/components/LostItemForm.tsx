
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { addLostItem } from '@/actions';
import { useAuth } from './AuthProvider';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Item name must be at least 2 characters.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  location: z.string().min(3, { message: 'Please specify where you last had the item.' }),
  imageDataUri: z.string().optional(),
  mobileNumber: z.string().optional(),
});

export function LostItemForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      location: '',
      imageDataUri: '',
      mobileNumber: '',
    },
  });

  const imageDataUri = form.watch('imageDataUri');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('imageDataUri', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to report a lost item.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addLostItem({
        ...values,
        ownerId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        userContact: user.email || '',
      });

      if (result.success) {
        toast({
          title: 'Report Filed!',
          description: 'Your lost item report has been created. We hope you find it soon!',
        });
        form.reset();
        router.push('/home');
      } else {
        throw new Error(result.message || 'Failed to add item');
      }
    } catch (error: any) {
       toast({
        title: 'Submission Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="imageDataUri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo of your item</FormLabel>
                   <FormControl>
                    <div>
                       <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      {imageDataUri ? (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                            <Image
                                src={imageDataUri}
                                alt="Uploaded item"
                                fill
                                className="object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7"
                                onClick={() => form.setValue('imageDataUri', '')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                          </div>
                      ) : (
                        <div 
                          className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer"
                           onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="text-muted-foreground mb-2" size={32} />
                          <p className="font-semibold mb-1">Upload a photo of your item</p>
                          <p className="text-xs text-muted-foreground mb-2">If you have a photo, please upload it.</p>
                          <Button type="button" size="sm" variant="outline">Choose File</Button>
                        </div>
                      )}
                    </div>
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Blue Jansport Backpack" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="keys">Keys</SelectItem>
                      <SelectItem value="wallets">Wallets</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your item in detail. Include brand, color, size, and any unique features or contents."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Known Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Library, 2nd Floor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number (Optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Your mobile number" {...field} />
                  </FormControl>
                   <FormDescription>Provide a mobile number for easier contact.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="w-full" onClick={() => form.reset()} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Report Lost Item'}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
