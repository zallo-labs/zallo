import { View } from 'react-native';
import Svg, { Rect, SvgProps } from 'react-native-svg';

import { createStyles } from '~/util/theme/styles';

const seedrand = (seed: string) => {
  const randseed = new Array<number>(4) as Randseed;

  for (let i = 0; i < randseed.length; i++) {
    randseed[i] = 0;
  }

  for (let i = 0; i < seed.length; i++) {
    randseed[i % 4] = (randseed[i % 4]! << 5) - randseed[i % 4]! + seed.charCodeAt(i);
  }

  return randseed;
};

type Randseed = [number, number, number, number];

const rand = (randseed: Randseed) => {
  const t = randseed[0] ^ (randseed[0] << 11);

  randseed[0] = randseed[1];
  randseed[1] = randseed[2];
  randseed[2] = randseed[3];
  randseed[3] = randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8);

  return (randseed[3] >>> 0) / ((1 << 31) >>> 0);
};

const createColor = (r: Randseed) => {
  const h = Math.floor(rand(r) * 360);
  const s = rand(r) * 60 + 40 + '%';
  const l = (rand(r) + rand(r) + rand(r) + rand(r)) * 25 + '%';

  const color = 'hsl(' + h + ',' + s + ',' + l + ')';

  return color;
};

const createImageData = (randseed: Randseed, nBlocks: number) => {
  const width = nBlocks;
  const height = nBlocks;

  const dataWidth = Math.ceil(width / 2);
  const mirrorWidth = width - dataWidth;

  const data = [];

  for (let y = 0; y < height; y++) {
    let row = [];

    for (let x = 0; x < dataWidth; x++) {
      row[x] = Math.floor(rand(randseed) * 2.3);
    }

    const r = row.slice(0, mirrorWidth);

    r.reverse();

    row = row.concat(r);

    for (let i = 0; i < row.length; i++) {
      data.push(row[i]!);
    }
  }

  return data;
};

export interface BlockieProps extends Omit<SvgProps, 'width' | 'height' | 'color'> {
  seed?: string;
  size: number;
  nBlocks?: number;
}

export function Blockie({ size = 24, nBlocks = 8, style, ...props }: BlockieProps) {
  const pxPerBlock = size / nBlocks;
  const seed = seedrand(props.seed || Math.floor(Math.random() * Math.pow(10, 16)).toString(16));

  const color = createColor(seed);
  const backgroundColor = createColor(seed);
  const spotColor = createColor(seed);

  const imageData = createImageData(seed, nBlocks);

  return (
    <View style={[styles.container(size), style]}>
      <Svg {...props} width={size} height={size}>
        {imageData.map((item, i) => (
          <Rect
            key={i}
            x={(i % nBlocks) * pxPerBlock}
            y={Math.floor(i / nBlocks) * pxPerBlock}
            width={pxPerBlock}
            height={pxPerBlock}
            fill={item === 0 ? backgroundColor : item === 1 ? color : spotColor}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = createStyles({
  container: (size: number) => ({
    borderRadius: size / 2,
    overflow: 'hidden',
  }),
});
