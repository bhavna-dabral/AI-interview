import React, { useState } from "react";
import { motion } from "motion/react";

import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
  FaSlidersH,
  FaCheckCircle,
} from "react-icons/fa";

import axios from "axios";
import { ServerUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";

function Step1SetUp({ onStart }) {
  // Fix 1: Correct useSelector syntax
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");

  const [resumeFile, setResumeFile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");

  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Fix 2: Declare loading state
  const [loading, setLoading] = useState(false);

  const backendBaseUrl = ServerUrl || "http://localhost:8000";

  // Resume Upload and Analysis
  const handleUploadedResume = async () => {
    if (!resumeFile || analyzing) return;

    // Validate PDF
    if (resumeFile.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    // Validate file size (5 MB)
    if (resumeFile.size > 5 * 1024 * 1024) {
      alert("Resume size should not exceed 5 MB.");
      return;
    }

    setAnalyzing(true);

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      console.log("Uploading resume:", resumeFile.name);

      const result = await axios.post(
        `${backendBaseUrl}/api/interview/resume`,
        formData,
        {
          withCredentials: true,
        }
      );

      console.log("Resume Analysis Result:", result.data);

      const data = result.data;

      setRole(data.role || "");
      setExperience(data.experience || "");
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setSkills(Array.isArray(data.skills) ? data.skills : []);
      setResumeText(data.resumeText || "");

      setAnalysisDone(true);

      alert("Resume analyzed successfully!");
    } catch (error) {
      console.error("Resume Analysis Error:", error);
      console.error("Backend Error:", error.response?.data);
      console.error("Status Code:", error.response?.status);

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Resume analysis failed. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // Start Interview & Generate Questions
  const handleStart = async () => {
    if (!role.trim() || !experience.trim()) {
      alert("Please enter your role and experience.");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        `${backendBaseUrl}/api/interview/generate-questions`,
        {
          role,
          experience,
          mode,
          resumeText,
          projects,
          skills,
        },
        { withCredentials: true }
      );

      console.log("Generated Questions Data:", result.data);

      if (userData && result.data.creditsLeft !== undefined) {
        dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }));
      }

      setLoading(false);
      
      if (onStart) {
        onStart(result.data);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      setLoading(false);
      alert(
        error.response?.data?.message ||
          "Failed to generate interview questions. Please try again."
      );
    }
  };

  const isFormValid = Boolean(role.trim() && experience.trim());

  return (
    <div className="min-h-screen w-full bg-slate-100 py-6 px-4 sm:px-6 md:px-8 overflow-y-auto flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden border border-slate-200/80 h-auto md:min-h-[600px] my-auto"
      >
        {/* Left Informational Hero Banner */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 md:p-10 text-white flex flex-col justify-between h-full">
          <div>
            <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-4">
              AI Mock Simulator
            </span>

            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 leading-tight">
              Start Your AI Interview
            </h2>

            <p className="text-emerald-100 text-xs md:text-sm leading-relaxed mb-6 opacity-90">
              Practice real interactive scenarios powered by AI. Receive real-time feedback and boost your confidence.
            </p>
          </div>

          <div className="space-y-3 my-4">
            {[
              {
                icon: <FaUserTie className="text-emerald-600 text-base" />,
                title: "Custom Role & Experience",
                desc: "Tailored question sets for your stack",
              },
              {
                icon: <FaMicrophoneAlt className="text-emerald-600 text-base" />,
                title: "Smart Voice Interview",
                desc: "Interactive conversational evaluation",
              },
              {
                icon: <FaChartLine className="text-emerald-600 text-base" />,
                title: "Performance Analytics",
                desc: "Actionable scoring & improvement insights",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.1 }}
                className="flex items-center space-x-3.5 bg-white/95 backdrop-blur text-slate-800 p-3.5 rounded-2xl shadow-sm border border-white/20 hover:bg-white transition"
              >
                <div className="p-2.5 bg-emerald-50 rounded-xl shrink-0">
                  {item.icon}
                </div>

                <div>
                  <h4 className="font-semibold text-xs text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-4 text-[11px] text-emerald-200/70 border-t border-white/10 mt-auto">
            Powered by OpenRouter AI & Real-time Speech Engine
          </div>
        </div>

        {/* Right Form Setup Section */}
        <div className="p-6 md:p-10 flex flex-col justify-between bg-white h-full">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Interview Setup
              </h2>
              <p className="text-xs text-slate-500">
                Configure your preferences or upload a resume to auto-fill details.
              </p>
            </div>

            <div className="space-y-4">
              {/* Target Role Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Target Role
                </label>
                <div className="relative">
                  <FaUserTie className="absolute top-3.5 left-3.5 text-slate-400 text-sm" />
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Developer"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition text-xs text-slate-800 placeholder-slate-400 font-medium bg-slate-50/50 focus:bg-white"
                    onChange={(e) => setRole(e.target.value)}
                    value={role}
                  />
                </div>
              </div>

              {/* Experience Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Experience Level
                </label>
                <div className="relative">
                  <FaBriefcase className="absolute top-3.5 left-3.5 text-slate-400 text-sm" />
                  <input
                    type="text"
                    placeholder="e.g. 2 years"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition text-xs text-slate-800 placeholder-slate-400 font-medium bg-slate-50/50 focus:bg-white"
                    onChange={(e) => setExperience(e.target.value)}
                    value={experience}
                  />
                </div>
              </div>

              {/* Interview Mode Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Interview Type
                </label>
                <div className="relative">
                  <FaSlidersH className="absolute top-3.5 left-3.5 text-slate-400 text-sm" />
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition text-xs text-slate-700 bg-slate-50/50 focus:bg-white font-medium appearance-none cursor-pointer"
                  >
                    <option value="Technical">Technical Interview</option>
                    <option value="HR">HR & Behavioral Interview</option>
                  </select>
                </div>
              </div>

              {/* Resume Upload Dropzone */}
              {!analysisDone && (
                <div className="pt-1">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    id="resumeUpload"
                    className="hidden"
                    onChange={(e) => {
                      setResumeFile(e.target.files?.[0] || null);
                    }}
                  />

                  <div
                    onClick={() => {
                      if (!analyzing) {
                        document.getElementById("resumeUpload").click();
                      }
                    }}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/40 transition duration-200 bg-slate-50/30"
                  >
                    <FaFileUpload className="text-2xl mx-auto text-emerald-600 mb-1.5" />

                    <p className="text-xs font-medium text-slate-600">
                      {resumeFile
                        ? resumeFile.name
                        : "Click to upload resume PDF (optional)"}
                    </p>

                    {resumeFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUploadedResume();
                        }}
                        disabled={analyzing}
                        className="mt-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        {analyzing ? "Analyzing Resume..." : "Analyze Resume"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Resume Analysis Output Block */}
              {analysisDone && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 space-y-3 max-h-48 overflow-y-auto"
                >
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <FaCheckCircle className="text-emerald-600 text-xs" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Resume Analysis Result
                    </h3>
                  </div>

                  {projects.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-700 mb-1">
                        Projects:
                      </p>
                      <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pl-1">
                        {projects.map((p, i) => (
                          <li key={i} className="truncate">
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {skills.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-700 mb-1">
                        Skills:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((s, i) => (
                          <span
                            key={i}
                            className="bg-emerald-100/80 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Start Interview Action Button */}
          <div className="pt-6 mt-auto">
            <motion.button
              type="button"
              onClick={handleStart}
              disabled={!isFormValid || loading}
              whileHover={{ scale: isFormValid && !loading ? 1.02 : 1 }}
              whileTap={{ scale: isFormValid && !loading ? 0.98 : 1 }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-md shadow-emerald-600/20 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              <span>{loading ? "Generating Questions..." : "Start Interview"}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Step1SetUp;