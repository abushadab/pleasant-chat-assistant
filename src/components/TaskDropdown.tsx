// src/components/TaskDropdown.tsx
import React, { useContext, useEffect, useState } from 'react';
import { AppDataContext, Task } from '../context/AppDataContext';
import { supabase } from '../supabaseClient';

export default function TaskDropdown() {
  const { tasks, setTasks, selectedProject, selectedTask, setSelectedTask } =
    useContext(AppDataContext)!;
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!selectedProject) {
      console.log("selected project not available");
      setLoading(false);
      return;
    }

    // Query the "tasks" table from Supabase filtered by the selected project's id
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', selectedProject.project_id);

    if (error) {
      console.error("Error fetching tasks:", error);
      setLoading(false);
      return;
    }
    const tasksData: Task[] = data || [];
    setTasks(tasksData);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchTasks();
  }, [selectedProject]);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedItem = tasks.find((item) => item.task_id == selectedId) || null;
    setSelectedTask(selectedItem);
  };

  if (loading) {
    return <div>Loading Task...</div>;
  }

  return (
    <select 
      id="task" 
      value={selectedTask ? selectedTask.task_id : ""} 
      onChange={handleSelectionChange} 
      className="border rounded p-2 w-full"
    >
      <option value="" disabled>
        Select a Task
      </option>
      {tasks.map((item) => (
        <option key={item.task_id} value={item.task_id}>
          {item.title}
        </option>
      ))}
    </select>
  );
}