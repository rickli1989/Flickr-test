import React from 'react';
import {View, Text, Image, Dimensions, StyleSheet} from 'react-native';

interface ImageCardProps {
  imageUrl: string;
  title: string;
}

const ImageCard: React.FC<ImageCardProps> = ({imageUrl, title}) => {
  const truncateTitle = (title: string, length: number) => {
    return title.length > length ? title.substring(0, length) + '...' : title;
  };

  return (
    <View style={styles.card}>
      <Image source={{uri: imageUrl}} style={styles.image} />
      <Text style={styles.title}>{truncateTitle(title, 50)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  title: {
    padding: 10,
    fontSize: 16,
  },
});

export default ImageCard;
