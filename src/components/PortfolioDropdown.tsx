// src/components/PortfolioDropdown.tsx
import React, { useContext, useEffect, useState } from 'react';
import { AppDataContext, PortfolioItem } from '../context/AppDataContext';
import { supabase } from '../supabaseClient';

export default function PortfolioDropdown() {
  const { portfolios, setPortfolios, selectedPortfolio, setSelectedPortfolio, setSelectedProject, setProjects } =
    useContext(AppDataContext)!;
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    // If teams are already loaded, no need to fetch again.
    if (portfolios.length > 0) {
      setLoading(false);
      return;
    }

    // Query the "teams" table from Supabase
    const { data, error } = await supabase
      .from('teams')
      .select('*');
    if (error) {
      console.error("Error fetching teams:", error);
      setLoading(false);
      return;
    }
    const teamsData: PortfolioItem[] = data || [];
    setPortfolios(teamsData);
    setLoading(false);
  };

  useEffect(() => {
      fetchTeams();
  }, []);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedItem = portfolios.find((item) => item.team_id == selectedId) || null;
    setProjects([]);
    setSelectedProject(null);
    setSelectedPortfolio(selectedItem);
  };

  if (loading) {
    return <div>Loading portfolio...</div>;
  }

  return (
    <select 
      id="portfolio" 
      value={selectedPortfolio ? selectedPortfolio.team_id : ""} 
      onChange={handleSelectionChange} 
      className="border rounded p-2 w-full"
    >
      <option value="" disabled>
        Select a portfolio
      </option>
      {portfolios.map((item) => (
        <option key={item.team_id} value={item.team_id}>
          {item.name}
        </option>
      ))}
    </select>
  );
}