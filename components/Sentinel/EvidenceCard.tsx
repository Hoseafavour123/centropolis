'use client';

import { EvidenceItem } from '@/types/sentinel';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Users, MessageSquare, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvidenceCardProps {
  evidence: EvidenceItem;
  onOpenDetail?: (id: string) => void;
}

const typeIcons = {
  onchain: Database,
  holder: Users,
  social: MessageSquare,
  tx: FileText,
};

const typeColors = {
  onchain: 'bg-blue-500/10 text-blue-500',
  holder: 'bg-purple-500/10 text-purple-500',
  social: 'bg-green-500/10 text-green-500',
  tx: 'bg-orange-500/10 text-orange-500',
};

export function EvidenceCard({ evidence, onOpenDetail }: EvidenceCardProps) {
  const Icon = typeIcons[evidence.type];
  
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-all duration-200 group"
      onClick={() => onOpenDetail?.(evidence.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md", typeColors[evidence.type])}>
              <Icon className="w-4 h-4" />
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase">{evidence.type}</Badge>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {new Date(evidence.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <h4 className="font-semibold text-sm mt-2 group-hover:text-primary transition-colors">
          {evidence.title}
        </h4>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground line-clamp-2">{evidence.content}</p>
      </CardContent>
    </Card>
  );
}