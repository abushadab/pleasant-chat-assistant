
// src/components/UrlMappingsPage.tsx
import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { AppDataContext } from '../context/AppDataContext';
import { storageAdapter } from '../utils/storageAdapter';
import { Edit, Trash2, PlusCircle, Link, Building, FolderKanban, ListTodo, Save, X } from 'lucide-react';

interface UrlMapping {
  url_mapping_id: number;
  team_id: number | null;
  project_id: number | null;
  task_id: number | null;
  title: string;
  url: string | null;
  owner_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Team {
  team_id: number;
  name: string;
}

interface Project {
  project_id: number;
  name: string;
  team_id: number;
}

interface Task {
  task_id: number;
  title: string;
  project_id: number;
}

const UrlMappingsPage = () => {
  const { user } = useContext(AppDataContext)!;
  const [urlMappings, setUrlMappings] = useState<UrlMapping[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state for add/edit
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [editingMapping, setEditingMapping] = useState<UrlMapping | null>(null);

  // Dropdown states for form
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | ''>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | ''>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<number | ''>('');

  // Full lists for lookup in table display
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  // Fetch URL mappings
  const fetchUrlMappings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('urlmappings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching URL mappings:', error);
    } else {
      setUrlMappings(data as UrlMapping[]);
    }
    setLoading(false);
  };

  // Save URL mappings to local storage whenever they change
  useEffect(() => {
    storageAdapter.set({ urlMappings }, () => {
      console.log("URL mappings saved to local storage");
    });
  }, [urlMappings]);

