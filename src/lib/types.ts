export type Item = {
  id: string;
  type: 'lost' | 'found';
  name: string;
  description: string;
  imageUrl: string;
  imageDataUri: string;
  location?: string;
  aiHint?: string;
  category: string;
  date: string;
  status: 'open' | 'returned';
  userName: string;
  userContact: string;
  submittedToOffice?: boolean;
  ownerId?: string;
};

export type UserCredentials = {
  email: string;
  password: string
}
