import React, { useState, useEffect, useRef } from 'react';
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "../components/Timer.jsx";
import { motion } from 'motion/react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { BsArrowRight } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ServerUrl } from '../App.jsx';

function Step2Interview({ interviewData, onFinish }) {
  const { userData } = useSelector((state) => state.user);
  const { interviewId, questions = [] } = interviewData || {};
  const candidateName = userData?.name || interviewData?.userName || "Candidate";

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];
  const backendBaseUrl = ServerUrl || "http://localhost:8000";

  // Load TTS Voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
      );
      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
      );
      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch {
        // Ignore if already started
      }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
    }
  };

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();

      const humanText = text.replace(/,/g, ",...").replace(/\./g, ". ...");
      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        setIsAIPlaying(false);

        if (isMicOn) {
          startMic();
        }

        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  // Intro and Question Narration
  useEffect(() => {
    if (!selectedVoice) return;

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${candidateName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );

        setIsIntroPhase(false);
      } else if (currentQuestion) {
        setTimeLeft(currentQuestion.timeLimit || 60);
        await new Promise((r) => setTimeout(r, 800));

        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }
    };

    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  // Countdown Timer
  useEffect(() => {
    if (isIntroPhase || !currentQuestion || isSubmitting || feedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, isSubmitting, feedback]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognitionRef.current = recognition;
  }, []);

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);

    try {
      const result = await axios.post(
        `${backendBaseUrl}/api/interview/submit-answer`,
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: (currentQuestion?.timeLimit || 60) - timeLeft,
        },
        { withCredentials: true }
      );

      setFeedback(result.data.feedback);
      await speakText(result.data.feedback);
    } catch (error) {
      console.error("Submit answer error:", error);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(
        `${backendBaseUrl}/api/interview/finish`,
        { interviewId },
        { withCredentials: true }
      );
      if (onFinish) {
        onFinish(result.data);
      }
    } catch (error) {
      console.error("Finish interview error:", error);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      await finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");
    setCurrentIndex((prev) => prev + 1);
  };

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors
        }
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-7xl min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden my-auto">
        
        {/* Left Side: Video & Timer Section */}
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-gray-200">
          
          {/* AI Avatar Video Container */}
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-black">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              loop
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}

          {/* Status & Timer Card */}
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">
                Interview Status
              </span>
              {isAIPlaying && (
                <span className="text-sm font-semibold text-emerald-600 animate-pulse">
                  AI Speaking
                </span>
              )}
            </div>

            <div className="h-px bg-gray-200" />

            {/* Timer Component */}
            <div className="w-full py-2">
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 60} />
            </div>

            <div className="h-px bg-gray-200" />

            {/* Question Counter */}
            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-emerald-600">
                  {currentIndex + 1}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Current Question
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-emerald-600">
                  {questions.length || 5}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Total Questions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Question Display & Answer Interactions */}
        <div className="w-full lg:w-[65%] p-6 sm:p-8 flex flex-col justify-between bg-slate-50/50">
          <div className="flex flex-col flex-1 space-y-6">
            {/* Header Badge & Greeting */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-600">
                AI Smart Interview
              </h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-100/80 px-3 py-1 rounded-full">
                Question {currentIndex + 1} of {questions.length || 5}
              </p>
            </div>

            {/* Main Question Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
                {currentQuestion?.question ||
                  "Tell me about a challenging technical project you worked on and how you handled unexpected bugs or obstacles?"}
              </h3>
            </div>

            {/* Answer Input */}
            <textarea
              placeholder="Type your answer here..."
              onChange={(e) => setAnswer(e.target.value)}
              value={answer}
              disabled={Boolean(feedback)}
              className="flex-1 min-h-[160px] bg-white p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800 shadow-sm disabled:bg-gray-50"
            />

            {/* Voice & Submit Controls OR Feedback Card */}
            {!feedback ? (
              <div className="flex items-center gap-4 mt-6">
                <motion.button
                  onClick={toggleMic}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-white shadow-lg transition cursor-pointer ${
                    isMicOn ? "bg-black" : "bg-red-600"
                  }`}
                >
                  {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={submitAnswer}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Answer"}
                </motion.button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm"
              >
                <p className="text-emerald-800 font-medium mb-4">
                  {feedback}
                </p>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-2 font-semibold cursor-pointer"
                >
                  <span>
                    {currentIndex + 1 >= questions.length ? "Finish & View Results" : "Next Question"}
                  </span>
                  <BsArrowRight size={18} />
                </button>
              </motion.div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (currentIndex < questions.length - 1) {
                  setCurrentIndex((prev) => prev + 1);
                  setAnswer("");
                  setFeedback("");
                }
              }}
              disabled={currentIndex >= questions.length - 1}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-40"
            >
              Skip Question
            </button>
            <button
              type="button"
              onClick={finishInterview}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
            >
              Finish Interview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Step2Interview;