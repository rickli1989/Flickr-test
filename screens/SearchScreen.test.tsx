import React from 'react';
import {render, fireEvent, waitFor, act} from 'react-native-testing-library';
import SearchScreen from './SearchScreen';
import axios from 'axios';

jest.mock('axios');

describe('SearchScreen', () => {
  it('renders the SearchScreen component', () => {
    render(<SearchScreen />);
  });

  it('triggers search on submit', async () => {
    const {getByPlaceholder, getByTestId} = render(<SearchScreen />);
    const searchInput = getByPlaceholder('Search image...');

    const searchTerm = 'cats';
    const page = 1;
    const mockResponse = {
      photos: {
        photo: [
          {
            id: '1',
            owner: 'Rick',
            secret: 'test',
            server: 'test',
            farm: 1,
            title: 'Test image',
          },
        ],
      },
    };

    axios.get.mockResolvedValue({data: mockResponse});

    fireEvent.changeText(searchInput, 'cats');
    fireEvent(searchInput, 'submitEditing', {nativeEvent: {key: 'Enter'}});

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(searchTerm),
      );
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });

  it('displays loading indicator while searching', async () => {
    const {getByTestId} = render(<SearchScreen />);
    const searchInput = getByTestId('search-input');
    const searchTerm = 'cats';
    const mockResponse = {
      photos: {
        photo: [
          {
            id: '1',
            owner: 'Rick',
            secret: 'test',
            server: 'test',
            farm: 1,
            title: 'Test image',
          },
        ],
      },
    };

    axios.get.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve({data: mockResponse}), 1000);
        }),
    );

    fireEvent.changeText(searchInput, searchTerm);
    fireEvent(searchInput, 'submitEditing', {nativeEvent: {key: 'Enter'}});

    await waitFor(() => {
      const loadingIndicator = getByTestId('loading-indicator');
      expect(loadingIndicator).toBeTruthy();
    });
  });

  it('loads more data when scrolling to the bottom', async () => {
    const {getByTestId} = render(<SearchScreen />);
    const imageList = getByTestId('image-list');

    const searchTerm = 'cats';
    const page = 1;
    const mockResponse = {
      photos: {
        photo: [
          {
            id: '1',
            owner: 'Rick',
            secret: 'test',
            server: 'test',
            farm: 1,
            title: 'Test image',
          },
        ],
      },
    };

    axios.get.mockResolvedValue({data: mockResponse});

    act(() => {
      const contentHeight = 1000; // The total height of the content
      const viewportHeight = 200; // The height of the viewport

      // Scroll to the bottom by setting contentOffset.y to contentHeight - viewportHeight
      fireEvent.scroll(imageList, {
        nativeEvent: {
          contentOffset: {y: contentHeight - viewportHeight},
          layoutMeasurement: {height: viewportHeight},
          contentSize: {height: contentHeight},
        },
      });
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(searchTerm),
      );
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('page=1'));
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('page=2'));
      expect(axios.get).toHaveBeenCalledWith(
        expect.not.stringContaining('page=3'),
      );
    });
  });
});
