import { Button } from './Button';

interface RoomInfo {
  id: string;
  name: string;
  host: string;
  phase: string;
  playerCount: number;
  mode: 'imposter' | 'super';
}

interface RoomListProps {
  rooms: RoomInfo[];
  onJoin: (roomId: string) => void;
}

export function RoomList({ rooms, onJoin }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <p className="text-muted font-body text-sm text-center py-4">
        No open rooms. Create one above!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="flex items-center justify-between bg-surface border border-border rounded-[14px] px-4 py-3"
        >
          <div className="flex-1 min-w-0 mr-4">
            <span className="font-body text-text font-medium truncate block">{room.name}</span>
            <p className="text-xs text-muted font-body mt-0.5">
              Host: {room.host} &middot; {room.playerCount} player{room.playerCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="secondary" onClick={() => onJoin(room.id)} className="shrink-0 text-sm px-4 py-2">
            Join
          </Button>
        </div>
      ))}
    </div>
  );
}
