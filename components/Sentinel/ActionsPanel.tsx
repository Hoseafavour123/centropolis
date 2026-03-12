'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share, ExternalLink, Save, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ActionsPanelProps {
  analysisId?: string;
  safetyScore?: number;
  onOpenTrade: () => void;
  onSave: () => void;
  onShare: () => void;
  onDownload: () => void;
}

export function ActionsPanel({ 
  analysisId, 
  safetyScore = 0, 
  onOpenTrade, 
  onSave, 
  onShare, 
  onDownload 
}: ActionsPanelProps) {
  const [showRiskModal, setShowRiskModal] = useState(false);
  
  const handleTradeClick = () => {
    if (safetyScore < 40) {
      setShowRiskModal(true);
    } else {
      onOpenTrade();
    }
  };

  const confirmRiskyTrade = () => {
    setShowRiskModal(false);
    onOpenTrade();
  };

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={onSave}>
              <Save className="w-4 h-4" /> Save Report
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={onShare}>
              <Share className="w-4 h-4" /> Share
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={onDownload}>
              <Download className="w-4 h-4" /> Download JSON
            </Button>
          </CardContent>
        </Card>

        <Button 
          className="w-full h-12 bg-primary hover:bg-primary/90 text-lg font-semibold"
          onClick={handleTradeClick}
          disabled={!analysisId}
        >
          <ExternalLink className="w-4 h-4 mr-2" /> Open Trade
        </Button>

        {safetyScore > 0 && (
          <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Data Sources:</span>
              <span className="text-foreground">3 active</span>
            </div>
            <div className="flex justify-between">
              <span>Block Height:</span>
              <span className="font-mono">236,204,371</span>
            </div>
          </div>
        )}
      </div>

      {/* Risk Warning Modal */}
      <Dialog open={showRiskModal} onOpenChange={setShowRiskModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              High Risk Warning
            </DialogTitle>
            <DialogDescription>
              This asset has a safety score of {safetyScore}/100, indicating significant risk 
              factors such as low liquidity or high concentration. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRiskModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmRiskyTrade}>
              I Understand, Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}