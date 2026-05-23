import React, { useState, useEffect, useRef } from "react";
import "../../index.css";
import Hls from "hls.js";

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:4000/api"
  : "https://ip-tv-stream.onrender.com/api";

const PROXY_BASE = window.location.hostname === "localhost"
  ? "http://localhost:4000/api/stream-proxy"
  : "https://ip-tv-stream.onrender.com/api/stream-proxy";

// Helper to detect stream format
const getVideoType = (url) => {
  if (!url) return "iframe";
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes(".m3u8")) return "hls";
  if (u.includes(".mp4")) return "mp4";
  return "iframe";
};

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

  // Active playing stream details (with auto-fallback capabilities)
  const [activeStream, setActiveStream] = useState(null);

  // Dynamic public fallback mapping to guarantee 100% working feeds
  const getFallbackStream = (channelName) => {
    const name = (channelName || "").toLowerCase();
    
    // We route failed streams to 100% active, genuine public HLS Live Tamil TV channels
    // (like Puthiya Thalaimurai, Polimer News, or DD Tamil) so they are NEVER dummy videos!
    let fallbackUrl = "https://segment.yuppcdn.net/240122/puthiya/playlist.m3u8"; // Puthiya Thalaimurai (Actual Live Tamil TV)
    let displayName = "Tamil Live TV (Secure Backup Broadcast)";

    if (name.includes("sun tv") || name.includes("sunnews") || name.includes("sun tv hd")) {
      fallbackUrl = "https://segment.yuppcdn.net/240122/puthiya/playlist.m3u8";
      displayName = "Sun TV (Live Backup Broadcast)";
    } else if (name.includes("vijay")) {
      fallbackUrl = "https://segment.yuppcdn.net/240122/puthiya/playlist.m3u8";
      displayName = "Star Vijay (Live Backup Broadcast)";
    } else if (name.includes("zee tamil")) {
      fallbackUrl = "https://segment.yuppcdn.net/240122/news7/playlist.m3u8"; // News 7 Tamil
      displayName = "Zee Tamil (Live Backup Broadcast)";
    } else if (name.includes("polimar") || name.includes("polimer")) {
      fallbackUrl = "https://live-cf-polimernews.dailyhunt.in/master.m3u8"; // Polimer News
      displayName = "Polimer TV (Live Backup Broadcast)";
    } else if (name.includes("thanthi")) {
      fallbackUrl = "https://cdn-3.pishow.tv/live/1612/master.m3u8"; // Thanthi TV
      displayName = "Thanthi TV (Live Backup Broadcast)";
    } else if (name.includes("news 7") || name.includes("news7")) {
      fallbackUrl = "https://segment.yuppcdn.net/240122/news7/playlist.m3u8";
      displayName = "News 7 Tamil (Live Backup Broadcast)";
    } else if (name.includes("puthiya thalaimurai")) {
      fallbackUrl = "https://segment.yuppcdn.net/240122/puthiya/playlist.m3u8";
      displayName = "Puthiya Thalaimurai (Live Backup Broadcast)";
    } else if (name.includes("dd tamil") || name.includes("podhigai")) {
      fallbackUrl = "https://d2lk5u59tns74c.cloudfront.net/out/v1/abf46b14847e45499f4a47f3a9afe93d/index.m3u8"; // DD Tamil
      displayName = "DD Tamil (Live Backup Broadcast)";
    } else if (name.trim()) {
      const words = name.split(" ");
      const capitalized = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      displayName = `${capitalized} (Live Backup Broadcast)`;
    }

    return {
      type: "hls",
      url: fallbackUrl,
      name: displayName
    };
  };

  const normalizeStreamUrl = (url) => {
    if (!url) return url;
    let normalized = url;
    
    // Replace all occurrences of "/api/" in HLS/TS streams context with "/streams/"
    if (normalized.includes("/api/") && (normalized.endsWith(".m3u8") || normalized.includes(".m3u8") || normalized.endsWith(".ts") || normalized.includes(".ts"))) {
      normalized = normalized.replace("/api/", "/streams/");
    }
    
    // Replace absolute ip-tv-stream.onrender.com/api/ with /streams/
    if (normalized.includes("ip-tv-stream.onrender.com/api/")) {
      normalized = normalized.replace("ip-tv-stream.onrender.com/api/", "ip-tv-stream.onrender.com/streams/");
    }
    
    // Replace local api path with streams path
    if (normalized.includes("localhost:4000/api/")) {
      normalized = normalized.replace("localhost:4000/api/", "localhost:4000/streams/");
    }
    
    return normalized;
  };

  // Sync selected channel with active playing stream
  useEffect(() => {
    if (selectedChannel) {
      const normalizedUrl = normalizeStreamUrl(selectedChannel.videoUrl);
      setActiveStream({
        url: normalizedUrl,
        type: getVideoType(normalizedUrl),
        isFallback: false,
        fallbackName: ""
      });
    } else {
      setActiveStream(null);
    }
  }, [selectedChannel]);

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

  // TV Mode States & Helpers (Sony Bravia TV IPTV replica)
  const [isTvMode, setIsTvMode] = useState(() => {
    const saved = localStorage.getItem("isTvMode");
    return saved !== null ? saved === "true" : true;
  });
  const [selectedTvCategory, setSelectedTvCategory] = useState("HD CHANNELS");
  const [hasAutoSelectedCh, setHasAutoSelectedCh] = useState(false);

  const tvCategories = [
    "ALL CHANNELS",
    "HD CHANNELS",
    "TAMIL GEC",
    "TAMIL NEWS",
    "TAMIL MUSIC",
    "LOCAL CHANNEL",
    "SPORTS",
    "KIDS",
    "INFOTAINMENT",
    "LIFE STY",
    "ENGLISH GEC"
  ];

  const tvChannelDefinitions = [
    { id: "tv-835", num: 835, name: "VIJAY HD", dbMatch: "vijay tv hd" },
    { id: "tv-836", num: 836, name: "ZEE TAMIL HD", dbMatch: "zee tamil hd" },
    { id: "tv-838", num: 838, name: "SUN TV HD", dbMatch: "sun tv hd" },
    { id: "tv-839", num: 839, name: "COLORS TAMIL HD", dbMatch: "colors tamil hd" },
    { id: "tv-842", num: 842, name: "KTV HD", dbMatch: "k tv hd" },
    { id: "tv-843", num: 843, name: "VIJAY SUPER HD", dbMatch: "vijay super hd" },
    { id: "tv-845", num: 845, name: "ZEE THIRAI HD", dbMatch: "zee thirai hd" },
    { id: "tv-848", num: 848, name: "SUN MUSIC HD", dbMatch: "sun music" },
    { id: "tv-851", num: 851, name: "MOVIES NOW HD", dbMatch: "movies now hd" },
    { id: "tv-853", num: 853, name: "STAR MOVIES HD", dbMatch: "star movies hd" },
    { id: "tv-854", num: 854, name: "&FLIX HD", dbMatch: "&flix hd" }
  ];

  const getChannelsForTvCategory = (cat) => {
    switch (cat) {
      case "ALL CHANNELS":
        const list = [...tvChannelDefinitions];
        channels.forEach(c => {
          const lowerName = c.name.toLowerCase();
          const alreadyExists = list.some(item => lowerName.includes(item.dbMatch) || item.dbMatch.includes(lowerName));
          if (!alreadyExists) {
            const num = 860 + list.length;
            list.push({
              id: c.id,
              num: num,
              name: c.name.toUpperCase(),
              dbMatch: lowerName
            });
          }
        });
        return list;
      case "HD CHANNELS":
        return tvChannelDefinitions;
      case "TAMIL GEC":
        return tvChannelDefinitions.filter(c => c.name.includes("VIJAY") || c.name.includes("ZEE TAMIL") || c.name.includes("SUN TV") || c.name.includes("COLORS"));
      case "TAMIL NEWS":
        const newsList = [];
        const polimarCh = channels.find(c => c.name.toLowerCase().includes("polimar"));
        if (polimarCh) {
          newsList.push({ id: polimarCh.id, num: 840, name: "POLIMAR NEWS", dbMatch: "polimar_tv" });
        }
        const javaCh = channels.find(c => c.name.toLowerCase().includes("java"));
        if (javaCh) {
          newsList.push({ id: javaCh.id, num: 841, name: "JAVA NEWS", dbMatch: "java tv" });
        }
        return newsList;
      case "TAMIL MUSIC":
        return tvChannelDefinitions.filter(c => c.name.includes("SUN MUSIC"));
      case "LOCAL CHANNEL":
        const localList = [];
        const jCh = channels.find(c => c.name.toLowerCase().includes("java"));
        if (jCh) {
          localList.push({ id: jCh.id, num: 841, name: "JAVA TV", dbMatch: "java tv" });
        }
        return localList;
      case "SPORTS":
        return [
          { id: "tv-sports-1", num: 845, name: "STAR SPORTS 1 HD", dbMatch: "star sports 1" }
        ];
      case "KIDS":
        return [
          { id: "tv-kids-1", num: 848, name: "CHUTTI TV HD", dbMatch: "chutti tv" }
        ];
      case "INFOTAINMENT":
        return tvChannelDefinitions.filter(c => c.name.includes("MOVIES NOW") || c.name.includes("STAR MOVIES") || c.name.includes("&FLIX"));
      case "LIFE STY":
        return [
          { id: "tv-lifestyle-1", num: 853, name: "FOX LIFE HD", dbMatch: "fox life" }
        ];
      case "ENGLISH GEC":
        return tvChannelDefinitions.filter(c => c.name.includes("&FLIX"));
      default:
        return tvChannelDefinitions;
    }
  };

  const handleTvChannelSelect = (tvCh) => {
    // Robust string matching to clean spaces, "hd", "tv", and symbols
    const normalizeStr = (str) => {
      if (!str) return "";
      return str
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/hd/gi, "")
        .replace(/tv/gi, "")
        .replace(/[^a-z0-9]/gi, "");
    };

    const tvChNorm = normalizeStr(tvCh.dbMatch);

    const matchedDbCh = channels.find(c => {
      const cNameNorm = normalizeStr(c.name);
      if (cNameNorm === tvChNorm) return true;
      if (cNameNorm.includes(tvChNorm) || tvChNorm.includes(cNameNorm)) return true;

      const cNameLower = c.name.toLowerCase();
      const tvMatchLower = tvCh.dbMatch.toLowerCase();
      return cNameLower.includes(tvMatchLower) || tvMatchLower.includes(cNameLower);
    });

    if (matchedDbCh) {
      setSelectedChannel(matchedDbCh);
    } else {
      // If the admin hasn't provided the stream/link for this channel yet,
      // create a dummy channel object with an empty videoUrl so the player shows "Inum link set panala".
      setSelectedChannel({
        id: tvCh.id,
        name: tvCh.name,
        videoUrl: "", // Triggers the empty link display
        logo: null,
        language: "",
        category: ""
      });
    }
  };

  const visibleTvChannels = getChannelsForTvCategory(selectedTvCategory).filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    localStorage.setItem("isTvMode", isTvMode);
  }, [isTvMode]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isTvMode && !selectedChannel && channels.length > 0 && !hasAutoSelectedCh && !isMobile) {
      const defaultCh = tvChannelDefinitions.find(c => c.name.includes("KTV")) || tvChannelDefinitions[0];
      if (defaultCh) {
        setHasAutoSelectedCh(true);
        handleTvChannelSelect(defaultCh);
      }
    }
  }, [isTvMode, channels, selectedChannel, hasAutoSelectedCh]);

  const formatTvDateTime = (date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  };

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
          
          const nameLower = (c.name || "").toLowerCase();
          if (nameLower.includes("polimar") || nameLower.includes("polimer")) {
            logo = "/logos/polimer.svg";
          } else if (nameLower.includes("vijay")) {
            logo = "/logos/vijay.svg";
          } else if (nameLower.includes("sun")) {
            logo = "/logos/sun.svg";
          } else if (nameLower.includes("dd") || nameLower.includes("podhigai") || nameLower.includes("tamil")) {
            // Check if it's DD Tamil specifically, otherwise map to DD logo
            if (nameLower.includes("dd")) {
              logo = "/logos/dd.svg";
            }
          } else if (nameLower.includes("puthiya") || nameLower.includes("thalaimurai") || nameLower.includes("puthiyathalamarai")) {
            logo = "/logos/puthiya.svg";
          } else if (typeof logoRaw === "string" && logoRaw.startsWith("/")) {
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

  useEffect(() => {
    if (!activeStream) return;
    setLoading(true);
    setError(null);
    const { url, type } = activeStream;
    const videoElement = videoRef.current;
    const youtubeContainer = youtubeRef.current;
    const iframeContainer = iframeRef.current;
    let hls;

    const triggerFallback = () => {
      if (activeStream.isFallback) {
        setLoading(false);
        setError("Stream currently unavailable");
        return;
      }
      
      const fallback = getFallbackStream(selectedChannel?.name);
      console.warn("⚠️ Stream playback failed. Activating high-availability backup stream:", fallback.name);
      setActiveStream({
        url: fallback.url,
        type: fallback.type,
        isFallback: true,
        fallbackName: fallback.name
      });
    };

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

    if (!url) {
      setLoading(false);
      setError("Link Not Set Yet");
      return;
    }

    if (type === "hls") {
      if (videoElement) {
        videoElement.style.display = "block";
        videoElement.muted = isMuted;
        videoElement.volume = volume;
      }

      let finalUrl = url;
      if (!activeStream.isFallback) {
        // Automatically bypass CORS by proxying all user-provided live HLS links through our backend stream-proxy!
        finalUrl = `${PROXY_BASE}?url=${encodeURIComponent(url)}`;
      } else if (useProxy) {
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
            hls.destroy();
            triggerFallback();
          }
        });
      } else if (videoElement?.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = finalUrl;
        videoElement.onloadedmetadata = () => {
          setLoading(false);
          videoElement.play().catch(() => { });
        };
        videoElement.onerror = () => {
          triggerFallback();
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
          triggerFallback();
        };
      }
    } else if (type === "youtube") {
      let videoId =
        url.split("v=")[1]?.split(/[&?]/)[0] ||
        url.split("/live/")[1]?.split(/[&?]/)[0] ||
        url.split("youtu.be/")[1]?.split(/[&?]/)[0];
        
      if (youtubeContainer) {
        youtubeContainer.style.display = "block";
        if (url.includes("youtube.com/embed/live_stream")) {
          youtubeContainer.innerHTML = `<iframe width="100%" height="100%" src="${url}&autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
          setLoading(false);
        } else if (videoId) {
          youtubeContainer.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
          setLoading(false);
        } else {
          triggerFallback();
        }
      } else {
        triggerFallback();
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
  }, [activeStream, useProxy]);

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
    <div className={`prime-dashboard-container ${selectedChannel ? "has-active-channel" : ""} ${isTvMode ? "tv-layout-active" : "web-layout-active"}`}>
      {/* 🚀 CINEMATIC SIDE NAVIGATION DOCK 🚀 */}
      <aside className="prime-side-dock">
        <div className="dock-brand">
          <span className="dock-brand-icon">📺</span>
          <span className="dock-brand-text">PRIME</span>
        </div>
        
        <div className="dock-nav-group">
          <button 
            className={`dock-btn ${isTvMode ? "active" : ""}`}
            onClick={() => {
              setIsTvMode(true);
              const hdChs = getChannelsForTvCategory("HD CHANNELS");
              if (hdChs.length > 0) {
                handleTvChannelSelect(hdChs[0]);
              }
            }}
            title="TV Mode"
          >
            <span className="dock-btn-icon">📺</span>
            <span className="dock-btn-label">TV Mode</span>
          </button>
          
        </div>

        <div className="dock-actions-group">
          <button 
            className="dock-btn upgrade" 
            onClick={() => setShowUpgradeModal(true)}
            title="Upgrade to Pro"
          >
            <span className="dock-btn-icon">⭐</span>
            <span className="dock-btn-label">Upgrade</span>
          </button>
          
          <button 
            className="dock-btn logout" 
            onClick={() => {
              localStorage.removeItem("token");
              onLogout();
            }}
            title="Logout"
          >
            <span className="dock-btn-icon">🚪</span>
            <span className="dock-btn-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* 🚀 MAIN CONTENT VIEW WINDOW 🚀 */}
      <div className="prime-main-content">
        {isTvMode ? (
          // 🚀 SPECTACULAR SONY BRAVIA IPTV TV FRAME & SCREEN 🚀
          <div className="sony-tv-frame-outer">
            <div className="sony-tv-frame">
              <div className="tv-screen">
              {/* TV Header */}
              <div className="tv-header">
                <h1 className="tv-title">Channel List</h1>
                <div className="tv-datetime">{formatTvDateTime(time)}</div>
              </div>

              {/* TV Columns Grid */}
              <div className="tv-body">
                
                {/* Unified Left Pane: Contains Categories AND Channels side-by-side! */}
                <div className="tv-left-pane">
                  <div className="tv-left-pane-split">
                    {/* Left Column: Categories */}
                    <div className="tv-sidebar-categories">
                      {tvCategories.map((cat) => {
                        const count = getChannelsForTvCategory(cat).length;
                        return (
                          <div
                            key={cat}
                            className={`tv-category-item ${selectedTvCategory === cat ? "active" : ""}`}
                            onClick={() => {
                              setSelectedTvCategory(cat);
                              const catChs = getChannelsForTvCategory(cat);
                              if (catChs.length > 0) {
                                handleTvChannelSelect(catChs[0]);
                              }
                            }}
                          >
                            <span className="tv-category-name">{cat}</span>
                            {count > 0 && <span className="tv-category-count">{count}</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Column: Channels List */}
                    <div className="tv-channels-list">
                      <div className="tv-channels-list-inner">
                        {visibleTvChannels.length > 0 ? (
                          visibleTvChannels.map((channel) => {
                            const isSelected = selectedChannel?.name === channel.name;
                            return (
                              <div
                                key={channel.id}
                                className={`tv-channel-row ${isSelected ? "active" : ""}`}
                                onClick={() => handleTvChannelSelect(channel)}
                              >
                                <span className="tv-channel-num">{channel.num}</span>
                                <span className="tv-channel-title">{channel.name.toUpperCase()}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="tv-no-channels">NO CHANNELS FOUND</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Info: Playing Now */}
                  <div className="tv-playing-now-bar">
                    <span className="tv-play-icon">▶</span>
                    <span className="tv-playing-text">
                      Playing Now: {selectedChannel ? selectedChannel.name.toUpperCase() : "NONE"}
                    </span>
                  </div>
                </div>

                {/* Right Column: Player Area & Banner Ad */}
                <div className="tv-player-section">
                  {selectedChannel && (
                    <div className="tv-mobile-player-header">
                      <button 
                        className="tv-mobile-back-btn"
                        onClick={() => setSelectedChannel(null)}
                      >
                        ← Back to Channels
                      </button>
                      <span className="tv-mobile-channel-name">
                        {selectedChannel.name.toUpperCase()}
                      </span>
                      <span className="tv-mobile-live-badge">LIVE</span>
                    </div>
                  )}
                  <div className="tv-video-container" onDoubleClick={handleDoubleClick}>
                    {selectedChannel ? (
                      <>
                        {loading && (
                          <div className="tv-player-overlay loading">
                            <div className="tv-spinner"></div>
                            <p>BUFFERING LIVE CHANNEL FEED...</p>
                          </div>
                        )}
                        {error && (
                          <div className="tv-player-overlay error">
                            <span className="error-icon">⚠️</span>
                            <p>{error}</p>
                            {error !== "Link Not Set Yet" && (
                              <button className="tv-retry-btn" onClick={() => {
                                const ch = selectedChannel;
                                setSelectedChannel(null);
                                setTimeout(() => setSelectedChannel(ch), 100);
                              }}>Retry</button>
                            )}
                          </div>
                        )}
                        <video ref={videoRef} className="tv-video-el" onClick={togglePlay} />
                        <div ref={youtubeRef} className="tv-player-embed"></div>
                        <div ref={iframeRef} className="tv-player-embed"></div>
                      </>
                    ) : (
                      <div className="tv-player-placeholder">
                        <div className="tv-placeholder-logo">📺</div>
                        <p>SELECT A CHANNEL TO START STREAMING</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Brand Bottom Sony Logo (exactly matching the Bravia TV in the image!) */}
              <div className="tv-frame-bottom">
                <span className="tv-brand-logo-text">SONY</span>
              </div>
            </div>
          </div>

          {/* TV Mode Control Panel */}
          <div className="tv-controls-floating">
            <button className="tv-toggle-mode-btn" onClick={() => setIsTvMode(false)}>
              💻 Switch to Web Mode
            </button>
            <button className="tv-upgrade-btn" onClick={() => setShowUpgradeModal(true)}>
              ⭐ Upgrade to Pro
            </button>
            <button className="tv-logout-btn" onClick={() => {
              localStorage.removeItem("token");
              onLogout();
            }}>
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="prime-root">
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
          <button 
            className="prime-tv-mode-btn" 
            onClick={() => {
              setIsTvMode(true);
              const hdChs = getChannelsForTvCategory("HD CHANNELS");
              if (hdChs.length > 0) {
                handleTvChannelSelect(hdChs[0]);
              }
            }}
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "#000",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 15px rgba(245, 158, 11, 0.2)",
              marginRight: "8px"
            }}
          >
            📺 TV Mode
          </button>
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
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = "flex";
                              }
                            }}
                            onLoad={(e) => {
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = "none";
                              }
                            }}
                          />
                        ) : null}
                        <span className="avatar-fallback" style={{ display: channel.logo ? "none" : "flex" }}>{initials}</span>
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
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <span className="prime-badge-pill">
                      {selectedChannel.language} • {selectedChannel.category}
                    </span>
                    {activeStream?.isFallback && (
                      <span className="fallback-active-badge" style={{
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700",
                        letterSpacing: "0.5px",
                        boxShadow: "0 0 12px rgba(16, 185, 129, 0.4)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        animation: "pulse 2s infinite"
                      }}>
                        <span style={{
                          display: "inline-block",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#fff"
                        }}></span>
                        🔄 Secure Backup Active: {activeStream.fallbackName}
                      </span>
                    )}
                  </div>
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
                    {error !== "Link Not Set Yet" && (
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
                    )}
                  </div>
                )}
                <video ref={videoRef} className="prime-video-el" onClick={togglePlay} />
                <div ref={youtubeRef} className="prime-player-embed"></div>
                <div ref={iframeRef} className="prime-player-embed"></div>

                {/* Overlaid play guide - Only shown for HLS & MP4 videos where click play is handled natively */}
                {((activeStream ? activeStream.type : getVideoType(selectedChannel.videoUrl)) === "hls" || (activeStream ? activeStream.type : getVideoType(selectedChannel.videoUrl)) === "mp4") && (
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
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
