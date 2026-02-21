import { Skeleton, SkeletonCircle } from "../ui/Skeleton";

// Mimics the shape of ChannelList — shown while channels are loading
export function ChannelListSkeleton() {
  return (
    <div className="px-3 py-4 space-y-5 animate-pulse">
      {/* Channels section header */}
      <div>
        <Skeleton className="h-2.5 w-16 mb-3" />
        <div className="space-y-1.5">
          {[80, 65, 90, 55].map((w, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5">
              <Skeleton className="h-3 w-3 rounded-full shrink-0" />
              <Skeleton className={`h-3`} style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Team section header */}
      <div>
        <Skeleton className="h-2.5 w-10 mb-3" />
        <div className="space-y-1.5">
          {[70, 60].map((w, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5">
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <Skeleton className={`h-3`} style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
