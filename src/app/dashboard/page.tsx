import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { LocationProvider } from '@/context/LocationContext';
import { AudioPlayerProvider } from '@/context/AudioPlayerContext';

export default function DashboardPage() {
  return (
    <AudioPlayerProvider>
      <LocationProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <DashboardTabs />
        </div>
      </LocationProvider>
    </AudioPlayerProvider>
  );
}
