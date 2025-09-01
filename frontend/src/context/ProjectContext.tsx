import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ProjectType } from '../components/common/GlobalProjectSelect';

interface ProjectContextType {
  projectType: ProjectType;
  setProjectType: (type: ProjectType) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projectType, setProjectType] = useState<ProjectType>(() => {
    const saved = localStorage.getItem('selectedProjectType');
    return (saved as ProjectType) || 'bike';
  });

  useEffect(() => {
    localStorage.setItem('selectedProjectType', projectType);
  }, [projectType]);

  return (
    <ProjectContext.Provider value={{ projectType, setProjectType }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
