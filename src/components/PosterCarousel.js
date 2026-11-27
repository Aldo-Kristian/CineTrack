import React, { memo } from 'react';
import {
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import { MAX_CONTENT_WIDTH } from '../constants/layout';
import PosterImage from './PosterImage';

const CarouselItem = memo(({ media, onPress, itemWidth }) => (
  <Pressable
    onPress={() => onPress?.(media)}
    style={[styles.item, { width: itemWidth }]}
    accessibilityRole="button"
    accessibilityLabel={`Open ${media.title}`}
  >
    <PosterImage
      media={media}
      style={[styles.poster, { width: itemWidth }]}
      size="w185"
      recyclingKey={`carousel-${media.id}`}
    />
    <Text
      style={styles.title}
      numberOfLines={2}
      maxFontSizeMultiplier={1.3}
    >
      {media.title}
    </Text>
  </Pressable>
));

CarouselItem.displayName = 'CarouselItem';

const PosterCarousel = ({ data, onPress, emptyLabel = 'Nothing here yet' }) => {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const itemWidth = Math.min(
    200,
    Math.max(140, (contentWidth - spacing.lg * 2 - spacing.md) / 2.3)
  );

  if (!data?.length) {
    return <Text style={styles.empty}>{emptyLabel}</Text>;
  }

  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <CarouselItem media={item} onPress={onPress} itemWidth={itemWidth} />
      )}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      initialNumToRender={4}
      windowSize={5}
      maxToRenderPerBatch={4}
      removeClippedSubviews
      getItemLayout={(_, index) => ({
        length: itemWidth + spacing.md,
        offset: (itemWidth + spacing.md) * index,
        index,
      })}
    />
  );
};

export default PosterCarousel;

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },

  item: {
    gap: spacing.sm,
  },

  poster: {
    aspectRatio: 2 / 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  title: {
    color: colors.text,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },

  empty: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
});
