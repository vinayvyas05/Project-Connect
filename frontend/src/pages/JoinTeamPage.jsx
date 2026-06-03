import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { teamService } from "../api/teams/team.service";

// Join states
const STATE = {
  JOINING: "joining",
  SUCCESS: "success",
  ALREADY: "already",
  ERROR: "error",
};

export default function JoinTeamPage({ onJoined }) {
  const { token } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState(STATE.JOINING);
  const [team, setTeam] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-join as soon as the page mounts with a token
  useEffect(() => {
    if (!token) {
      setState(STATE.ERROR);
      setErrorMsg("No invite token found in the URL.");
      return;
    }

    const join = async () => {
      try {
        const { data } = await teamService.joinTeam(token);
        setTeam(data.team);

        if (data.message?.toLowerCase().includes("already")) {
          setState(STATE.ALREADY);
        } else {
          setState(STATE.SUCCESS);
        }

        // Refresh team list in App.jsx
        if (onJoined) onJoined();
      } catch (err) {
        setState(STATE.ERROR);
        setErrorMsg(err.response?.data?.message ?? "Failed to join team.");
      }
    };

    join();
  }, [token, onJoined]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {/* Joining — spinner */}
        {state === STATE.JOINING && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-text-primary font-medium">Joining team…</p>
            <p className="text-text-secondary text-sm">Verifying your invite link</p>
          </div>
        )}

        {/* Success */}
        {(state === STATE.SUCCESS || state === STATE.ALREADY) && team && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-1">
                {state === STATE.ALREADY
                  ? "Already a member!"
                  : "You're in! 🎉"}
              </h1>
              <p className="text-text-secondary text-sm">
                {state === STATE.ALREADY
                  ? `You're already part of `
                  : `You've successfully joined `}
                <span className="text-text-primary font-semibold">{team.name}</span>
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg py-3 text-sm transition-colors shadow-sm"
            >
              Go to workspace →
            </button>
          </div>
        )}

        {/* Error */}
        {state === STATE.ERROR && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-error/10 border border-error/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-error"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-1">
                Invite invalid
              </h1>
              <p className="text-text-secondary text-sm">{errorMsg}</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-text-secondary font-medium rounded-lg py-3 text-sm transition-colors"
              >
                Back to home
              </button>
              <button
                onClick={() => navigate("/teams/new")}
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg py-3 text-sm transition-colors shadow-sm"
              >
                Create a new team instead
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
