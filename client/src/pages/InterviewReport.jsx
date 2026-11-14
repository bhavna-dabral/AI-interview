import React, { useState, useEffect } from 'react';
import { ServerUrl } from '../App';
import Step3Report from '../components/Step3Report';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function InterviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await axios.get(`${ServerUrl}/api/interview/report/${id}`, {
          withCredentials: true, // Fixed: capital C
        });
        console.log(result.data);
        setReport(result.data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(true);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]); // Fixed: runs only when `id` changes

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-lg font-medium">
          Failed to load interview report.
        </p>
        <button
          type="button"
          onClick={() => navigate('/history')}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition cursor-pointer"
        >
          Back to History
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg animate-pulse">Loading Report...</p>
      </div>
    );
  }

  // Fixed: wrapped in parentheses so JS doesn't insert an early semicolon
  return <Step3Report report={report} />;
}

export default InterviewReport;