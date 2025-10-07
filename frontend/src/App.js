import React, { useState } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('best');

  const handleExtract = async (e) => {
    e.preventDefault();
    setError('');
    setVideoInfo(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract video');
      }

      setVideoInfo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url, 
          quality: selectedQuality === 'best' ? null : selectedQuality 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get download link');
      }

      // Open download URL in new tab
      window.open(data.downloadUrl, '_blank');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🐦 Twitter / X Video Downloader</h1>
          <p>Download videos from Twitter/X in high quality</p>
        </header>

        <form onSubmit={handleExtract} className="form">
          <div className="input-group">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Twitter/X video URL here..."
              className="url-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="extract-btn"
              disabled={loading || !url}
            >
              {loading ? '⏳ Processing...' : '🔍 Extract'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error">
            <span>❌</span> {error}
          </div>
        )}

        {videoInfo && (
          <div className="video-info">
            <div className="info-header">
              {videoInfo.thumbnail && (
                <img 
                  src={videoInfo.thumbnail} 
                  alt="Video thumbnail" 
                  className="thumbnail"
                />
              )}
              <div className="info-details">
                <h2>{videoInfo.title}</h2>
                {videoInfo.uploader && (
                  <p className="uploader">👤 {videoInfo.uploader}</p>
                )}
                <p className="duration">
                  ⏱️ Duration: {formatDuration(videoInfo.duration)}
                </p>
              </div>
            </div>

            <div className="quality-selector">
              <label htmlFor="quality">Select Quality:</label>
              <select 
                id="quality"
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="quality-dropdown"
              >
                <option value="best">Best Quality</option>
                {videoInfo.formats.map((format, index) => (
                  <option key={index} value={format.height}>
                    {format.quality} - {format.ext.toUpperCase()} 
                    {format.filesize && ` (${formatFileSize(format.filesize)})`}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleDownload}
              className="download-btn"
              disabled={loading}
            >
              {loading ? '⏳ Getting link...' : '⬇️ Download Video'}
            </button>

            <p className="note">
              💡 Tip: The video will open in a new tab. Right-click and "Save as" to download.
            </p>
          </div>
        )}

        <footer className="footer">
          <p>Made with ❤️ for personal use only, AK</p>
          <p className="disclaimer">
            ⚠️ Respect copyright and Twitter's/X's terms of service
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;