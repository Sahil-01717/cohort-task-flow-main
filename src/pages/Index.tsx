import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { StepSettings } from '@/components/StepSettings';
import { QualityLab } from './QualityLab';
import { UserPerformance } from './UserPerformance';

const Index = () => {
  const [activeItem, setActiveItem] = useState('step');

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
      
      {/* Content area with offset for workflow steps panel */}
      <main className={`flex-1 ${activeItem === 'step' ? 'ml-40' : ''}`}>
        {activeItem === 'step' ? (
          <StepSettings />
        ) : activeItem === 'quality' ? (
          <QualityLab />
        ) : activeItem === 'performance' ? (
          <UserPerformance />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {activeItem.charAt(0).toUpperCase() + activeItem.slice(1)} Section
              </h2>
              <p className="text-muted-foreground">
                This section is under development
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
