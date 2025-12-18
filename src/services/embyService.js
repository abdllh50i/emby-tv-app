import axios from 'axios';

class EmbyService {
  constructor() {
    this.baseUrl = localStorage.getItem('emby_serverUrl') || '';
    this.token = localStorage.getItem('emby_token') || '';
    this.userId = localStorage.getItem('emby_userId') || '';
  }

  updateCredentials() {
    this.baseUrl = localStorage.getItem('emby_serverUrl') || '';
    this.token = localStorage.getItem('emby_token') || '';
    this.userId = localStorage.getItem('emby_userId') || '';
  }

  getHeaders() {
    return {
      'X-Emby-Token': this.token,
      'Content-Type': 'application/json',
    };
  }

  // Authenticate user
  async authenticate(serverUrl, username, password) {
    try {
      const response = await axios.post(
        `${serverUrl}/Users/AuthenticateByName`,
        {
          Username: username,
          Pw: password,
        },
        {
          headers: {
            'X-Emby-Authorization': `MediaBrowser Client="Emby TV App", Device="Web Browser", DeviceId="emby-tv-app-${Date.now()}", Version="1.0.0"`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  // Get public users (for account selection)
  async getPublicUsers(serverUrl) {
    try {
      const response = await axios.get(`${serverUrl}/Users/Public`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public users:', error);
      throw error;
    }
  }

  // Get latest media items
  async getLatestMedia(includeItemTypes = 'Movie,Series') {
    this.updateCredentials();
    try {
      const response = await axios.get(
        `${this.baseUrl}/Users/${this.userId}/Items/Latest`,
        {
          params: {
            IncludeItemTypes: includeItemTypes,
            Limit: 16,
            Fields: 'PrimaryImageAspectRatio,BasicSyncInfo,Path',
            ImageTypeLimit: 1,
            EnableImageTypes: 'Primary,Backdrop,Thumb',
          },
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching latest media:', error);
      throw error;
    }
  }

  // Get items by type
  async getItemsByType(type, parentId = null, limit = 30) {
    this.updateCredentials();
    try {
      const params = {
        IncludeItemTypes: type,
        Recursive: true,
        Limit: limit,
        Fields: 'PrimaryImageAspectRatio,BasicSyncInfo,Path',
        ImageTypeLimit: 1,
        EnableImageTypes: 'Primary,Backdrop,Thumb',
        SortBy: 'DateCreated',
        SortOrder: 'Descending',
      };

      if (parentId) {
        params.ParentId = parentId;
      }

      const response = await axios.get(
        `${this.baseUrl}/Users/${this.userId}/Items`,
        {
          params,
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching items by type:', error);
      throw error;
    }
  }

  // Get item details
  async getItemDetails(itemId) {
    this.updateCredentials();
    try {
      const response = await axios.get(
        `${this.baseUrl}/Users/${this.userId}/Items/${itemId}`,
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching item details:', error);
      throw error;
    }
  }

  // Get seasons for a series
  async getSeasons(seriesId) {
    this.updateCredentials();
    try {
      const response = await axios.get(
        `${this.baseUrl}/Shows/${seriesId}/Seasons`,
        {
          params: {
            UserId: this.userId,
            Fields: 'PrimaryImageAspectRatio,BasicSyncInfo',
          },
          headers: this.getHeaders(),
        }
      );
      return response.data.Items || [];
    } catch (error) {
      console.error('Error fetching seasons:', error);
      throw error;
    }
  }

  // Get episodes for a season
  async getEpisodes(seasonId) {
    this.updateCredentials();
    try {
      const response = await axios.get(
        `${this.baseUrl}/Users/${this.userId}/Items`,
        {
          params: {
            ParentId: seasonId,
            Fields: 'PrimaryImageAspectRatio,BasicSyncInfo,Path,Overview',
            SortBy: 'SortName',
          },
          headers: this.getHeaders(),
        }
      );
      return response.data.Items || [];
    } catch (error) {
      console.error('Error fetching episodes:', error);
      throw error;
    }
  }

  // Get playback info
  async getPlaybackInfo(itemId) {
    this.updateCredentials();
    try {
      const response = await axios.post(
        `${this.baseUrl}/Items/${itemId}/PlaybackInfo`,
        {
          UserId: this.userId,
        },
        {
          params: {
            UserId: this.userId,
          },
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching playback info:', error);
      throw error;
    }
  }

  // Get stream URL
  getStreamUrl(itemId, mediaSourceId = null) {
    this.updateCredentials();
    const params = new URLSearchParams({
      Static: 'false',
      MediaSourceId: mediaSourceId || itemId,
      DeviceId: 'emby-tv-app',
      api_key: this.token,
      VideoCodec: 'h264,mpeg4,mpeg2video',
      AudioCodec: 'aac,mp3,ac3,dca,dts',
      MaxStreamingBitrate: '140000000',
      VideoStreamIndex: '0',
      AudioStreamIndex: '1',
      SubtitleStreamIndex: '-1',
      EnableAutoStreamCopy: 'true',
    });
    return `${this.baseUrl}/Videos/${itemId}/stream.mp4?${params.toString()}`;
  }

  // Get image URL
  getImageUrl(itemId, imageType = 'Primary', maxWidth = 500) {
    this.updateCredentials();
    return `${this.baseUrl}/Items/${itemId}/Images/${imageType}?maxWidth=${maxWidth}&quality=90&api_key=${this.token}`;
  }

  // Get backdrop image URL
  getBackdropUrl(itemId, index = 0, maxWidth = 1920) {
    this.updateCredentials();
    return `${this.baseUrl}/Items/${itemId}/Images/Backdrop/${index}?maxWidth=${maxWidth}&quality=90&api_key=${this.token}`;
  }

  // Report playback start
  async reportPlaybackStart(itemId, positionTicks = 0) {
    this.updateCredentials();
    try {
      await axios.post(
        `${this.baseUrl}/Sessions/Playing`,
        {
          ItemId: itemId,
          PositionTicks: positionTicks,
          IsPaused: false,
          IsMuted: false,
        },
        {
          headers: this.getHeaders(),
        }
      );
    } catch (error) {
      console.error('Error reporting playback start:', error);
    }
  }

  // Report playback progress
  async reportPlaybackProgress(itemId, positionTicks, isPaused = false) {
    this.updateCredentials();
    try {
      await axios.post(
        `${this.baseUrl}/Sessions/Playing/Progress`,
        {
          ItemId: itemId,
          PositionTicks: positionTicks,
          IsPaused: isPaused,
          IsMuted: false,
        },
        {
          headers: this.getHeaders(),
        }
      );
    } catch (error) {
      console.error('Error reporting playback progress:', error);
    }
  }

  // Report playback stopped
  async reportPlaybackStopped(itemId, positionTicks) {
    this.updateCredentials();
    try {
      await axios.post(
        `${this.baseUrl}/Sessions/Playing/Stopped`,
        {
          ItemId: itemId,
          PositionTicks: positionTicks,
        },
        {
          headers: this.getHeaders(),
        }
      );
    } catch (error) {
      console.error('Error reporting playback stopped:', error);
    }
  }

  // Get subtitles
  async getSubtitles(itemId) {
    this.updateCredentials();
    try {
      const itemDetails = await this.getItemDetails(itemId);
      const subtitles = [];

      if (itemDetails.MediaStreams) {
        itemDetails.MediaStreams
          .filter(stream => stream.Type === 'Subtitle')
          .forEach(stream => {
            const mediaSourceId = itemDetails.MediaSources && itemDetails.MediaSources.length > 0 
              ? itemDetails.MediaSources[0].Id 
              : itemId;
            subtitles.push({
              index: stream.Index,
              language: stream.Language || 'Unknown',
              displayTitle: stream.DisplayTitle || `Subtitle ${stream.Index}`,
              codec: stream.Codec,
              isExternal: stream.IsExternal,
              url: stream.DeliveryUrl 
                ? `${this.baseUrl}${stream.DeliveryUrl}` 
                : `${this.baseUrl}/Videos/${itemId}/${mediaSourceId}/Subtitles/${stream.Index}/Stream.${stream.Codec}?api_key=${this.token}`,
            });
          });
      }

      return subtitles;
    } catch (error) {
      console.error('Error fetching subtitles:', error);
      return [];
    }
  }
}

export default new EmbyService();
