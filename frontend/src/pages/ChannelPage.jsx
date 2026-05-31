import { useParams } from "react-router-dom";
import { useMessages } from "../hooks/useMessages";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";

export default function ChannelPage({ channels = [], activeTeamId }) {
  const { channelId } = useParams();

  // Track remounts
  console.log("[UI] ChannelPage Mounting/Rendering for ID:", channelId);

  // Look up the channel name from the channels list passed down from App.jsx
  const channel = channels.find((c) => c._id === channelId);
  const channelName = channel?.name ?? "";

  const { messages, loading, error, sendMessage } = useMessages({
    teamId: activeTeamId,
    channelId,
  });

  if (!channelId || !activeTeamId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 text-sm">
          Select a channel to start chatting
        </p>
      </div>
    );
  }

  console.log("[UI] Passing messages to MessageList, count:", messages.length);

  return (
    <div className="flex flex-col h-full overflow-hidden animate-page-in relative z-10 bg-gradient-to-b from-slate-950/40 via-transparent to-transparent">
      {/* Channel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-slate-900/10 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <span className="text-indigo-400 font-semibold text-sm">#</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-slate-100 font-semibold text-[15px] tracking-tight">{channelName}</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">
              General Discussion
            </p>
          </div>
        </div>
      </div>


      {/* Messages */}
      <MessageList messages={messages} loading={loading} error={error} />

      {/* Input */}
      <MessageInput onSend={sendMessage} channelName={channelName} />
    </div>
  );
}
