"use client";

import ReactPlayer from "react-player";

type Props = {
  url: string;
  playing?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  onBuffer: () => void;
  onBufferEnd: () => void;
  playerRef?: any;
  onReady?: () => void;
  onProgress?: (state: { playedSeconds: number }) => void;
};

export function VideoPlayer(props: Props) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
      <ReactPlayer
        ref={props.playerRef}
        url={props.url}
        controls
        playing={props.playing ?? true}
        width="100%"
        height="100%"
        onPlay={props.onPlay}
        onPause={props.onPause}
        onEnded={props.onEnded}
        onBuffer={props.onBuffer}
        onBufferEnd={props.onBufferEnd}
        onReady={props.onReady}
        onProgress={props.onProgress}
      />
    </div>
  );
}
