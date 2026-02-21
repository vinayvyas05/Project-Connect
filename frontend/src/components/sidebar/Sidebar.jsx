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
  isAdmin = false,
}) {
  const activeTeam = teams.find((t) => t._id === activeTeamId) ?? null;

  return (
    <>
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
        isAdmin={isAdmin}
      />
    </>
  );
}
