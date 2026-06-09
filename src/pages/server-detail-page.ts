import type { ExtensionFactoryApi } from "../types/host";

const MCMSF_API_BASE = "https://mcmsf.com/api";
const MCMSF_WEBSITE = "https://mcmsf.com";

interface MCMSFServerDetail {
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
  qq_group?: string;       // 官方QQ群
  official_website?: string; // 官网地址
}

interface MCMSFDetailResponse {
  success: boolean;
  data: MCMSFServerDetail;
}

interface InstanceInfo {
  id: string;
  name: string;
  version?: string;
}

interface ServerStatus {
  id: string;
  name: string;
  server_status: string;
  online_count: number;
  max_players: number;
  motd: {
    text: string;
    extra?: Array<{
      text: string;
      color?: string;
      bold?: boolean;
      underlined?: boolean;
      italic?: boolean;
    }>;
  };
  pureMotd: string;
  icon: string;
  status_img: string;
}

interface ServerStatusResponse {
  success: boolean;
  data: ServerStatus;
}


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

export function createServerDetailPage(api: ExtensionFactoryApi) {
  const React = api.React;
  const {
    Box,
    Button,
    Image,
    Text,
    VStack,
    HStack,
    Flex,
    Badge,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Divider,
    useToast,
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    List,
    ListItem,
    Skeleton,
  } = api.ChakraUI;

  return function ServerDetailPage() {
    const host = api.getHostContext();
    const hostData = api.useHostData();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [server, setServer] = React.useState(null as MCMSFServerDetail | null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null as string | null);
    const [instances, setInstances] = React.useState([] as InstanceInfo[]);
    const [addingToInstance, setAddingToInstance] = React.useState(false);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [serverStatus, setServerStatus] = React.useState(null as ServerStatus | null);
    const [statusLoading, setStatusLoading] = React.useState(false);

    const serverId = hostData.routeQuery?.id as string | undefined;

    const fetchServerDetail = React.useCallback(async function fetchServerDetailImpl(id: string) {
      setLoading(true);
      setError(null);
      try {
        const response = await host.actions.request(
          `${MCMSF_API_BASE}/servers.php?action=detail&id=${id}`
        );
        const data: MCMSFDetailResponse = await response.json();

        if (data.success && data.data) {
          setServer(data.data);
        } else {
          setError("获取服务器详情失败");
        }
      } catch (err) {
        setError("网络请求失败，请检查网络连接");
        console.error("Failed to fetch server detail:", err);
      } finally {
        setLoading(false);
      }
    }, [host.actions]);

    const fetchServerStatus = React.useCallback(async function fetchServerStatusImpl(id: string | number) {
      setStatusLoading(true);
      try {
        const response = await host.actions.request(
          `${MCMSF_API_BASE}/servers.php?action=status&id=${id}`
        );
        const data: ServerStatusResponse = await response.json();

        if (data.success && data.data) {
          setServerStatus(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch server status:", err);
      } finally {
        setStatusLoading(false);
      }
    }, [host.actions]);

    React.useEffect(function effectFetchServerDetail() {
      if (serverId) {
        fetchServerDetail(serverId);
      } else {
        setError("缺少服务器ID参数");
        setLoading(false);
      }
    }, [fetchServerDetail, serverId]);

    React.useEffect(function effectFetchServerStatus() {
      if (server && server.id) {
        fetchServerStatus(server.id);
      }
    }, [server, fetchServerStatus]);

    const loadInstances = React.useCallback(async function loadInstancesImpl() {
      try {
        const instanceList = host.actions.getInstanceList(true);
        if (instanceList && Array.isArray(instanceList)) {
          const formattedInstances = instanceList.map(function formatInstance(inst: any) {
            return {
              id: inst.id || inst.instance_id || "",
              name: inst.name || inst.instance_name || "未命名实例",
              version: inst.version || inst.game_version || "",
            };
          });
          setInstances(formattedInstances);
        }
      } catch (err) {
        console.error("Failed to load instances:", err);
        toast({
          title: "获取实例列表失败",
          description: "无法获取实例列表",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    }, [host.actions, toast]);

    const MC_COLORS: Record<string, string> = {
      "0": "#000000",
      "1": "#0000AA",
      "2": "#00AA00",
      "3": "#00AAAA",
      "4": "#AA0000",
      "5": "#AA00AA",
      "6": "#FFAA00",
      "7": "#AAAAAA",
      "8": "#555555",
      "9": "#5555FF",
      "a": "#55FF55",
      "b": "#55FFFF",
      "c": "#FF5555",
      "d": "#FF55FF",
      "e": "#FFFF55",
      "f": "#FFFFFF"
    };

    const parseMotd = function parseMotd(motdText: string) {
      if (!motdText) return null;

      const parts: Array<{ text: string; color?: string; bold?: boolean; italic?: boolean; underlined?: boolean; strikethrough?: boolean }> = [];
      let currentPart: { text: string; color?: string; bold?: boolean; italic?: boolean; underlined?: boolean; strikethrough?: boolean } = { text: "" };
      let i = 0;

      while (i < motdText.length) {
        if (motdText[i] === "§" && i + 1 < motdText.length) {
          const code = motdText[i + 1].toLowerCase();
          
          if (currentPart.text) {
            parts.push(currentPart);
          }
          
          currentPart = { text: "" };
          
          if (MC_COLORS[code]) {
            currentPart.color = MC_COLORS[code];
          } else if (code === "l") {
            currentPart.bold = true;
          } else if (code === "o") {
            currentPart.italic = true;
          } else if (code === "n") {
            currentPart.underlined = true;
          } else if (code === "m") {
            currentPart.strikethrough = true;
          } else if (code === "r") {
            currentPart = { text: "" } as { text: string; color?: string; bold?: boolean; italic?: boolean; underlined?: boolean; strikethrough?: boolean };
          }
          
          i += 2;
        } else {
          currentPart.text += motdText[i];
          i++;
        }
      }

      if (currentPart.text) {
        parts.push(currentPart);
      }

      return parts.map(function(part, index) {
        const style: any = {};
        if (part.color) style.color = part.color;
        if (part.bold) style.fontWeight = "bold";
        if (part.italic) style.fontStyle = "italic";
        if (part.underlined) style.textDecoration = style.textDecoration ? style.textDecoration + " underline" : "underline";
        if (part.strikethrough) style.textDecoration = style.textDecoration ? style.textDecoration + " line-through" : "line-through";

        return React.createElement("span", { key: index, style: style }, part.text);
      });
    };

    const handleCopyIP = function handleCopyIP(ip: string) {
      navigator.clipboard.writeText(ip).then(function onCopySuccess() {
        toast({
          title: "复制成功",
          description: `服务器IP ${ip} 已复制到剪贴板`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }).catch(function onCopyError() {
        toast({
          title: "复制失败",
          description: "无法复制到剪贴板",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
    };

    const handleOpenInBrowser = function handleOpenInBrowser() {
      if (server) {
        void host.actions.openExternalLink(server.pageurl);
      }
    };

    const handleAddToInstance = function handleAddToInstance() {
      loadInstances();
      onOpen();
    };

    /**
     * 启动实例并连接到服务器
     * 使用 SJMCL Deeplink 协议: sjmcl://launch
     * 
     * @param instanceId - 实例ID
     * 
     * Deeplink 格式:
     * sjmcl://launch?id=<instance_id>&quickPlayMultiplayer=<server_address>
     * 
     * 参数说明:
     * - id: 实例ID，从 getInstanceList() 获取
     * - quickPlayMultiplayer: 服务器地址，格式为 host:port
     * 
     * 示例:
     * sjmcl://launch?id=my-instance&quickPlayMultiplayer=play.example.com:25565
     * 
     * 实现方式:
     * 使用 window.location.href 触发 deeplink 协议
     * 
     * 异常处理:
     * - 如果实例不存在，会抛出错误
     * - 如果服务器地址无效，会抛出错误
     * - 如果启动器不支持该功能，会抛出错误
     */
    const handleSelectInstance = async function handleSelectInstance(instanceId: string) {
      if (!server) return;
      
      setAddingToInstance(true);
      try {
        const deeplink = `sjmcl://launch?id=${encodeURIComponent(instanceId)}&quickPlayMultiplayer=${encodeURIComponent(server.paycontact)}`;
        window.location.href = deeplink;
        
        toast({
          title: "正在启动实例",
          description: `正在启动实例并连接到服务器 ${server.paycontact}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        onClose();
      } catch (err) {
        console.error("Failed to launch instance:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        toast({
          title: "启动失败",
          description: `无法启动实例: ${errorMessage}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setAddingToInstance(false);
      }
    };

    const getServerTypeLabel = function getServerTypeLabel(type: string | number): string {
      if (typeof type === "string") {
        const typeMap: Record<string, string> = {
          "web": "成员服",
          "mcjpg": "MCJPG",
          "mscpo": "MSCPO",
          "member": "成员服",
        };
        return typeMap[type.toLowerCase()] || type;
      }
      const types: Record<number, string> = {
        0: "MCJPG",
        1: "成员服",
        2: "MSCPO",
        3: "其他",
      };
      return types[type] || "未知";
    };

    const getServerTypeColor = function getServerTypeColor(type: string | number): string {
      if (typeof type === "string") {
        const colorMap: Record<string, string> = {
          "web": "orange",
          "mcjpg": "blue",
          "mscpo": "purple",
          "member": "green",
        };
        return colorMap[type.toLowerCase()] || "gray";
      }
      const colors: Record<number, string> = {
        0: "blue",
        1: "green",
        2: "purple",
        3: "gray",
      };
      return colors[type] || "gray";
    };

    const images = React.useMemo(function getImages() {
      if (!server) return [];
      const imgs = [];
      if (server.img) imgs.push({ src: server.img, alt: server.name, label: "封面图片" });
      if (server.img2) imgs.push({ src: server.img2, alt: `${server.name} - 视图`, label: "服务器视图" });
      if (server.img3) imgs.push({ src: server.img3, alt: `${server.name} - 游戏`, label: "游戏截图" });
      return imgs;
    }, [server]);

    const handlePrevImage = function handlePrevImage() {
      setCurrentImageIndex(function(prev: number) {
        return prev === 0 ? images.length - 1 : prev - 1;
      });
    };

    const handleNextImage = function handleNextImage() {
      setCurrentImageIndex(function(prev: number) {
        return prev === images.length - 1 ? 0 : prev + 1;
      });
    };

    if (loading) {
      return React.createElement(
        VStack,
        { justify: "center", align: "center", minH: "400px", spacing: 3 },
        React.createElement(Spinner, { size: "xl", color: "blue.500" }),
        React.createElement(Text, { fontSize: "sm", color: "gray.500" }, "加载服务器详情...")
      );
    }

    if (error || !server) {
      return React.createElement(
        Alert,
        { status: "error", borderRadius: "md" },
        React.createElement(AlertIcon, null),
        React.createElement(VStack, { align: "start", flex: 1 },
          React.createElement(AlertTitle, null, "加载失败"),
          React.createElement(AlertDescription, null, error || "服务器不存在")
        ),
        React.createElement(Button, {
          size: "sm",
          onClick: function onBackClick() {
            host.actions.navBack();
          },
          variant: "outline"
        }, "返回")
      );
    }

    return React.createElement(
      React.Fragment,
      null,
      React.createElement("style", {
        dangerouslySetInnerHTML: {
          __html: `
            @keyframes fadeInScale {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            .image-carousel-item {
              animation: fadeInScale 0.4s ease-out;
            }
          `
        }
      }),
      React.createElement(
        VStack,
        { align: "stretch", spacing: 4, className: "content-full-y", p: 4 },
        React.createElement(
          HStack,
          { justify: "space-between", align: "center" },
          React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(
              IconButton,
              {
                "aria-label": "返回",
                icon: React.createElement("span", null, "\u2190"),
                size: "sm",
                variant: "ghost",
                onClick: function onBackClick() {
                  host.actions.navBack();
                }
              }
            ),
            React.createElement(Text, { fontSize: "lg", fontWeight: "bold" }, server.name)
          ),
          React.createElement(Badge, { colorScheme: getServerTypeColor(server.type), fontSize: "sm" }, getServerTypeLabel(server.type))
        ),
        images.length > 0 && React.createElement(
          VStack,
          { align: "stretch", spacing: 3 },
          React.createElement(
            Box,
            { position: "relative", borderRadius: "lg", overflow: "hidden", bg: "gray.50" },
            React.createElement(
              Box,
              {
                key: currentImageIndex,
                style: {
                  animation: "fadeInScale 0.4s ease-out",
                },
                className: "image-carousel-item"
              },
              React.createElement(Image, {
                src: images[currentImageIndex].src,
                alt: images[currentImageIndex].alt,
                w: "100%",
                maxH: "300px",
                objectFit: "cover",
                fallback: React.createElement(Skeleton, {
                  h: "200px",
                  w: "100%",
                  startColor: "gray.100",
                  endColor: "gray.200"
                })
              })
            ),
            images.length > 1 && React.createElement(
              React.Fragment,
              null,
              React.createElement(
                IconButton,
                {
                  "aria-label": "上一张",
                  icon: React.createElement("span", null, "\u2039"),
                  position: "absolute",
                  left: 2,
                  top: "50%",
                  transform: "translateY(-50%)",
                  size: "sm",
                  colorScheme: "blackAlpha",
                  opacity: 0.7,
                  transition: "all 0.2s ease",
                  _hover: {
                    opacity: 1,
                    transform: "translateY(-50%) scale(1.1)"
                  },
                  onClick: handlePrevImage
                }
              ),
              React.createElement(
                IconButton,
                {
                  "aria-label": "下一张",
                  icon: React.createElement("span", null, "\u203A"),
                  position: "absolute",
                  right: 2,
                  top: "50%",
                  transform: "translateY(-50%)",
                  size: "sm",
                  colorScheme: "blackAlpha",
                  opacity: 0.7,
                  transition: "all 0.2s ease",
                  _hover: {
                    opacity: 1,
                    transform: "translateY(-50%) scale(1.1)"
                  },
                  onClick: handleNextImage
                }
              )
            )
          ),
          React.createElement(
            HStack,
            { justify: "center", spacing: 2 },
            React.createElement(Text, { fontSize: "xs", color: "gray.500" }, images[currentImageIndex].label),
            images.length > 1 && React.createElement(
              HStack,
              { spacing: 2 },
              images.map(function(_: any, index: number) {
                return React.createElement(Box, {
                  key: index,
                  w: index === currentImageIndex ? 6 : 2,
                  h: 2,
                  borderRadius: "full",
                  bg: index === currentImageIndex ? "blue.500" : "gray.300",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  _hover: {
                    bg: index === currentImageIndex ? "blue.600" : "gray.400",
                    transform: "scale(1.2)"
                  },
                  onClick: function() {
                    setCurrentImageIndex(index);
                  }
                });
              })
            )
          )
        ),
        React.createElement(
          HStack,
          { spacing: 2, wrap: "wrap" },
          React.createElement(Badge, { colorScheme: "blue", variant: "outline" }, server.version),
          server.money && server.money.split(",").map(function(tag: string, index: number) {
            return React.createElement(Badge, { 
              key: index, 
              colorScheme: "purple", 
              variant: "outline" 
            }, tag.trim());
          }),
          server.intime && React.createElement(Badge, { colorScheme: "gray", variant: "outline" }, `加入时间: ${server.intime}`)
        ),
        React.createElement(Divider, null),
        React.createElement(VStack, { align: "stretch", spacing: 3 },
          React.createElement(Text, { fontSize: "sm", fontWeight: "bold" }, "服务器简介"),
          React.createElement(Text, { fontSize: "sm", color: "gray.600", whiteSpace: "pre-wrap" }, htmlToText(server.descriptison || server.paysketch || "\u6682\u65E0\u7B80\u4ECB"))
        ),
        React.createElement(Divider, null),
        React.createElement(
          VStack,
          { align: "stretch", spacing: 3 },
          React.createElement(Text, { fontSize: "sm", fontWeight: "bold" }, "服务器状态"),
          statusLoading && React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Spinner, { size: "xs" }),
            React.createElement(Text, { fontSize: "sm", color: "gray.500" }, "加载服务器状态...")
          ),
          serverStatus && React.createElement(
            React.Fragment,
            null,
            React.createElement(
              HStack,
              { spacing: 3, align: "start" },
              serverStatus.icon && React.createElement(
                Box,
                {
                  w: "64px",
                  h: "64px",
                  borderRadius: "md",
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "gray.200",
                  flexShrink: 0
                },
                React.createElement(Image, {
                  src: serverStatus.icon,
                  alt: "服务器图标",
                  w: "100%",
                  h: "100%",
                  objectFit: "cover"
                })
              ),
              React.createElement(
                VStack,
                { align: "stretch", spacing: 2, flex: 1 },
                React.createElement(
                  HStack,
                  { spacing: 2 },
                  React.createElement(Text, { fontSize: "sm", color: "gray.500" }, "状态:"),
                  React.createElement(
                    Badge,
                    {
                      colorScheme: serverStatus.server_status === "运行中" ? "green" : "red",
                      variant: "solid"
                    },
                    serverStatus.server_status
                  )
                ),
                React.createElement(
                  HStack,
                  { spacing: 2 },
                  React.createElement(Text, { fontSize: "sm", color: "gray.500" }, "玩家数:"),
                  React.createElement(
                    Badge,
                    { colorScheme: "blue", variant: "outline" },
                    `${serverStatus.online_count} / ${serverStatus.max_players}`
                  )
                )
              )
            ),
            serverStatus.pureMotd && React.createElement(
              VStack,
              { align: "stretch", spacing: 1 },
              React.createElement(Text, { fontSize: "xs", color: "gray.500" }, "MOTD:"),
              React.createElement(
                Box,
                {
                  p: 2,
                  bg: "gray.50",
                  borderRadius: "md",
                  fontSize: "sm",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.6"
                },
                parseMotd(serverStatus.pureMotd)
              )
            ),
            serverStatus.server_status === "运行中" && serverStatus.status_img && React.createElement(
              VStack,
              { align: "stretch", spacing: 2 },
              React.createElement(Text, { fontSize: "xs", color: "gray.500" }, "服务器状态图:"),
              React.createElement(
                Box,
                {
                  borderRadius: "md",
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "gray.200"
                },
                React.createElement(Image, {
                  src: serverStatus.status_img,
                  alt: "服务器状态图",
                  w: "100%",
                  fallback: React.createElement(Skeleton, {
                    h: "100px",
                    w: "100%",
                    startColor: "gray.100",
                    endColor: "gray.200"
                  })
                })
              )
            )
          )
        ),
        React.createElement(Divider, null),
        React.createElement(
          VStack,
          { align: "stretch", spacing: 3 },
          React.createElement(Text, { fontSize: "sm", fontWeight: "bold" }, "服务器信息"),
          React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm", color: "gray.500" }, "服务器IP:"),
            React.createElement(Text, {
              fontSize: "sm",
              fontFamily: "monospace",
              fontWeight: "bold",
              color: "blue.600"
            }, server.paycontact),
            React.createElement(
              Button,
              {
                size: "xs",
                variant: "outline",
                colorScheme: "blue",
                onClick: function onCopyClick() {
                  handleCopyIP(server.paycontact);
                }
              },
              "复制"
            )
          ),
          server.sketch && React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm", color: "gray.500" }, "QQ群:"),
            React.createElement(Text, { fontSize: "sm", fontFamily: "monospace" }, server.sketch)
          ),
          server.qq_group && React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm", color: "gray.500" }, "\u5B98\u65B9QQ\u7FA4:"),
            React.createElement(Text, { fontSize: "sm", fontFamily: "monospace", color: "blue.600" }, server.qq_group),
            React.createElement(Button, {
              size: "xs",
              variant: "outline",
              colorScheme: "blue",
              onClick: function onCopyQQClick() {
                handleCopyIP(server.qq_group || "");
              }
            }, "\u590D\u5236")
          ),
          server.official_website && React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm", color: "gray.500" }, "\u5B98\u7F51:"),
            React.createElement(Text, {
              fontSize: "sm",
              color: "blue.600",
              cursor: "pointer",
              onClick: function onWebsiteClick() {
                void host.actions.openExternalLink(server.official_website);
              }
            }, server.official_website),
            React.createElement(Button, {
              size: "xs",
              variant: "outline",
              colorScheme: "blue",
              onClick: function onOpenWebsiteClick() {
                void host.actions.openExternalLink(server.official_website);
              }
            }, "\u6253\u5F00")
          ),
          server.url && React.createElement(
            VStack,
            { align: "stretch", spacing: 2 },
            React.createElement(Text, { fontSize: "sm", fontWeight: "bold" }, "宣传视频"),
            React.createElement(
              Box,
              {
                position: "relative",
                w: "100%",
                paddingBottom: "56.25%",
                borderRadius: "lg",
                overflow: "hidden",
                bg: "gray.100"
              },
              React.createElement("iframe", {
                src: `https://player.bilibili.com/player.html?bvid=${server.url}&high_quality=1&danmaku=0&muted=1&autoplay=1`,
                style: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none"
                },
                allowFullScreen: true,
                allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              })
            )
          ),
          server.username && React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm", color: "gray.500" }, "提交者:"),
            React.createElement(Text, { fontSize: "sm" }, server.username)
          )
        ),
        React.createElement(
          HStack,
          {
            position: "sticky",
            bottom: 0,
            py: 3,
            px: 4,
            mt: 4,
            spacing: 3,
            align: "stretch",
          },
          React.createElement(
            Button,
            {
              size: "sm",
              colorScheme: "green",
              onClick: handleAddToInstance,
              flex: 1,
              leftIcon: React.createElement("span", null, "\u2795"),
            },
            "\u6DFB\u52A0\u5230\u5B9E\u4F8B"
          ),
          React.createElement(
            Button,
            {
              size: "sm",
              colorScheme: "blue",
              onClick: function onCopyClick() {
                handleCopyIP(server.paycontact);
              },
              flex: 1,
              leftIcon: React.createElement("span", null, "\u2398"),
            },
            "\u590D\u5236IP"
          ),
          React.createElement(
            Button,
            {
              size: "sm",
              variant: "outline",
              colorScheme: "blue",
              onClick: handleOpenInBrowser,
              flex: 1,
              leftIcon: React.createElement("span", null, "\u2197"),
            },
            "\u66F4\u591A\u4FE1\u606F"
          )
        )
      ),
      React.createElement(
        Modal,
        { isOpen: isOpen, onClose: onClose, size: "lg" },
        React.createElement(ModalOverlay, null),
        React.createElement(
          ModalContent,
          null,
          React.createElement(ModalHeader, null, "选择实例"),
          React.createElement(ModalCloseButton, null),
          React.createElement(
            ModalBody,
            { pb: 6 },
            instances.length === 0
              ? React.createElement(
                  VStack,
                  { spacing: 3, py: 8 },
                  React.createElement(Text, { color: "gray.500" }, "暂无可用实例"),
                  React.createElement(Text, { fontSize: "sm", color: "gray.400" }, "请先创建一个游戏实例")
                )
              : React.createElement(
                  List,
                  { spacing: 3 },
                  instances.map(function renderInstance(instance: InstanceInfo) {
                    return React.createElement(
                      ListItem,
                      {
                        key: instance.id,
                        p: 3,
                        borderWidth: 1,
                        borderRadius: "md",
                        cursor: "pointer",
                        _hover: { bg: "gray.50" },
                        onClick: function onInstanceClick() {
                          if (!addingToInstance) {
                            handleSelectInstance(instance.id);
                          }
                        },
                        opacity: addingToInstance ? 0.5 : 1,
                      },
                      React.createElement(
                        HStack,
                        { justify: "space-between" },
                        React.createElement(
                          VStack,
                          { align: "start", spacing: 1 },
                          React.createElement(Text, { fontWeight: "bold", fontSize: "sm" }, instance.name),
                          instance.version && React.createElement(Text, { fontSize: "xs", color: "gray.500" }, `版本: ${instance.version}`)
                        ),
                        React.createElement(Badge, { colorScheme: "blue", variant: "outline" }, "选择")
                      )
                    );
                  })
                )
          )
        )
      )
    );
  };
}
