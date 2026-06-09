import type { ExtensionFactoryApi } from "../types/host";

const MCMSF_API_BASE = "https://mcmsf.com/api";
const MCMSF_WEBSITE = "https://mcmsf.com";

interface MCMSFServer {
  id: string | number;
  name: string;
  img: string;
  img2?: string;
  img3?: string;
  url?: string;
  paysketch: string;
  descriptison?: string;
  version: string;
  money: string;
  paycontact: string;
  address_hidden?: number;
  sketch: string;
  type: string | number;
  intime: string;
  submit_time: string;
  username: string;
  pageurl: string;
}

interface MCMSFListResponse {
  success: boolean;
  data: MCMSFServer[];
  pagination: {
    page: number;
    size: number;
    total: number;
    total_pages: number;
  };
}

type RecommendMode = "random" | "hot" | "latest" | "newest";

// Convert HTML string to clean plain text
// Handles: raw tags, entity-encoded tags, double-encoded, style attributes, etc.
function htmlToText(html: string): string {
  if (!html) return "";
  var text = html;
  // Multiple passes: decode entities first, then strip tags, repeat for double-encoding
  for (var pass = 0; pass < 3; pass++) {
    // Decode HTML entities (&lt; &gt; &amp; &quot; &#nnn; &name;)
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&#(\d+);/g, function(_s: string, n: string) { return String.fromCharCode(parseInt(n, 10)); });
    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/&(mdash|ndash|hellip|copy|trade|reg);/g, function(_s: string) { return ""; });
  }
  // Now strip all HTML tags
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|blockquote|ul|ol)>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");
  // Final cleanup
  text = text.split("\n").map(function(line: string) { return line.trim(); }).filter(function(line: string) { return line.length > 0; }).join("\n");
  return text.trim();
}

