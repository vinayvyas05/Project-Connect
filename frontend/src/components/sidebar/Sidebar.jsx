import TeamSidebar from "./TeamSidebar";
import ChannelList from "./ChannelList";

export default function Sidebar({
  teams = [],
  activeTeamId = null,
  onSelectTeam = () => {},
  onCreateTeam = () => {},
  channels = [],
  activeChannelId = null,
  onSelectChannel = () => {},
  onCreateChannel = () => {},
  onRenameChannel = () => {},
  onDeleteTeam,
  onRenameTeam,
  isAdmin = false,
  channelsLoading = false,
}) {
  const activeTeam = teams.find((t) => t._id === activeTeamId) ?? null;

  return (
    <div className="flex h-full shrink-0 relative z-20">
      <TeamSidebar
        teams={teams}
        activeTeamId={activeTeamId}
        onSelect={onSelectTeam}
        onCreateTeam={onCreateTeam}
      />
      <ChannelList
        team={activeTeam}
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={onSelectChannel}
        onCreateChannel={onCreateChannel}
        onRenameChannel={onRenameChannel}
        onDeleteTeam={onDeleteTeam}
        onRenameTeam={onRenameTeam}
        isAdmin={isAdmin}
        channelsLoading={channelsLoading}
      />
    </div>
  );
}

