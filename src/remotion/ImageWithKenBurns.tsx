import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Img } from 'remotion';

export interface ImageWithKenBurnsProps {
  src: string;
  duration: number;
}

export const ImageWithKenBurns: React.FC<ImageWithKenBurnsProps> = ({
  src,
  duration,
}) => {
  const frame = useCurrentFrame();

  // Ken Burns effect: slow zoom from 1.0 to 1.3
  const scale = interpolate(
    frame,
    [0, duration],
    [1.0, 1.3],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Fade in/out
  const opacity = interpolate(
    frame,
    [0, 10, duration - 10, duration],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};
