import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDownload } from 'react-icons/fa';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Step3Report({ report }) {
  const navigate = useNavigate();

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg animate-pulse">Loading Report...</p>
      </div>
    );
  }

  // Support both direct finishInterview payload and MongoDB Interview document
  const questionList = report.questionWiseScore || report.questions || [];
  const totalQ = questionList.length || 1;

  const finalScore = Number((report.finalScore ?? 0).toFixed(1));
  const confidence =
    report.confidence ??
    Number(
      (
        questionList.reduce((acc, q) => acc + (q.confidence || 0), 0) / totalQ
      ).toFixed(1)
    );
  const communication =
    report.communication ??
    Number(
      (
        questionList.reduce((acc, q) => acc + (q.communication || 0), 0) / totalQ
      ).toFixed(1)
    );
  const correctness =
    report.correctness ??
    Number(
      (
        questionList.reduce((acc, q) => acc + (q.correctness || 0), 0) / totalQ
      ).toFixed(1)
    );

  const questionScoreData = questionList.map((item, index) => ({
    name: `Q${index + 1}`,
    score: Number(item.score || 0),
  }));

  const skills = [
    { label: 'Confidence', value: confidence, color: 'bg-emerald-500' },
    { label: 'Communication', value: communication, color: 'bg-teal-500' },
    { label: 'Correctness', value: correctness, color: 'bg-green-500' },
  ];

  let performanceText = '';
  let shortTagline = '';

  if (finalScore >= 8) {
    performanceText = 'Ready for job opportunities.';
    shortTagline = 'Excellent performance .Maintain confidence and';
  } else if (finalScore >= 5) {
    performanceText = 'Needs minor improvement before interviews.';
    shortTagline = 'Good foundation, refine articulation.';
  } else {
    performanceText = 'Significant improvement required.';
    shortTagline = 'Work on clarity and confidence.';
  }

  // Circular Score Ring Calculations
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const scorePercent = Math.min(100, Math.max(0, (finalScore / 10) * 100));
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  // PDF Download Handler (jsPDF + jspdf-autotable)
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Header Banner
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Interview Performance Report', 14, 18);

    // Candidate & Session Metadata
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const roleTitle = report.role ? `Role: ${report.role}` : 'Interview Session';
    const dateText = `Date: ${new Date(report.createdAt || Date.now()).toLocaleDateString()}`;
    doc.text(roleTitle, 14, 38);
    doc.text(dateText, 150, 38);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Overall Score: ${finalScore} / 10`, 14, 48);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 90);
    doc.text(`${performanceText} - ${shortTagline}`, 14, 54);

    // Skill Metrics Table
    autoTable(doc, {
      startY: 62,
      head: [['Skill Metric', 'Score (Out of 10)']],
      body: [
        ['Confidence', `${confidence} / 10`],
        ['Communication', `${communication} / 10`],
        ['Correctness', `${correctness} / 10`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      styles: { fontSize: 10 },
    });

    // Question Breakdown Table
    const tableRows = questionList.map((item, idx) => [
      `Q${idx + 1}`,
      item.question || '-',
      item.answer || 'No answer provided',
      `${item.score || 0}/10`,
      item.feedback || '-',
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['#', 'Question', 'Your Answer', 'Score', 'AI Feedback']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [31, 41, 55], textColor: 255 },
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 48 },
        2: { cellWidth: 52 },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 54 },
      },
    });

    doc.save(`Interview_Report_${report._id || 'Summary'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/70 px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate('/history')}
              className="mt-1 p-3 rounded-full bg-white shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
            >
              <FaArrowLeft className="text-gray-600" />
            </motion.button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                Interview Analytics Dashboard
              </h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                AI-powered performance insights and question breakdown
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleDownloadPDF}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2 font-semibold text-sm sm:text-base cursor-pointer self-start sm:self-auto"
          >
            <FaDownload size={15} />
            <span>Download PDF</span>
          </motion.button>
        </motion.div>

        {/* Main Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 items-stretch">
          
          {/* Left Column (5 cols): Overall Performance Circle + Skill Line Bars */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 min-w-0 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-6"
          >
            <div className="flex flex-col items-center text-center">
              <h2 className="text-lg font-bold text-gray-800 mb-5">
                Overall Performance
              </h2>

              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                  />
                  <motion.circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke="#22c55e"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-gray-800">
                    {finalScore}
                  </span>
                  <span className="text-[11px] font-bold tracking-wider text-gray-400 mt-0.5">
                    OUT OF 10
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-gray-800 mt-5">
                {performanceText}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{shortTagline}</p>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Confidence, Communication, Correctness Line Bars */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Skill Metrics
              </h4>
              {skills.map((skill, idx) => {
                const percent = Math.min(100, Math.max(0, (skill.value / 10) * 100));
                return (
                  <div key={skill.label} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">
                        {skill.label}
                      </span>
                      <span className="font-bold text-gray-800">
                        {skill.value}/10
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{
                          duration: 0.8,
                          delay: 0.2 + idx * 0.1,
                          ease: 'easeOut',
                        }}
                        className={`${skill.color} h-full rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column (7 cols): Recharts AreaChart with Stable Width */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 min-w-0 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                Question-Wise Score Trend
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Performance progression across interview questions (0–10 scale)
              </p>
            </div>

            <div className="w-full min-w-0 h-[320px]">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={questionScoreData}
                  margin={{ top: 10, right: 20, left: -15, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value) => [`${value} / 10`, 'Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#22c55e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    activeDot={{
                      r: 6,
                      fill: '#16a34a',
                      stroke: '#fff',
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

        {/* Question-by-Question Detailed Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-gray-800">
            Detailed Question Feedback
          </h2>
          {questionList.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 * idx }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3"
            >
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-semibold text-gray-800">
                  <span className="text-emerald-600 font-bold mr-1.5">
                    Q{idx + 1}.
                  </span>
                  {item.question}
                </h3>
                <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shrink-0">
                  {item.score || 0}/10
                </span>
              </div>
              {item.answer && (
                <p className="text-sm text-gray-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-gray-700">Your Answer: </span>
                  {item.answer}
                </p>
              )}
              {item.feedback && (
                <p className="text-sm text-emerald-700 font-medium">
                  <span className="font-bold">AI Feedback: </span>
                  {item.feedback}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}

export default Step3Report;