export function createFeaturedServerWidget(api: ExtensionFactoryApi) {
  const React = api.React;
  const {
    Box,
    Button,
    Card,
    CardBody,
    Heading,
    Image,
    Text,
    VStack,
    HStack,
    Badge,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    IconButton,
    Skeleton,
    Tooltip,
    Switch,
    FormControl,
    FormLabel,
    Select,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
  } = api.ChakraUI;

  return function FeaturedServerWidget() {
    const host = api.getHostContext();
    const [server, setServer] = React.useState(null as MCMSFServer | null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null as string | null);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [recommendMode, setRecommendMode] = host.state.useExtensionState("featured_mode", "random" as RecommendMode);
    const [enabled, setEnabled] = host.state.useExtensionState("featured_enabled", true);

    // Build images array
    var images: Array<{ src: string; alt: string }> = [];
    if (server) {
      if (server.img) images.push({ src: server.img, alt: server.name + "-封面" });
      if (server.img2) images.push({ src: server.img2, alt: server.name + "-截图" });
      if (server.img3) images.push({ src: server.img3, alt: server.name + "-游玩" });
    }

    const fetchRandomServer = React.useCallback(async function fetchRandomServerImpl(mode: RecommendMode) {
      setLoading(true);
      setError(null);
      setServer(null);
      setCurrentImageIndex(0);
      try {
        let sortParam = "random";
        if (mode === "hot") sortParam = "time";
        else if (mode === "latest") sortParam = "time";
        else if (mode === "newest") sortParam = "time";

        const response = await host.actions.request(
          `${MCMSF_API_BASE}/servers.php?action=list&page=1&size=12&sort=${sortParam}`
        );
        const data: MCMSFListResponse = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          var picked: MCMSFServer;
          if (mode === "random") {
            picked = data.data[Math.floor(Math.random() * data.data.length)];
          } else if (mode === "hot") {
            picked = data.data[0];
          } else {
            var topN = Math.min(5, data.data.length);
            picked = data.data[Math.floor(Math.random() * topN)];
          }
          setServer(picked);
        } else {
          setError("暂无服务器数据");
        }
      } catch (err) {
        setError("网络请求失败");
        console.error("Failed to fetch featured server:", err);
      } finally {
        setLoading(false);
      }
    }, [host.actions]);

    React.useEffect(function effectFetchFeatured() {
      if (!enabled) return;
      fetchRandomServer(recommendMode);
    }, [enabled, recommendMode, fetchRandomServer]);

    // Auto-slideshow for images
    React.useEffect(function autoSlideshowEffect() {
      if (!server || images.length <= 1) return;
      var timer = setInterval(function tick() {
        setCurrentImageIndex(function(prev: number) {
          return (prev + 1) % images.length;
        });
      }, 4000);
      return function cleanup() { clearInterval(timer); };
    }, [server, images.length]);

    function handleSwitchAnother() {
      fetchRandomServer(recommendMode);
    }

    function handleOpenDetail() {
      if (server) {
        void host.actions.navigate(`/extension/${api.identifier}/server-detail?id=${server.id}`);
      }
    }

    function handleOpenMCMSFWebsite() {
      void host.actions.openExternalLink(`${MCMSF_WEBSITE}/servers.php`);
    }

    function handleModeChange(newMode: RecommendMode) {
      setRecommendMode(newMode);
    }

    function handleToggleEnable(isOn: boolean) {
      setEnabled(isOn);
    }

    function getModeLabel(m: RecommendMode): string {
      if (m === "random") return "随机推荐";
      if (m === "hot") return "热门推荐";
      if (m === "latest") return "最新推荐";
      if (m === "newest") return "最新加入";
      return m;
    }

    function getModeIcon(m: RecommendMode): string {
      if (m === "random") return "\u2605";
      if (m === "hot") return "\u25B2";
      if (m === "latest") return "\u25B6";
      if (m === "newest") return "\u2728";
      return "\u2B50";
    }

    // Create settings popover content
    function renderSettingsPopover() {
      return React.createElement(PopoverContent, { w: "auto" },
        React.createElement(PopoverArrow, null),
        React.createElement(PopoverCloseButton, null),
        React.createElement(PopoverHeader, null, "\u63A8\u8350\u8BBE\u7F6E"),
        React.createElement(PopoverBody, null,
          React.createElement(VStack, { align: "stretch", spacing: 3 },
            React.createElement(FormControl, { display: "flex", alignItems: "center", justifyContent: "space-between" },
              React.createElement(FormLabel, { fontSize: "xs", mb: 0 }, "\u663E\u793A\u5361\u7247"),
              React.createElement(Switch, {
                size: "sm",
                isChecked: enabled,
                onChange: function onSwitchChange(e: any) {
                  handleToggleEnable(e.target.checked);
                },
              })
            ),
            React.createElement(FormControl, null,
              React.createElement(FormLabel, { fontSize: "xs" }, "\u63A8\u8350\u6A21\u5F0F"),
              React.createElement(Select, {
                size: "xs",
                value: recommendMode,
                onChange: function onSelectChange(e: any) {
                  handleModeChange(e.target.value as RecommendMode);
                },
              },
                React.createElement("option", { value: "random" }, "\u968F\u673A\u63A8\u8350"),
                React.createElement("option", { value: "hot" }, "\u70ED\u95E8\u63A8\u8350"),
                React.createElement("option", { value: "latest" }, "\u6700\u65B0\u63A8\u8350"),
                React.createElement("option", { value: "newest" }, "\u6700\u65B0\u52A0\u5165")
              )
            )
          )
        )
      );
    }

    // Create header actions
    function renderHeaderActions() {
      return React.createElement(Popover, { placement: "bottom-start" },
        React.createElement(PopoverTrigger, {},
          React.createElement(IconButton, {
            "aria-label": "\u8BBE\u7F6E",
            icon: React.createElement("span", null, "\u2261"),
            size: "xs",
            variant: "ghost",
          })
        ),
        renderSettingsPopover()
      );
    }

    // ====== DISABLED STATE - Hide completely ======
    if (!enabled) {
      return null;
    }

    // ====== LOADING STATE ======
    if (loading) {
      return React.createElement(
        VStack,
        { align: "stretch", spacing: 3 },
        React.createElement(
          HStack,
          { justify: "space-between", align: "center" },
          React.createElement(HStack, { spacing: 2 },
            React.createElement(Heading, { size: "sm" }, "\u670D\u52A1\u5668\u7CBE\u9009"),
            React.createElement(Badge, { colorScheme: "purple", variant: "subtle" }, "MCMSF")
          ),
          renderHeaderActions()
        ),
        React.createElement(Card, { overflow: "hidden", cursor: "pointer", _hover: { shadow: "md" } },
          React.createElement(CardBody, { p: 0 },
            React.createElement(Skeleton, {
              h: "220px",
              w: "100%",
              startColor: "gray.100",
              endColor: "gray.200",
            })
          )
        ),
        React.createElement(HStack, { justify: "center", spacing: 2 },
          React.createElement(Spinner, { size: "xs", color: "blue.500" }),
          React.createElement(Text, { fontSize: "xs", color: "gray.500" }, "\u6B63\u5728\u4E3A\u60A8\u6311\u9009\u7CBE\u5F69\u5185\u5BB9...")
        )
      );
    }

    // ====== ERROR STATE ======
    if (error || !server) {
      return React.createElement(
        VStack,
        { align: "stretch", spacing: 3 },
        React.createElement(
          HStack,
          { justify: "space-between", align: "center" },
          React.createElement(HStack, { spacing: 2 },
            React.createElement(Heading, { size: "sm" }, "\u670D\u52A1\u5668\u7CBE\u9009"),
            React.createElement(Badge, { colorScheme: "purple", variant: "subtle" }, "MCMSF")
          ),
          renderHeaderActions()
        ),
        React.createElement(Alert, { status: "warning", borderRadius: "md" },
          React.createElement(AlertIcon, null),
          React.createElement(VStack, { align: "start", flex: 1, spacing: 1 },
            React.createElement(AlertTitle, { fontSize: "sm" }, error || "\u65E0\u6CD5\u52A0\u8F7D\u63A8\u8350"),
            React.createElement(AlertDescription, { fontSize: "xs" }, "\u8BF7\u7A0D\u540E\u91CD\u8BD5")
          ),
          React.createElement(Button, {
            size: "xs",
            variant: "outline",
            onClick: function onRetryClick() {
              fetchRandomServer(recommendMode);
            },
          }, "\u91CD\u8BD5")
        )
      );
    }

    // ====== MAIN CONTENT WITH FEATURED SERVER ======
    // Build image indicators
    var imageIndicators = null;
    if (images.length > 1) {
      var indicatorElements = [];
      for (var i = 0; i < images.length; i++) {
        (function(idx: number) {
          indicatorElements.push(React.createElement(Box, {
            key: idx,
            w: idx === currentImageIndex ? 5 : 4,
            h: idx === currentImageIndex ? 5 : 4,
            borderRadius: "full",
            bg: idx === currentImageIndex ? "white" : "whiteAlpha.500",
            cursor: "pointer",
            opacity: 0.8,
            _hover: { opacity: 1 },
            onClick: function onIndicatorClick(e: any) {
              e.stopPropagation();
              setCurrentImageIndex(idx);
            },
          }));
        })(i);
      }
      imageIndicators = React.createElement(HStack, {
        position: "absolute",
        top: 2,
        right: 2,
        spacing: 1,
        zIndex: 2,
      }, indicatorElements);
    }

    // Build tags
    var tagBadges = [];
    if (server.money && typeof server.money === "string") {
      var tags = server.money.split(",").slice(0, 2);
      for (var t = 0; t < tags.length; t++) {
        tagBadges.push(React.createElement(Badge, {
          key: t,
          colorScheme: "purple",
          variant: "solid",
          fontSize: "2xs",
        }, tags[t].trim()));
      }
    }

    // Build main card
    var mainCard = React.createElement(Card, {
      overflow: "hidden",
      cursor: "pointer",
      onClick: handleOpenDetail,
      position: "relative",
      _hover: { shadow: "lg", transform: "scale(1.01)" },
      transition: "all 0.25s ease",
    },
      React.createElement(CardBody, { p: 0, position: "relative" },
        // Image area
        React.createElement(Box, {
          position: "relative",
          h: "220px",
          w: "100%",
          overflow: "hidden",
          bg: "gray.50",
        },
          images.length > 0 ? React.createElement(Image, {
            src: images[currentImageIndex].src,
            alt: images[currentImageIndex].alt,
            w: "100%",
            h: "100%",
            objectFit: "cover",
            fallback: React.createElement(Skeleton, {
              h: "220px",
              w: "100%",
              startColor: "gray.100",
              endColor: "gray.200",
            }),
          }) : React.createElement(Skeleton, {
            h: "220px",
            w: "100%",
            startColor: "gray.100",
            endColor: "gray.200",
          }),

          // Gradient overlay at bottom
          React.createElement(Box, {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            h: "80px",
            bg: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
            zIndex: 1,
          }),

          // Server info overlay
          React.createElement(Box, {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            p: 3,
            zIndex: 2,
          },
            React.createElement(VStack, { align: "start", spacing: 1 },
              React.createElement(Text, {
                color: "white",
                fontWeight: "bold",
                fontSize: "md",
                textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                noOfLines: 1,
              }, server.name),
              React.createElement(HStack, { spacing: 1 },
                React.createElement(Badge, {
                  colorScheme: "blue",
                  variant: "solid",
                  fontSize: "2xs",
                }, server.version),
                tagBadges
              ),
              server.descriptison && React.createElement(Text, {
                color: "whiteAlpha.800",
                fontSize: "xs",
                noOfLines: 2,
                textShadow: "0 1px 2px rgba(0,0,0,0.6)",
              }, htmlToText(server.descriptison))
            )
          ),

          // Image indicators
          imageIndicators,

          // Mode badge
          React.createElement(Badge, {
            position: "absolute",
            top: 2,
            left: 2,
            zIndex: 2,
            colorScheme: "green",
            variant: "solid",
            fontSize: "2xs",
          }, getModeIcon(recommendMode), " ", getModeLabel(recommendMode))
        )
      )
    );

    // Bottom action buttons
    var bottomActions = React.createElement(HStack, { spacing: 2 },
      React.createElement(Button, {
        size: "sm",
        variant: "outline",
        colorScheme: "blue",
        flex: 1,
        onClick: handleSwitchAnother,
        leftIcon: React.createElement("span", null, "\u21BB"),
      }, "\u6362\u4E00\u4E2A"),
      React.createElement(Button, {
        size: "sm",
        variant: "outline",
        colorScheme: "blue",
        flex: 1,
        onClick: handleOpenMCMSFWebsite,
      }, "\u66F4\u591A\u670D\u52A1\u5668 \u2192")
    );

    // Final assembly
    return React.createElement(
      VStack,
      { align: "stretch", spacing: 3 },
      // Header
      React.createElement(HStack, { justify: "space-between", align: "center" },
        React.createElement(HStack, { spacing: 2 },
          React.createElement(Heading, { size: "sm" }, "\u670D\u52A1\u5668\u7CBE\u9009"),
          React.createElement(Badge, { colorScheme: "purple", variant: "subtle" }, "MCMSF"),
          React.createElement(Badge, { colorScheme: "blue", variant: "outline", fontSize: "2xs" },
            getModeIcon(recommendMode), " ", getModeLabel(recommendMode))
        ),
        renderHeaderActions()
      ),
      // Main card
      mainCard,
      // Bottom actions
      bottomActions
    );
  };
}
