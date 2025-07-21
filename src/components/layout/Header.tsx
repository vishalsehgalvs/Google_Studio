import { Leaf } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center gap-3">
        <Leaf className="text-primary h-8 w-8" />
        <h1 className="text-3xl font-headline font-bold text-foreground">
          FarmAssist
        </h1>
      </div>
    </header>
  );
}
