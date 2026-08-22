import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Award,
  HeartHandshake,
  MessageSquare,
  Lock,
  Send,
  Star,
  CheckCircle2,
  Sparkles,
  Download,
  Flame,
  ThumbsUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from 'recharts';
import { INITIAL_PEER_REVIEWS } from '../data/simulationPresets';
import { PeerEvaluation } from '../types';

export const AdaptabilityIndex: React.FC = () => {
  const [reviews, setReviews] = useState<PeerEvaluation[]>(INITIAL_PEER_REVIEWS);
  const [selectedTeammate, setSelectedTeammate] = useState(INITIAL_PEER_REVIEWS[0].targetTeammate);
  const [submittedFeedbackSuccess, setSubmittedFeedbackSuccess] = useState(false);

  // Form state for new / edited evaluation
  const [formState, setFormState] = useState({
    targetTeammate: 'Sarah Chen',
    role: 'Tech Lead / Systems Architect',
    avatar: 'SC',
    composureScore: 5,
    communicationScore: 5,
    flexibilityScore: 4,
    contributionScore: 5,
    rehireRating: 'Strong Yes' as const,
    qualitativeFeedback: '',
  });

  const handleScoreChange = (field: string, val: number) => {
    setFormState({ ...formState, [field]: val });
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();

    const existingIndex = reviews.findIndex((r) => r.targetTeammate === formState.targetTeammate);
    const updatedReview: PeerEvaluation = {
      id: `eval-${Date.now()}`,
      targetTeammate: formState.targetTeammate,
      role: formState.role,
      avatar: formState.avatar,
      composureScore: formState.composureScore,
      communicationScore: formState.communicationScore,
      flexibilityScore: formState.flexibilityScore,
      contributionScore: formState.contributionScore,
      rehireRating: formState.rehireRating,
      qualitativeFeedback: formState.qualitativeFeedback || 'Demonstrated exceptional steadiness during the Day 4 pivot.',
      submittedAt: `Day 5 - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };

    if (existingIndex >= 0) {
      const copy = [...reviews];
      copy[existingIndex] = updatedReview;
      setReviews(copy);
    } else {
      setReviews([...reviews, updatedReview]);
    }

    setSubmittedFeedbackSuccess(true);
    setTimeout(() => setSubmittedFeedbackSuccess(false), 4000);
  };

  // Compute aggregate radar data
  const avgComposure = Number((reviews.reduce((acc, r) => acc + r.composureScore, 0) / reviews.length).toFixed(1));
  const avgCommunication = Number((reviews.reduce((acc, r) => acc + r.communicationScore, 0) / reviews.length).toFixed(1));
  const avgFlexibility = Number((reviews.reduce((acc, r) => acc + r.flexibilityScore, 0) / reviews.length).toFixed(1));
  const avgContribution = Number((reviews.reduce((acc, r) => acc + r.contributionScore, 0) / reviews.length).toFixed(1));
  const avgRehireRatio = Math.round(
    (reviews.filter((r) => r.rehireRating === 'Strong Yes' || r.rehireRating === 'Yes').length / reviews.length) * 100
  );

  const radarData = [
    { metric: 'Composure (Pressure)', score: avgComposure, max: 5 },
    { metric: 'Communication Clarity', score: avgCommunication, max: 5 },
    { metric: 'Architectural Flexibility', score: avgFlexibility, max: 5 },
    { metric: 'Execution Contribution', score: avgContribution, max: 5 },
    { metric: 'Rehire Index', score: (avgRehireRatio / 100) * 5, max: 5 },
  ];

  const overallTeamScore = Math.round(
    ((avgComposure + avgCommunication + avgFlexibility + avgContribution) / 20) * 100
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Assignment 3 Deliverable (Day 5)
              </span>
              <h2 className="text-base font-bold text-slate-100">
                Confidential Peer-Rated Adaptability Index
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl">
              Measures whether you stayed <strong>steady, honest, and easy to work with</strong> when the plan changed under you. In accordance with <strong>Rule #5</strong>, all feedback is confidential and surfaced solely as aggregate team metrics.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <Lock className="w-4 h-4 text-rose-400" />
            <span className="text-slate-300 font-medium">
              Confidentiality Guaranteed (Rule #5)
            </span>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Overall Team Adaptability</span>
            <span className="text-base font-black text-emerald-400 flex items-center gap-1 mt-0.5">
              <Award className="w-4 h-4" /> {overallTeamScore} / 100
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Rehire Recommendation</span>
            <span className="text-base font-black text-indigo-400 flex items-center gap-1 mt-0.5">
              <HeartHandshake className="w-4 h-4" /> {avgRehireRatio}% Positive
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Composure Score</span>
            <span className="text-base font-black text-slate-100 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> {avgComposure} / 5.0
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Submissions Processed</span>
            <span className="text-base font-black text-rose-400 flex items-center gap-1 mt-0.5">
              <UserCheck className="w-4 h-4" /> {reviews.length} Peer Audits
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Confidential Evaluation Form) - Right (Aggregate Radar & Anonymized Feedback) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Submit Confidential Peer Evaluation
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Rubric Criteria
              </span>
            </div>

            {submittedFeedbackSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Evaluation submitted securely. Aggregate radar chart updated!</span>
              </div>
            )}

            <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
              {/* Teammate Selection */}
              <div>
                <label className="text-slate-300 font-bold block mb-2">
                  Select Teammate to Evaluate:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'Sarah Chen', role: 'Tech Lead / Architect', av: 'SC' },
                    { name: 'Kwame Mensah', role: 'Backend Engineer', av: 'KM' },
                    { name: 'Maya Lin', role: 'Frontend & Support Tool', av: 'ML' },
                    { name: 'Alex Rivera', role: 'DevOps & SRE', av: 'AR' },
                  ].map((peer) => {
                    const isSelected = formState.targetTeammate === peer.name;
                    return (
                      <button
                        type="button"
                        key={peer.name}
                        onClick={() =>
                          setFormState({
                            ...formState,
                            targetTeammate: peer.name,
                            role: peer.role,
                            avatar: peer.av,
                          })
                        }
                        className={`p-2.5 rounded-xl text-left border transition ${
                          isSelected
                            ? 'bg-slate-800 border-rose-500 shadow-sm ring-1 ring-rose-500/50'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center font-bold text-xs mb-1">
                          {peer.av}
                        </div>
                        <div className="font-bold text-slate-200 text-xs">{peer.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{peer.role}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5 Core Evaluation Dimensions */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                {/* 1. Composure */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200 block">1. Composure Under Pressure</span>
                      <span className="text-[11px] text-slate-400">
                        Stayed calm, level-headed, and solutions-oriented when Day 4 pivot dropped.
                      </span>
                    </div>
                    <span className="text-sm font-black text-rose-400 font-mono">
                      {formState.composureScore} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={formState.composureScore}
                    onChange={(e) => handleScoreChange('composureScore', Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                {/* 2. Communication */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200 block">2. Communication Transparency</span>
                      <span className="text-[11px] text-slate-400">
                        Proactive updates; no quiet avoidance, denial, or hiding broken modules.
                      </span>
                    </div>
                    <span className="text-sm font-black text-rose-400 font-mono">
                      {formState.communicationScore} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={formState.communicationScore}
                    onChange={(e) => handleScoreChange('communicationScore', Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                {/* 3. Flexibility */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200 block">3. Architectural Flexibility</span>
                      <span className="text-[11px] text-slate-400">
                        Ego-free willingness to discard obsolete polling code and embrace webhooks.
                      </span>
                    </div>
                    <span className="text-sm font-black text-rose-400 font-mono">
                      {formState.flexibilityScore} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={formState.flexibilityScore}
                    onChange={(e) => handleScoreChange('flexibilityScore', Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                {/* 4. Contribution */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200 block">4. Execution & Unblocking Contribution</span>
                      <span className="text-[11px] text-slate-400">
                        Delivered working code under the 48-hour time-box and helped unblock peers.
                      </span>
                    </div>
                    <span className="text-sm font-black text-rose-400 font-mono">
                      {formState.contributionScore} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={formState.contributionScore}
                    onChange={(e) => handleScoreChange('contributionScore', Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                {/* 5. Rehire Index */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
                  <span className="font-bold text-slate-200 block">5. "Would Work With In High-Pressure Sprint Again?"</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Strong Yes', 'Yes', 'Hesitant', 'No'] as const).map((choice) => (
                      <button
                        type="button"
                        key={choice}
                        onClick={() => setFormState({ ...formState, rehireRating: choice })}
                        className={`py-1.5 rounded-lg text-xs font-bold transition ${
                          formState.rehireRating === choice
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Qualitative Feedback */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Confidential Qualitative Observations:
                  </label>
                  <textarea
                    rows={2}
                    value={formState.qualitativeFeedback}
                    onChange={(e) => setFormState({ ...formState, qualitativeFeedback: e.target.value })}
                    placeholder="Specific examples of how this teammate held up during Day 4..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Confidential Peer Rating</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Aggregate Radar Chart & Feedback Synthesis (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Radar Chart Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Aggregate Team Adaptability Radar
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                Anonymized
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#475569" fontSize={9} />
                  <Radar
                    name="Team Composite"
                    dataKey="score"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-2">
              <strong>Aggregate Finding:</strong> Team demonstrated exceptional architectural flexibility (avg {avgFlexibility}/5) by discarding polling within 2 hours of the Day 4 pivot and zero communication avoidance.
            </p>
          </div>

          {/* Anonymized Qualitative Feedback Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Anonymized Peer Behavior Logs
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {reviews.length} Verified Entries
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {reviews.map((r, i) => (
                <div
                  key={r.id || i}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-rose-400" />
                      For: {r.targetTeammate} ({r.role})
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-mono text-[10px]">
                      Rehire: {r.rehireRating}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed italic">
                    "{r.qualitativeFeedback}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                    <span>Composure: {r.composureScore}/5 • Flexibility: {r.flexibilityScore}/5</span>
                    <span>{r.submittedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
