
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Clock, Play, Pause, Stop, Calendar, Settings } from "lucide-react";
import TimeTrackingHistory from "@/components/TimeTrackingHistory";
import { useToast } from "@/hooks/use-toast";

interface TimeEntry {
  id: string;
  taskName: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in seconds
}

const Index = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const { toast } = useToast();

  // Load saved entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('timeEntries');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        // Convert string dates back to Date objects
        const formattedEntries = parsed.map((entry: any) => ({
          ...entry,
          startTime: new Date(entry.startTime),
          endTime: entry.endTime ? new Date(entry.endTime) : null
        }));
        setTimeEntries(formattedEntries);
      } catch (error) {
        console.error("Error loading saved time entries:", error);
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (isTracking) {
      interval = window.setInterval(() => {
        setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  const startTracking = () => {
    if (!currentTask.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a task name before starting",
        variant: "destructive"
      });
      return;
    }

    const now = new Date();
    setStartTime(now);
    setIsTracking(true);
    setElapsedTime(0);
    
    toast({
      title: "Tracking started",
      description: `Now tracking: ${currentTask}`
    });
  };

  const pauseTracking = () => {
    setIsTracking(false);
    toast({
      title: "Tracking paused",
      description: `Paused tracking for: ${currentTask}`
    });
  };

  const stopTracking = () => {
    if (!startTime) return;
    
    const now = new Date();
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      taskName: currentTask,
      startTime: startTime,
      endTime: now,
      duration: elapsedTime
    };

    setTimeEntries((prevEntries) => [newEntry, ...prevEntries]);
    setIsTracking(false);
    setCurrentTask("");
    setElapsedTime(0);
    setStartTime(null);

    toast({
      title: "Tracking completed",
      description: `Saved entry for: ${currentTask}`
    });
  };

  const deleteEntry = (id: string) => {
    setTimeEntries((prevEntries) => prevEntries.filter(entry => entry.id !== id));
    toast({
      title: "Entry deleted",
      description: "Time entry has been removed"
    });
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      remainingSeconds.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Clock className="h-8 w-8" />
          <span>Time Tracker</span>
        </h1>
        
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle>Track Your Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  placeholder="What are you working on?"
                  disabled={isTracking}
                  className="mb-2"
                />
                <div className="text-4xl font-mono text-center py-4">
                  {formatTime(elapsedTime)}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-2">
            {!isTracking ? (
              <Button onClick={startTracking} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
            ) : (
              <>
                <Button 
                  onClick={pauseTracking} 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
                <Button 
                  onClick={stopTracking} 
                  variant="destructive" 
                  className="flex items-center gap-2"
                >
                  <Stop className="h-4 w-4" />
                  Stop
                </Button>
              </>
            )}
          </CardFooter>
        </Card>

        <TimeTrackingHistory 
          timeEntries={timeEntries} 
          onDelete={deleteEntry} 
          formatTime={formatTime} 
        />
      </div>
    </div>
  );
};

export default Index;
