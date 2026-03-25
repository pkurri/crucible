import React from 'react';
import { AbsoluteFill, Audio, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { ImageWithKenBurns } from './ImageWithKenBurns';
import { Captions } from './Captions';

export interface VideoCompositionProps {
  images: string[];
  audioPath: string | null;
  captionPath: string | null;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  images,
  audioPath,
  captionPath,
}) => {
  const { fps } = useVideoConfig();
  const framesPerImage = 125; // 5 seconds per image at 25fps

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {images.map((imagePath, index) => (
        <Sequence
          key={index}
          from={index * framesPerImage}
          durationInFrames={framesPerImage}
        >
          <ImageWithKenBurns src={imagePath} duration={framesPerImage} />
        </Sequence>
      ))}
      
      {audioPath && <Audio src={audioPath} />}
      
      {captionPath && <Captions vttPath={captionPath} />}
    </AbsoluteFill>
  );
};
