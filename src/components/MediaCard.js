import React, { memo } from 'react';

import { getGenreTheme } from '../constants/genreThemes';
import useCardMedia from '../hooks/useCardMedia';
import MediaCardCinematic from './MediaCardCinematic';
import MediaCardPoster from './MediaCardPoster';
import MediaCardVibrant from './MediaCardVibrant';
import MediaCardAtmospheric from './MediaCardAtmospheric';

const VARIANTS = {
  cinematic: MediaCardCinematic,
  poster: MediaCardPoster,
  vibrant: MediaCardVibrant,
  atmospheric: MediaCardAtmospheric,
};

const MediaCard = (props) => {
  const theme = getGenreTheme(props.media?.genre);
  const card = useCardMedia(props.media);
  const Variant = VARIANTS[theme.variant] ?? MediaCardPoster;

  return <Variant {...props} theme={theme} card={card} />;
};

export default memo(MediaCard);
