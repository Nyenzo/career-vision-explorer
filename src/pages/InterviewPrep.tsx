import React from 'react';
import Layout from '@/components/layout/Layout';
import { InterviewPreparation } from '../components/interview/InterviewPreparation';
import { Brain } from 'lucide-react';

const InterviewPrep: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Interview Questions Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized interview questions based on your career profile, work experience, and projects
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Brain className="w-4 h-4" />
            <span>AI-powered questions tailored to your profile</span>
          </div>
        </div>

        {/* Main Interview Preparation Component */}
        <InterviewPreparation />
      </div>
    </Layout>
  );
};

export default InterviewPrep;
