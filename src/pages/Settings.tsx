
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Download, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  const { toast } = useToast();
  const [showNotifications, setShowNotifications] = useState(true);
  const [autoStartTracking, setAutoStartTracking] = useState(false);
  const [idleDetection, setIdleDetection] = useState(true);

  const exportData = () => {
    try {
      const timeEntries = localStorage.getItem('timeEntries');
      if (!timeEntries) {
        toast({
          title: "No data to export",
          description: "You haven't tracked any time yet.",
          variant: "destructive"
        });
        return;
      }

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(timeEntries);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "time-tracker-export.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      toast({
        title: "Data exported",
        description: "Your time tracking data has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was a problem exporting your data",
        variant: "destructive"
      });
    }
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to delete all your time tracking data? This cannot be undone.")) {
      localStorage.removeItem('timeEntries');
      toast({
        title: "Data cleared",
        description: "All time tracking data has been deleted"
      });
    }
  };

  const saveSettings = () => {
    // In a real implementation, save these to localStorage or chrome.storage
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          <span>Settings</span>
        </h1>
        
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle>Export & Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Export your time tracking data as a JSON file. You can import this data back or use it in other applications.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={exportData}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <Button 
                onClick={clearAllData}
                variant="destructive"
              >
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle>Extension Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive notifications about your tracking status
                </p>
              </div>
              <Switch
                id="notifications"
                checked={showNotifications}
                onCheckedChange={setShowNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-start">Auto-start tracking</Label>
                <p className="text-sm text-gray-500">
                  Automatically start tracking when you open specific websites
                </p>
              </div>
              <Switch
                id="auto-start"
                checked={autoStartTracking}
                onCheckedChange={setAutoStartTracking}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="idle-detection">Idle detection</Label>
                <p className="text-sm text-gray-500">
                  Pause tracking when you're away from your computer
                </p>
              </div>
              <Switch
                id="idle-detection"
                checked={idleDetection}
                onCheckedChange={setIdleDetection}
              />
            </div>

            <Button onClick={saveSettings} className="w-full mt-4">
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
