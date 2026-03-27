'use client';

import { RightPanel } from '@/components/Shared/RightPanel';
import { useRightPanelStore } from '@/store/useRightPanelStore';

export function RightPanelWrapper() {
    const component = useRightPanelStore((state) => state.component);
    return component ? <>{component}</> : <RightPanel />;
}
