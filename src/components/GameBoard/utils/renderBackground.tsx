import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
} from 'react-native-svg';
import { styles } from '../../../styles/styles';

export const renderBackground = (variant: string) => {
  if (variant === 'sand') {
    return (
      <View style={styles.backgroundContainer}>
        <Svg
          style={styles.sandSvg}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          viewBox="0 0 360 400">
          <Defs>
            <SvgLinearGradient
              id="sandGradient1"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%">
              <Stop offset="0%" stopColor="#d2b48c" />
              <Stop offset="100%" stopColor="#c19a6b" />
            </SvgLinearGradient>
            <SvgLinearGradient
              id="sandGradient2"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%">
              <Stop offset="0%" stopColor="#c19a6b" />
              <Stop offset="100%" stopColor="#b08d5a" />
            </SvgLinearGradient>
            <SvgLinearGradient
              id="sandGradient3"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%">
              <Stop offset="0%" stopColor="#b08d5a" />
              <Stop offset="100%" stopColor="#9f7a49" />
            </SvgLinearGradient>
          </Defs>

          {/* Base sand shape with wavy edges */}
          <Path
            d="M -10,-10 
                 Q 22.5,-8 45,0 
                 Q 67.5,8 90,0 
                 Q 112.5,-8 135,0 
                 Q 157.5,8 180,0 
                 Q 202.5,-8 225,0 
                 Q 247.5,8 270,0 
                 Q 292.5,-8 315,0 
                 Q 337.5,8 370,0 
                 L 370,410 
                 Q 337.5,408 315,400 
                 Q 292.5,392 270,400 
                 Q 247.5,408 225,400 
                 Q 202.5,392 180,400 
                 Q 157.5,408 135,400 
                 Q 112.5,392 90,400 
                 Q 67.5,408 45,400 
                 Q 22.5,392 -10,410 
                 Z"
            fill="url(#sandGradient1)"
          />

          {/* Horizontal wave stripe 1 */}
          <Path
            d="M 0,90 
                 Q 22.5,82 45,90 
                 Q 67.5,98 90,90 
                 Q 112.5,82 135,90 
                 Q 157.5,98 180,90 
                 Q 202.5,82 225,90 
                 Q 247.5,98 270,90 
                 Q 292.5,82 315,90 
                 Q 337.5,98 360,90 
                 L 360,150 
                 Q 337.5,142 315,150 
                 Q 292.5,158 270,150 
                 Q 247.5,142 225,150 
                 Q 202.5,158 180,150 
                 Q 157.5,142 135,150 
                 Q 112.5,158 90,150 
                 Q 67.5,142 45,150 
                 Q 22.5,158 0,150 
                 Z"
            fill="url(#sandGradient2)"
            opacity="0.6"
          />

          {/* Horizontal wave stripe 2 */}
          <Path
            d="M 0,210 
                 Q 30,202 60,210 
                 Q 90,218 120,210 
                 Q 150,202 180,210 
                 Q 210,218 240,210 
                 Q 270,202 300,210 
                 Q 330,218 360,210 
                 Q 390,202 360,210 
                 L 360,270 
                 Q 330,262 300,270 
                 Q 270,278 240,270 
                 Q 210,262 180,270 
                 Q 150,278 120,270 
                 Q 90,262 60,270 
                 Q 30,278 0,270 
                 Q -30,262 0,270 
                 Z"
            fill="url(#sandGradient3)"
            opacity="0.4"
          />
        </Svg>
      </View>
    );
  } else if (variant === 'sea') {
    return (
      <View style={styles.backgroundContainer}>
        <Svg
          style={styles.seaSvg}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          viewBox="0 0 360 400">
          <Defs>
            <SvgLinearGradient
              id="seaGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%">
              <Stop offset="0%" stopColor="#87CEEB" />
              <Stop offset="50%" stopColor="#4682B4" />
              <Stop offset="100%" stopColor="#1E3A8A" />
            </SvgLinearGradient>
            <SvgLinearGradient
              id="seafloorGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%">
              <Stop offset="0%" stopColor="#d2b48c" />
              <Stop offset="100%" stopColor="#c19a6b" />
            </SvgLinearGradient>
          </Defs>

          {/* Sea background - covers entire area */}
          <Path
            d="M -10,-10 
                 L 370,-10 
                 L 370,410 
                 L -10,410 
                 Z"
            fill="url(#seaGradient)"
          />

          {/* Seafloor sand layer with wavy top edge */}
          <Path
            d="M -10,300 
                 Q 30,290 60,300 
                 Q 90,310 120,300 
                 Q 150,290 180,300 
                 Q 210,310 240,300 
                 Q 270,290 300,300 
                 Q 330,310 370,300 
                 L 370,410 
                 L -10,410 
                 Z"
            fill="url(#seafloorGradient)"
          />

          {/* Seaweed plants */}
          {Array.from({ length: 8 }, (_, i) => (
            <Path
              key={i}
              d={`M ${45 + i * 40},300 
                   Q ${45 + i * 40},280 ${45 + i * 40},260 
                   Q ${35 + i * 40},250 ${45 + i * 40},240 
                   Q ${55 + i * 40},230 ${45 + i * 40},220 
                   Q ${35 + i * 40},210 ${45 + i * 40},200 
                   Q ${55 + i * 40},190 ${45 + i * 40},180`}
              stroke="#228B22"
              strokeWidth="5"
              fill="none"
              opacity="0.8"
            />
          ))}
        </Svg>
      </View>
    );
  }
  return null;
};
