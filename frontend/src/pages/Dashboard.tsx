import React from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardContent from '../components/dashboard/DashboardContent';
import SEO from '../components/common/SEO';
import { generateProjectListSchema, generateBreadcrumbSchema } from '../utils/schemaMarkup';

const Dashboard: React.FC = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://buildityourself.com' },
    { name: 'Dashboard', url: 'https://buildityourself.com/dashboard' }
  ]);

  return (
    <div className="min-h-screen">
      <SEO
        title="My Projects Dashboard - Build it Yourself"
        description="Manage and customize your motorcycle designs. View your projects, track progress, and create new custom bikes."
        type="website"
        schema={breadcrumbSchema}
      />
      <DashboardHeader />
      
      <main className="">
        <DashboardContent />
      </main>
    </div>
  );
};

export default Dashboard;
