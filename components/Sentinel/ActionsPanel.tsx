'use client';

import { SentinelResult } from '@/types/sentinel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Save, Check, Copy, AlertTriangle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ActionsPanelProps {
  analysis: SentinelResult;
  onOpenTrade: () => void;
  onSave?: (id: string) => void;
}

export function ActionsPanel({ analysis, onOpenTrade, onSave }: ActionsPanelProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);

  const handleDownload = () => {
    try {
      const dataStr = JSON.stringify(analysis, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sentinel-report-${analysis.analysisId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Report exported to JSON");
    } catch (err) {
      toast.error("Failed to export report");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/sentinel?id=${analysis.analysisId}`;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success("Analysis link copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleTradeClick = () => {
    if (analysis.finalScore < 40) {
      setShowRiskModal(true);
    } else {
      onOpenTrade();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card/30 border-border/50">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h4 className="text-sm font-semibold">Security Report</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">ID: {analysis.analysisId}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </Button>

            <Button variant="outline" size="sm" onClick={handleShare} className="h-8 gap-1.5 text-xs">
              {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>Share</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSave?.(analysis.analysisId)}
              className="h-8 gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
        onClick={handleTradeClick}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Open Quick Trade
      </Button>

      {/* Risk Warning Modal */}
      <Dialog open={showRiskModal} onOpenChange={setShowRiskModal}>
        <DialogContent className="border-destructive/20 bg-destructive/5 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              High Risk Warning
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              This asset has a critical safety score of <span className="text-destructive font-bold">{analysis.finalScore}/100</span>.
              Trading low-security tokens often results in permanent capital loss due to rug pulls or blacklists.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setShowRiskModal(false)} className="border-border/50">Cancel</Button>
            <Button variant="destructive" onClick={() => { setShowRiskModal(false); onOpenTrade(); }}>
              Proceed at own risk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}