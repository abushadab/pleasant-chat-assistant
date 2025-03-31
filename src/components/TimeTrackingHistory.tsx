
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimeEntry {
  id: string;
  taskName: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in seconds
}

interface TimeTrackingHistoryProps {
  timeEntries: TimeEntry[];
  onDelete: (id: string) => void;
  formatTime: (seconds: number) => string;
}

const TimeTrackingHistory: React.FC<TimeTrackingHistoryProps> = ({ 
  timeEntries, 
  onDelete,
  formatTime
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeOnly = (date: Date): string => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <span>History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeEntries.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            No time entries yet. Start tracking to see your history.
          </div>
        ) : (
          <ScrollArea className="h-[350px]">
            <div className="space-y-3">
              {timeEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="border rounded-md p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{entry.taskName}</h3>
                    <div className="text-sm text-gray-500 flex flex-wrap gap-x-3 mt-1">
                      <span>{formatDate(entry.startTime)}</span>
                      <span>
                        {formatTimeOnly(entry.startTime)} - {entry.endTime ? formatTimeOnly(entry.endTime) : 'In progress'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm">{formatTime(entry.duration)}</div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => onDelete(entry.id)}
                      className="h-8 w-8 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeTrackingHistory;
