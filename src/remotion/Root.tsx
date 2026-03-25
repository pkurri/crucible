import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShortVideo"
        component={VideoComposition}
        durationInFrames={375} // 15 seconds at 25fps
        fps={25}
        width={1080}
        height={1920}
        defaultProps={{
          images: [],
          audioPath: null,
          captionPath: null,
        }}
      />
    </>
  );
};
