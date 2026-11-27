import React from 'react';
import {
  BookOpen,
  Clapperboard,
  Compass,
  Eye,
  Film,
  Fingerprint,
  Flame,
  Ghost,
  Heart,
  Hourglass,
  Laugh,
  Music,
  Rocket,
  Search,
  Sparkles,
  Sunset,
  Swords,
  Users,
} from 'lucide-react-native';

const ICONS = {
  flame: Flame,
  compass: Compass,
  eye: Eye,
  fingerprint: Fingerprint,
  swords: Swords,
  sunset: Sunset,
  film: Film,
  search: Search,
  hourglass: Hourglass,
  'book-open': BookOpen,
  laugh: Laugh,
  clapperboard: Clapperboard,
  users: Users,
  music: Music,
  ghost: Ghost,
  rocket: Rocket,
  sparkles: Sparkles,
  heart: Heart,
};

const GenreIcon = ({ name, size = 20, color = '#FFFFFF', strokeWidth = 2 }) => {
  const Icon = ICONS[name] ?? Film;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
};

export default GenreIcon;
