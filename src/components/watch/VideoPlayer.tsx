"use client";

import ReactPlayer from "react-player";

type Props = {
  url: string;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  onBuffer: () => void;
  onBufferEnd: () => void;
};

export function VideoPlayer(props: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      <ReactPlayer
        url={props.url}
        controls
        playing
        width="100%"
        height="100%"
        onPlay={props.onPlay}
        onPause={props.onPause}
        onEnded={props.onEnded}
        onBuffer={props.onBuffer}
        onBufferEnd={props.onBufferEnd}
      />
    </div>
  );
}
