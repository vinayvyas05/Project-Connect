import { useParams } from "react-router-dom";
import { useMessages } from "../hooks/useMessages";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";

export default function ChannelPage({ channels = [], activeTeamId }) {
  const { channelId } = useParams();

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Channel header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 shrink-0">
        <span className="text-gray-500 text-lg">#</span>
        <h2 className="text-white font-semibold text-sm">{channelName}</h2>
      </div>

      {/* Messages */}
      <MessageList messages={messages} loading={loading} error={error} />

      {/* Input */}
      <MessageInput onSend={sendMessage} channelName={channelName} />
    </div>
  );
}
