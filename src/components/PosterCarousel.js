import React, { memo } from 'react';
import { Text, FlatList, Pressable, StyleSheet } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import PosterImage from './PosterImage';

const ITEM_WIDTH = 106;

const CarouselItem = memo(({ media, onPress }) => (
  <Pressable
    onPress={() => onPress?.(media)}
    style={styles.item}
    accessibilityRole="button"
    accessibilityLabel={`Open ${media.title}`}
  >
    <PosterImage
      media={media}
      style={styles.poster}
      size="w185"
      recyclingKey={`carousel-${media.id}`}
    />
    <Text style={styles.title} numberOfLines={2}>
      {media.title}
    </Text>
  </Pressable>
));

CarouselItem.displayName = 'CarouselItem';

const PosterCarousel = ({ data, onPress, emptyLabel = 'Nothing here yet' }) => {
  if (!data?.length) {
    return <Text style={styles.empty}>{emptyLabel}</Text>;
  }

  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <CarouselItem media={item} onPress={onPress} />}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      initialNumToRender={4}
      windowSize={5}
      maxToRenderPerBatch={4}
      removeClippedSubviews
      getItemLayout={(_, index) => ({
        length: ITEM_WIDTH + spacing.md,
        offset: (ITEM_WIDTH + spacing.md) * index,
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
    width: ITEM_WIDTH,
    gap: spacing.sm,
  },

  poster: {
    width: ITEM_WIDTH,
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
