// SearchScreen.js
import React, {Fragment, useRef, useState} from 'react';
import {fetchImagesFromFlickr} from '../lib/FlickrAPI';
import {
  View,
  FlatList,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import uuid from 'react-native-uuid';
import {SearchBar, Overlay} from 'react-native-elements';
import ImageCard from '../components/ImageCard';
import {StyleSheet} from 'react-native';

type Photo = {
  id: string;
  owner: string;
  secret: string;
  server: string;
  farm: number;
  title: string;
};

const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [searching, setSearching] = useState(false);
  const searchbarRef = useRef(null);
  const scrollViewRef = useRef(null);

  const searchImages = async (page = 1, term = searchTerm) => {
    setSearching(true);
    try {
      if (term) {
        const response = await fetchImagesFromFlickr(term, page);
        if (response.data?.photos?.photo.length === 0) {
          alert('No results found');
        } else {
          setPhotos(prevPhotos => [
            ...prevPhotos,
            ...response.data?.photos?.photo,
          ]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const onSearch = (term = searchTerm) => {
    setPhotos([]);
    setPage(1);
    setDropdownVisible(false);
    setSearchHistory(prevHistory => [
      searchTerm,
      ...prevHistory.filter(item => item !== searchTerm).slice(0, 4),
    ]);
    scrollViewRef.current?.scrollToOffset({y: 0, animated: true});
    searchImages(1, term);
  };

  const renderItem = ({item}: {item: Photo}) => (
    <ImageCard
      imageUrl={`https://live.staticflickr.com/${item.server}/${item.id}_${item.secret}_m.jpg`}
      title={item.title}
    />
  );

  const handleEndReached = () => {
    // Check if a request is already in progress
    if (!searching) {
      // Make the request to load more images
      const newPage = page + 1;
      setPage(prevPage => prevPage + 1);
      searchImages(newPage);
    }
  };

  return (
    <View style={{flex: 1}}>
      <SearchBar
        ref={searchbarRef}
        placeholder="Search image..."
        onChangeText={setSearchTerm}
        onSubmitEditing={() => {
          if (searchTerm) {
            onSearch();
          }
        }}
        value={searchTerm}
        onFocus={() => setDropdownVisible(true)}
        onBlur={() => setDropdownVisible(false)}
        clearIcon={{
          name: 'clear',
          onPress: () => {
            searchbarRef.current.blur();
            setSearchTerm('');
          },
        }}
      />

      {isDropdownVisible && (
        <View style={styles.dropdownContainer}>
          <FlatList
            data={searchHistory}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  setSearchTerm(item);
                  setDropdownVisible(false);
                  onSearch(item);
                }}>
                <Text style={styles.itemText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item}
          />
        </View>
      )}
      <Overlay isVisible={searching} overlayStyle={styles.overlay}>
        <ActivityIndicator size="large" />
      </Overlay>

      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
        accessible={false}>
        <FlatList
          ref={scrollViewRef}
          data={photos}
          renderItem={renderItem}
          keyExtractor={item => item.id + '-' + uuid.v4()}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.1}
        />
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  itemText: {
    fontSize: 16,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    // elevation: 5,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
  },
  overlay: {
    width: 'auto',
    height: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchScreen;
