import { Outlet } from 'react-router-dom';
import { AssistantProvider } from './assistant/AssistantContext';
import { AIAssistantPanel } from './assistant/AIAssistantPanel';
import { AssistantToggle } from './assistant/AssistantToggle';

export const AdminRouteLayout = () => (
  <AssistantProvider>
    <Outlet />
    <AssistantToggle />
    <AIAssistantPanel />
  </AssistantProvider>
);