  // Fetch teams, all projects and tasks on mount
  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase.from('teams').select('*');
      if (error) {
        console.error('Error fetching teams:', error);
      } else {
        setTeams(data as Team[]);
      }
    };

    const fetchAllProjects = async () => {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) {
        console.error('Error fetching all projects:', error);
      } else {
        setAllProjects(data as Project[]);
      }
    };

    const fetchAllTasks = async () => {
      const { data, error } = await supabase.from('tasks').select('*');
      if (error) {
        console.error('Error fetching all tasks:', error);
      } else {
        setAllTasks(data as Task[]);
      }
    };

    fetchTeams();
    fetchAllProjects();
    fetchAllTasks();
    fetchUrlMappings();
  }, []);

  // When selectedTeam changes, fetch its projects for the form dropdown.
  useEffect(() => {
    const fetchProjects = async () => {
      if (selectedTeam !== '') {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('team_id', selectedTeam);
        if (error) {
          console.error('Error fetching projects:', error);
        } else {
          setProjects(data as Project[]);
          // If editing and the mapping's team matches, retain selectedProject.
          if (editingMapping && editingMapping.team_id === selectedTeam && editingMapping.project_id) {
            setSelectedProject(editingMapping.project_id);
          } else {
            // Otherwise, clear project and tasks.
            setSelectedProject('');
            setTasks([]);
            setSelectedTask('');
          }
        }
      } else {
        setProjects([]);
        // Clear dependent selections
        setSelectedProject('');
        setTasks([]);
        setSelectedTask('');
      }
    };
    fetchProjects();
  }, [selectedTeam, editingMapping]);

  // When selectedProject changes, fetch its tasks for the form dropdown.
  useEffect(() => {
    const fetchTasks = async () => {
      if (selectedProject !== '') {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', selectedProject);
        if (error) {
          console.error('Error fetching tasks:', error);
        } else {
          setTasks(data as Task[]);
          // If editing and the mapping's project matches, retain selectedTask.
          if (editingMapping && editingMapping.project_id === selectedProject && editingMapping.task_id) {
            setSelectedTask(editingMapping.task_id);
          } else {
            setSelectedTask('');
          }
        }
      } else {
        setTasks([]);
        setSelectedTask('');
      }
    };
    fetchTasks();
  }, [selectedProject, editingMapping]);

  // When editing, prefill form fields and dropdown selections.
  const handleEdit = (mapping: UrlMapping) => {
    setEditingMapping(mapping);
    setFormTitle(mapping.title);
    setFormUrl(mapping.url || '');
    setSelectedTeam(mapping.team_id !== null ? mapping.team_id : '');
    setSelectedProject(mapping.project_id !== null ? mapping.project_id : '');
    setSelectedTask(mapping.task_id !== null ? mapping.task_id : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('User not authenticated');
      return;
    }

    // Build mapping payload
    const payload = {
      title: formTitle,
      url: formUrl,
      owner_id: user.id,
      team_id: selectedTeam === '' ? null : selectedTeam,
      project_id: selectedProject === '' ? null : selectedProject,
      task_id: selectedTask === '' ? null : selectedTask,
    };

    if (editingMapping) {
      // Update existing mapping
      const { error } = await supabase
        .from('urlmappings')
        .update(payload)
        .eq('url_mapping_id', editingMapping.url_mapping_id);
      if (error) {
        console.error('Error updating mapping:', error);
      } else {
        setUrlMappings((prev) =>
          prev.map((mapping) =>
            mapping.url_mapping_id === editingMapping.url_mapping_id
              ? { ...mapping, ...payload }
              : mapping
          )
        );
        // Reset form
        setEditingMapping(null);
        resetForm();
      }
    } else {
      // Insert new mapping
      const { data, error } = await supabase
        .from('urlmappings')
        .insert(payload)
        .select(); // returns inserted row(s)
      if (error) {
        console.error('Error adding mapping:', error);
      } else if (data) {
        setUrlMappings((prev) => [data[0] as UrlMapping, ...prev]);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormUrl('');
    setSelectedTeam('');
    setSelectedProject('');
    setSelectedTask('');
    setEditingMapping(null);
  };

  const handleDelete = async (mapping: UrlMapping) => {
    if (window.confirm(`Delete mapping "${mapping.title}"?`)) {
      const { error } = await supabase
        .from('urlmappings')
        .delete()
        .eq('url_mapping_id', mapping.url_mapping_id);
      if (error) {
        console.error('Error deleting mapping:', error);
      } else {
        setUrlMappings((prev) =>
          prev.filter((m) => m.url_mapping_id !== mapping.url_mapping_id)
        );
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Link size={24} className="text-primary-500" />
        URL Mappings
      </h1>

      {/* Form to add or edit a URL mapping */}
      <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          {editingMapping ? (
            <>
              <Edit size={20} className="text-yellow-500" />
              Edit URL Mapping
            </>
          ) : (
            <>
              <PlusCircle size={20} className="text-primary-500" />
              Add New URL Mapping
            </>
          )}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Team, Project, Task */}
          <div className="space-y-4">
            {/* Dropdown for Teams */}
            <div>
              <label className="form-label flex items-center gap-1">
                <Building size={16} className="text-gray-500" />
                Team
              </label>
              <select
                value={selectedTeam}
                onChange={(e) =>
                  setSelectedTeam(e.target.value ? parseInt(e.target.value) : '')
                }
                className="form-select"
                required
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.team_id} value={team.team_id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown for Projects */}
            <div>
              <label className="form-label flex items-center gap-1">
                <FolderKanban size={16} className="text-gray-500" />
                Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) =>
                  setSelectedProject(e.target.value ? parseInt(e.target.value) : '')
                }
                className="form-select"
                required
                disabled={selectedTeam === ''}
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown for Tasks */}
            <div>
              <label className="form-label flex items-center gap-1">
                <ListTodo size={16} className="text-gray-500" />
                Task
              </label>
              <select
                value={selectedTask}
                onChange={(e) =>
                  setSelectedTask(e.target.value ? parseInt(e.target.value) : '')
                }
                className="form-select"
                required
                disabled={selectedProject === ''}
              >
                <option value="">Select a task</option>
                {tasks.map((task) => (
                  <option key={task.task_id} value={task.task_id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Right column - Title, URL, Buttons */}
          <div className="space-y-4">
            {/* Fields for Title and URL */}
            <div>
              <label className="form-label">Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="form-input"
                required
                placeholder="Enter a descriptive title"
              />
            </div>
            <div>
              <label className="form-label">URL</label>
              <input
                type="text"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://example.com"
                pattern="[Hh][Tt][Tt][Pp][Ss]?:\/\/(?:(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)(?:\.(?:[a-zA-Z\u00a1-\uffff0-9]+-?)*[a-zA-Z\u00a1-\uffff0-9]+)*(?:\.(?:[a-zA-Z\u00a1-\uffff]{2,}))(?::\d{2,5})?(?:\/[^\s]*)?"
                className="form-input"
                required
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              {editingMapping && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary flex items-center"
                >
                  <X size={16} />
                  Cancel
                </button>
              )}
              <button type="submit" className="btn btn-primary flex items-center">
                <Save size={16} />
                {editingMapping ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Display list of URL mappings */}
      <div className="table-container overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-2"></div>
            <p className="text-gray-600">Loading mappings...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Title</th>
                <th className="table-header">URL</th>
                <th className="table-header">Team</th>
                <th className="table-header">Project</th>
                <th className="table-header">Task</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {urlMappings.map((mapping) => {
                const teamName =
                  teams.find((team) => team.team_id === mapping.team_id)?.name ||
                  '-';
                const projectName =
                  allProjects.find(
                    (project) => project.project_id === mapping.project_id
                  )?.name || '-';
                const taskTitle =
                  allTasks.find((task) => task.task_id === mapping.task_id)
                    ?.title || '-';

                return (
                  <tr key={mapping.url_mapping_id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{mapping.title}</td>
                    <td className="table-cell">
                      <a
                        href={mapping.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline flex items-center gap-1"
                      >
                        <Link size={14} />
                        {mapping.url}
                      </a>
                    </td>
                    <td className="table-cell">{teamName}</td>
                    <td className="table-cell">{projectName}</td>
                    <td className="table-cell">{taskTitle}</td>
                    <td className="table-cell whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(mapping)}
                          className="btn btn-secondary py-1 px-2"
                        >
                          <Edit size={14} />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(mapping)}
                          className="btn btn-danger py-1 px-2"
                        >
                          <Trash2 size={14} />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {urlMappings.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No URL mappings found. Create your first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UrlMappingsPage;
