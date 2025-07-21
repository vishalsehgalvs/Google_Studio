import Header from '@/components/layout/Header';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { LocationProvider } from '@/context/LocationContext';

export default function DashboardPage() {
  return (
    <LocationProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <DashboardTabs />
        </main>
      </div>
    </LocationProvider>
  );
}
