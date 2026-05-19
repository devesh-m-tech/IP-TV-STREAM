import React, { useState, useEffect, useRef } from "react";
import "../../index.css";
import Hls from "hls.js";

const API_BASE = "https://ip-tv-stream.onrender.com/api";

const UserDashboard = ({ onLogout }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("Tamil");
  const [selectedCategory, setSelectedCategory] = useState("Entertainment");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useProxy, setUseProxy] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);

  // Plans & Upgrade states
  const [plans, setPlans] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [billingEmail, setBillingEmail] = useState("user@iptv.com");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const videoRef = useRef(null);
  const youtubeRef = useRef(null);
  const iframeRef = useRef(null);

  const languages = ["Tamil", "Telugu", "Malayalam", "Kannada", "Hindi", "English"];
  const categories = ["Entertainment", "Music", "Movies", "News", "Kids", "Devotional"];

  const [channels, setChannels] = useState([]);

  // Fetch Channels
  useEffect(() => {
    let mounted = true;
    const fetchChannels = async () => {
      try {
        const res = await fetch(`${API_BASE}/channels`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const normalized = (data || []).map((c) => {
          const logoRaw = c.logo ?? null;
          let logo = logoRaw;
          if (typeof logoRaw === "string" && logoRaw.startsWith("/")) {
            logo = `${API_BASE.replace("/api", "")}${logoRaw}`;
          }
          return {
            id: c.id || c._id,
            name: c.name ?? "Untitled",
            logo,
            videoUrl: c.videoUrl ?? "",
            language: c.language ?? "Unknown",
            category: c.category ?? "Uncategorized",
          };
        });
        setChannels(normalized);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChannels();
    const interval = setInterval(fetchChannels, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch dynamic plans from the database
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_BASE}/plans`);
        if (res.ok) {
          const data = await res.json();
          setPlans(data);
        }
      } catch (err) {
        console.error("Failed to fetch plans", err);
      }
    };
    fetchPlans();
  }, []);

  const grouped = channels.reduce((acc, ch) => {
    const lang = ch.language;
    const cat = ch.category;
    if (!acc[lang]) acc[lang] = {};
    if (!acc[lang][cat]) acc[lang][cat] = [];
    acc[lang][cat].push(ch);
    return acc;
  }, {});

  const filteredChannels = (grouped[selectedLanguage] && grouped[selectedLanguage][selectedCategory]) || [];
  const visibleChannels = filteredChannels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const getVideoType = (url) => {
    if (!url) return "iframe";
    const u = url.toLowerCase();
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
    if (u.includes(".m3u8")) return "hls";
    if (u.includes(".mp4")) return "mp4";
    return "iframe";
  };

  useEffect(() => {
    if (!selectedChannel) return;
    setLoading(true);
    setError(null);
    const url = selectedChannel.videoUrl || "";
    const type = getVideoType(url);
    const videoElement = videoRef.current;
    const youtubeContainer = youtubeRef.current;
    const iframeContainer = iframeRef.current;
    let hls;

    if (videoElement) {
      videoElement.pause();
      videoElement.src = "";
      videoElement.style.display = "none";
    }
    if (youtubeContainer) {
      youtubeContainer.innerHTML = "";
      youtubeContainer.style.display = "none";
    }
    if (iframeContainer) {
      iframeContainer.innerHTML = "";
      iframeContainer.style.display = "none";
    }

    if (type === "hls") {
      if (videoElement) {
        videoElement.style.display = "block";
        videoElement.muted = isMuted;
        videoElement.volume = volume;
      }

      let finalUrl = url;
      if (useProxy) {
        finalUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      }

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          },
        });
        hls.loadSource(finalUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          videoElement.play().catch(() => {
            videoElement.controls = true;
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS Error:", data);
          if (data.fatal) {
            setLoading(false);
            setError("Failed to load stream. Please try again or check the source.");
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } else if (videoElement?.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = finalUrl;
        videoElement.onloadedmetadata = () => {
          setLoading(false);
          videoElement.play().catch(() => { });
        };
        videoElement.onerror = () => {
          setLoading(false);
          setError("Video playback error.");
        };
      }
    } else if (type === "mp4") {
      if (videoElement) {
        videoElement.style.display = "block";
        videoElement.src = url;
        videoElement.muted = isMuted;
        videoElement.volume = volume;
        videoElement.onloadedmetadata = () => {
          setLoading(false);
          videoElement.play().catch(() => { });
        };
        videoElement.onerror = () => {
          setLoading(false);
          setError("Failed to load MP4 video.");
        };
      }
    } else if (type === "youtube") {
      let videoId =
        url.split("v=")[1]?.split(/[&?]/)[0] ||
        url.split("/live/")[1]?.split(/[&?]/)[0] ||
        url.split("youtu.be/")[1]?.split(/[&?]/)[0];
      if (videoId && youtubeContainer) {
        youtubeContainer.style.display = "block";
        youtubeContainer.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allowfullscreen></iframe>`;
        setLoading(false);
      } else {
        setLoading(false);
        setError("Invalid YouTube URL.");
      }
    } else if (iframeContainer) {
      iframeContainer.style.display = "block";
      iframeContainer.innerHTML = `<iframe src="${url}" width="100%" height="100%" style="border:none;" allow="autoplay; encrypted-media" referrerpolicy="no-referrer" allowfullscreen></iframe>`;
      setLoading(false);
    }

    return () => {
      if (hls) hls.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannel, useProxy]);

  const handleChannelSelect = (channel) => {
    setUseProxy(false);
    setSelectedChannel(channel);
  };

  const handleDoubleClick = () => {
    const elem = videoRef.current || youtubeRef.current || iframeRef.current;
    if (elem?.requestFullscreen) elem.requestFullscreen();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      const nextMuted = !video.muted;
      video.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted && video.volume === 0) {
        video.volume = 1;
        setVolume(1);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    const video = videoRef.current;
    if (video) {
      video.volume = v;
      if (v > 0) {
        video.muted = false;
        setIsMuted(false);
      } else {
        video.muted = true;
        setIsMuted(true);
      }
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().catch(() => { });
      } else {
        video.pause();
      }
    }
  };

  // Premium Billing simulation
  const handleUpgradePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanForUpgrade) {
      alert("Please select a subscription plan first!");
      return;
    }
    setPaymentProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/revenue/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: billingEmail,
          planName: selectedPlanForUpgrade.name,
          amount: parseFloat(selectedPlanForUpgrade.price),
          paymentMethod: "UPI Pay",
          status: "Success",
        }),
      });

      if (res.ok) {
        alert(`🎉 Thank you! Successfully upgraded to ${selectedPlanForUpgrade.name}. Enjoy premium high-definition feeds.`);
        setShowUpgradeModal(false);
        setSelectedPlanForUpgrade(null);
      } else {
        alert("Payment gateway failed to initialize. Try again.");
      }
    } catch (err) {
      alert("Connection timeout while processing payment.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className={`prime-root ${selectedChannel ? "has-active-channel" : ""}`}>
      {/* 🚀 1. GILDED HEADER */}
      <header className="prime-header">
        <div className="prime-brand">
          <div className="prime-brand-icon">📺</div>
          <div className="prime-brand-text">
            STREAM<span>PRIME</span>
          </div>
          <span className="prime-badge-premium">PREMIUM</span>
        </div>

        <div className="prime-search-wrapper">
          <span className="prime-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="prime-header-right">
          <button className="prime-upgrade-btn" onClick={() => setShowUpgradeModal(true)}>
            ⭐ Upgrade to Pro
          </button>
          <div className="prime-profile-avatar" title={billingEmail}>
            {billingEmail.slice(0, 2).toUpperCase()}
          </div>
          <button
            className="prime-logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              onLogout();
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* 🚀 2. DUAL PILL CATEGORIES NAV */}
      <div className="prime-nav-section">
        <div className="prime-nav-row">
          <span className="prime-nav-label">LANGUAGE</span>
          <div className="prime-nav-pills">
            {languages.map((lang) => (
              <button
                key={lang}
                className={selectedLanguage === lang ? "active" : ""}
                onClick={() => {
                  setSelectedLanguage(lang);
                  setSelectedCategory("Entertainment");
                  setSelectedChannel(null);
                  setSearchTerm("");
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="prime-nav-row">
          <span className="prime-nav-label">GENRE</span>
          <div className="prime-nav-pills genre">
            {categories.map((cat) => (
              <button
                key={cat}
                className={selectedCategory === cat ? "active" : ""}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedChannel(null);
                  setSearchTerm("");
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🚀 3. CINEMATIC GRID LAYOUT */}
      <div className="prime-main-layout">
        {/* SIDEBAR COLUMNS */}
        <aside className="prime-sidebar">
          <div className="sidebar-group">
            <h3 className="sidebar-group-title">LIVE NOW</h3>
            <div className="channel-list-container">
              {visibleChannels.length > 0 ? (
                visibleChannels.map((channel) => {
                  const initials = channel.name.slice(0, 3).toUpperCase();
                  return (
                    <div
                      key={channel.id}
                      className={`prime-channel-item ${selectedChannel?.id === channel.id ? "active" : ""
                        }`}
                      onClick={() => handleChannelSelect(channel)}
                    >
                      <div className="prime-channel-avatar">
                        {channel.logo ? (
                          <img
                            src={channel.logo}
                            alt=""
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : null}
                        <span className="avatar-fallback">{initials}</span>
                      </div>
                      <div className="prime-channel-info">
                        <span className="channel-name">{channel.name}</span>
                        <span className="channel-meta">
                          {channel.language} • {channel.category}
                        </span>
                      </div>
                      <span className="prime-badge-live">LIVE</span>
                    </div>
                  );
                })
              ) : (
                <p className="no-channels-text">No active channels found.</p>
              )}
            </div>
          </div>

          <div className="sidebar-group" style={{ marginTop: "24px" }}>
            <h3 className="sidebar-group-title">PREMIUM CHANNELS</h3>
            <div className="channel-list-container">
              {[
                { id: "p1", name: "Sony LIV 4K", language: "Tamil", category: "Movies" },
                { id: "p2", name: "Star Movies HD", language: "English", category: "Movies" },
                { id: "p3", name: "Sun Music 4K", language: "Tamil", category: "Music" },
                { id: "p4", name: "Zee Tamil HD Pro", language: "Tamil", category: "Entertainment" },
              ].map((channel) => {
                const initials = channel.name.slice(0, 3).toUpperCase();
                return (
                  <div
                    key={channel.id}
                    className="prime-channel-item locked"
                    onClick={() => {
                      const matchedPlan = plans.find(p => p.name.includes("Premium")) || plans[0];
                      setSelectedPlanForUpgrade(matchedPlan);
                      setShowUpgradeModal(true);
                    }}
                  >
                    <div className="prime-channel-avatar premium">
                      <span className="avatar-fallback">{initials}</span>
                    </div>
                    <div className="prime-channel-info">
                      <span className="channel-name">{channel.name}</span>
                      <span className="channel-meta">
                        {channel.language} • {channel.category}
                      </span>
                    </div>
                    <span className="prime-badge-locked">🔒 LOCK</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CENTER PLAYER COLUMNS */}
        <main className="prime-player-area">
          {selectedChannel ? (
            <>
              <div className="prime-player-header">
                <button className="prime-btn-back" onClick={() => setSelectedChannel(null)}>
                  ← Back to Channels
                </button>
                <div className="header-meta-left">
                  <h2>{selectedChannel.name}</h2>
                  <span className="prime-badge-pill">
                    {selectedChannel.language} • {selectedChannel.category}
                  </span>
                </div>
                <div className="header-meta-right">
                  <span className="prime-badge-hd">HD</span>
                  <span className="prime-badge-live-solid">LIVE NOW</span>
                </div>
              </div>

              <div className="prime-video-container" onDoubleClick={handleDoubleClick}>
                {loading && (
                  <div className="prime-player-overlay loading">
                    <div className="prime-spinner"></div>
                    <p>BUFFERING THEATRICAL MEDIA FEED...</p>
                  </div>
                )}
                {error && (
                  <div className="prime-player-overlay error">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                    <div className="error-actions">
                      <button
                        onClick={() => {
                          const ch = selectedChannel;
                          setSelectedChannel(null);
                          setTimeout(() => setSelectedChannel(ch), 100);
                        }}
                      >
                        Retry Feed
                      </button>
                      {!useProxy && (
                        <button className="proxy-btn" onClick={() => setUseProxy(true)}>
                          Secure Tunnel
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <video ref={videoRef} className="prime-video-el" onClick={togglePlay} />
                <div ref={youtubeRef} className="prime-player-embed"></div>
                <div ref={iframeRef} className="prime-player-embed"></div>

                {/* Overlaid play guide - Only shown for HLS & MP4 videos where click play is handled natively */}
                {(getVideoType(selectedChannel.videoUrl) === "hls" || getVideoType(selectedChannel.videoUrl) === "mp4") && (
                  <div className="prime-cinematic-overlay" onClick={togglePlay}>
                    <div className="cinematic-play-btn">
                      <span className="play-icon">▶</span>
                    </div>
                    <span className="cinematic-play-text">NOW STREAMING • DOUBLE CLICK FOR FULLSCREEN</span>
                  </div>
                )}
              </div>

              {/* GILDED CINEMATIC CONTROLS */}
              <div className="prime-player-controls">
                <div className="controls-left">
                  <button className="control-btn" onClick={togglePlay}>
                    ⏸
                  </button>
                  <button className="control-btn">⏮</button>
                  <button className="control-btn">⏭</button>
                  <span className="player-time">00:09 / 00:20</span>
                </div>
                <div className="controls-center">
                  <span className="live-status-dot"></span>
                  <span className="live-status-text">STREAMING LIVE</span>
                  <input
                    type="range"
                    className="player-progress"
                    min="0"
                    max="100"
                    defaultValue="45"
                  />
                </div>
                <div className="controls-right">
                  <button className="control-btn" onClick={toggleMute}>
                    {isMuted ? "🔇" : "🔊"}
                  </button>
                  <input
                    type="range"
                    className="volume-slider"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    title="Volume"
                  />
                  <button className="control-btn" onClick={handleDoubleClick}>
                    📺
                  </button>
                  <span className="control-badge-4k">4K</span>
                </div>
              </div>
            </>
          ) : (
            <div className="prime-empty-state">
              <div className="empty-glowing-circle">📺</div>
              <h2>Welcome to StreamPrime</h2>
              <p>
                Select any high-definition stream from the live list to start your theatrical viewing
                experience.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* 🚀 4. PREMIUM UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="prime-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="prime-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-branding">
              <span>⭐</span>
              <h3>Upgrade to StreamPrime Pro</h3>
            </div>
            <p className="modal-intro">
              Unlock ultra-premium 4K streams, simultaneous device channels, and multi-audio channels instantly.
            </p>

            <form onSubmit={handleUpgradePaymentSubmit}>
              <div className="modal-form-group">
                <label>Registered Subscriber Email</label>
                <input
                  type="email"
                  className="modal-input"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  required
                />
              </div>

              <div className="plans-tier-grid">
                {plans.length === 0 ? (
                  <p className="loading-plans">Loading plans from network...</p>
                ) : (
                  plans.map((p) => (
                    <div
                      key={p.id}
                      className={`plan-tier-card ${selectedPlanForUpgrade?.id === p.id ? "selected" : ""
                        }`}
                      onClick={() => setSelectedPlanForUpgrade(p)}
                    >
                      <div className="tier-header">
                        <h4>{p.name}</h4>
                        <span className="tier-badge">{p.resolution}</span>
                      </div>
                      <div className="tier-price">
                        <b>₹{p.price}</b>
                        <span>/ {p.duration}</span>
                      </div>
                      <p className="tier-devices">Up to {p.maxDevices} concurrent devices</p>
                      <ul className="tier-features">
                        {p.features &&
                          p.features.slice(0, 3).map((f, i) => <li key={i}>✓ {f}</li>)}
                      </ul>
                    </div>
                  ))
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="modal-btn-upgrade"
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? "Authorizing Secure UPI..." : "Activate Premium Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 5. GILDED FOOTER */}
      <footer className="prime-footer">
        <span>© 2026 StreamPrime Global Networks</span>
        <span>
          {time.toLocaleDateString()} {time.toLocaleTimeString()}
        </span>
      </footer>
    </div>
  );
};

export default UserDashboard;
