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
    <div className="flex flex-col h-full overflow-hidden animate-page-in relative z-10 bg-background">
      {/* Channel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-primary font-semibold text-sm">#</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-text-primary font-semibold text-[15px] tracking-tight">{channelName}</h2>
            <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest leading-none mt-0.5">
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
