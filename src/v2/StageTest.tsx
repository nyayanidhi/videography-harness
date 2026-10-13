import {useCurrentFrame} from 'remotion';
import {At, Stage} from './Stage';
import {COL} from './tokens';

export const StageTest: React.FC = () => {
  const f = useCurrentFrame();
  const cam = {x: 200, y: 50, dolly: f * 10};
  const mark = (x: number, y: number) => (
    <At x={x} y={y} center>
      <div style={{width: 160, height: 160, border: `2px solid ${COL.teal}`, borderRadius: '50%'}} />
    </At>
  );
  return (
    <Stage
      cam={cam}
      world={<>{mark(300, 100)}{mark(-400, 200)}</>}
      rocket={{x: 300, y: 100, z: 0, dir: [0, -1, 0], bank: 0, size: 140, visible: true}}
    />
  );
};
