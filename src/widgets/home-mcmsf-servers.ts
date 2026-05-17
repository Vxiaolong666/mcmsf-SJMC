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

type SortType = "time" | "random" | "hot";

interface SortOption {
  value: SortType;
  label: string;
  icon: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "hot", label: "热门", icon: "🔥" },
  { value: "random", label: "推荐", icon: "⭐" },
  { value: "time", label: "最新", icon: "🕐" },
];

export function createMCMSFServersWidget(api: ExtensionFactoryApi) {
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
    SimpleGrid,
    useToast,
    IconButton,
  } = api.ChakraUI;

  return function MCMSFServersWidget() {
    const host = api.getHostContext();
    const [servers, setServers] = React.useState([] as MCMSFServer[]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null as string | null);
    const [currentSort, setCurrentSort] = React.useState("random" as SortType);
    const toast = useToast();

    const fetchServers = React.useCallback(async function fetchServersImpl(sort: SortType) {
      setLoading(true);
      setError(null);
      try {
        const sortParam = sort === "hot" ? "time" : sort;
        const response = await host.actions.request(
          `${MCMSF_API_BASE}/servers.php?action=list&page=1&size=6&sort=${sortParam}`
        );
        const data: MCMSFListResponse = await response.json();

        if (data.success && data.data) {
          setServers(data.data);
        } else {
          setError("获取服务器列表失败");
        }
      } catch (err) {
        setError("网络请求失败，请检查网络连接");
        console.error("Failed to fetch MCMSF servers:", err);
      } finally {
        setLoading(false);
      }
    }, [host.actions]);

    React.useEffect(function effectFetchServers() {
      fetchServers(currentSort);
    }, [fetchServers, currentSort]);

    const handleSortChange = function handleSortChange(sort: SortType) {
      setCurrentSort(sort);
    };

    const handleOpenServerDetail = function handleOpenServerDetail(server: MCMSFServer) {
      void host.actions.navigate(`/extension/${api.identifier}/server-detail?id=${server.id}`);
    };

    const handleOpenMCMSFWebsite = function handleOpenMCMSFWebsite() {
      void host.actions.openExternalLink(`${MCMSF_WEBSITE}/servers.php`);
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
      return types[type] || "成员服";
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

    if (loading) {
      return React.createElement(
        VStack,
        { justify: "center", align: "center", minH: "200px", spacing: 3 },
        React.createElement(Spinner, { size: "lg", color: "blue.500" }),
        React.createElement(Text, { fontSize: "sm", color: "gray.500" }, "精彩即将呈现...")
      );
    }

    if (error) {
      return React.createElement(
        Alert,
        { status: "error", borderRadius: "md" },
        React.createElement(AlertIcon, null),
        React.createElement(VStack, { align: "start", flex: 1 },
          React.createElement(AlertTitle, null, "加载失败"),
          React.createElement(AlertDescription, null, error)
        ),
        React.createElement(Button, {
          size: "sm",
          onClick: function onRetryClick() {
            fetchServers(currentSort);
          },
          variant: "outline"
        }, "重试")
      );
    }

    return React.createElement(
      VStack,
      { align: "stretch", spacing: 4 },
      React.createElement(
        HStack,
        { justify: "space-between", align: "center" },
        React.createElement(
          HStack,
          { spacing: 2 },
          React.createElement(Heading, { size: "sm" }, "浆果服推荐服务器"),
          React.createElement(Badge, { colorScheme: "green", variant: "subtle" }, "MCMSF")
        ),
        React.createElement(
          Button,
          {
            size: "sm",
            variant: "ghost",
            colorScheme: "blue",
            onClick: handleOpenMCMSFWebsite,
          },
          "查看更多 →"
        )
      ),
      React.createElement(
        HStack,
        { spacing: 2 },
        React.createElement(
          IconButton,
          {
            "aria-label": "刷新",
            icon: React.createElement("span", null, "↻"),
            size: "sm",
            variant: "outline",
            onClick: function onRefreshClick() {
              fetchServers(currentSort);
            }
          }
        ),
        SORT_OPTIONS.map(function renderSortButton(option: SortOption) {
          const isActive = currentSort === option.value;
          return React.createElement(
            Button,
            {
              key: option.value,
              size: "sm",
              variant: isActive ? "solid" : "outline",
              colorScheme: isActive ? "blue" : "gray",
              onClick: function onSortClick() {
                handleSortChange(option.value);
              },
              leftIcon: React.createElement("span", null, option.icon),
            },
            option.label
          );
        })
      ),
      React.createElement(
        SimpleGrid,
        { columns: 2, spacing: 3 },
        servers.map(function renderServerCard(server: MCMSFServer) {
          return React.createElement(
            Card,
            {
              key: server.id,
              size: "sm",
              cursor: "pointer",
              onClick: function onCardClick() {
                handleOpenServerDetail(server);
              },
              _hover: { shadow: "md", transform: "translateY(-2px)" },
              transition: "all 0.2s",
            },
            React.createElement(CardBody, { p: 3 },
              React.createElement(VStack, { align: "stretch", spacing: 2 },
                server.img ? React.createElement(Image, {
                  src: server.img,
                  alt: server.name,
                  borderRadius: "md",
                  h: "80px",
                  w: "100%",
                  objectFit: "cover",
                  fallback: React.createElement(Box, {
                    h: "80px",
                    w: "100%",
                    bg: "gray.100",
                    borderRadius: "md",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }, React.createElement(Text, { fontSize: "xs", color: "gray.400" }, "无图片"))
                }) : React.createElement(Box, {
                  h: "80px",
                  w: "100%",
                  bg: "gray.100",
                  borderRadius: "md",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }, React.createElement(Text, { fontSize: "xs", color: "gray.400" }, "无图片")),
                React.createElement(
                  HStack,
                  { justify: "space-between", align: "start" },
                  React.createElement(Text, {
                    fontWeight: "bold",
                    fontSize: "sm",
                    noOfLines: 1,
                    flex: 1
                  }, server.name),
                  React.createElement(Badge, {
                    colorScheme: getServerTypeColor(server.type),
                    fontSize: "xs"
                  }, getServerTypeLabel(server.type))
                ),
                React.createElement(Text, {
                  fontSize: "xs",
                  color: "gray.600",
                  noOfLines: 2
                }, server.descriptison || server.paysketch || "暂无简介"),
                React.createElement(
                  HStack,
                  { spacing: 2, wrap: "wrap" },
                  React.createElement(Badge, {
                    colorScheme: "blue",
                    variant: "outline",
                    fontSize: "xs"
                  }, server.version),
                  React.createElement(
                    HStack,
                    { spacing: 1 },
                    React.createElement(Text, { fontSize: "xs", color: "gray.500" }, "IP:"),
                    React.createElement(Text, {
                      fontSize: "xs",
                      fontFamily: "monospace",
                      color: "blue.600",
                      cursor: "pointer",
                      onClick: function onIPClick(e: any) {
                        e.stopPropagation();
                        handleCopyIP(server.paycontact);
                      }
                    }, server.paycontact)
                  )
                )
              )
            )
          );
        })
      ),
      React.createElement(
        HStack,
        { spacing: 2 },
        React.createElement(
          Button,
          {
            size: "sm",
            variant: "outline",
            colorScheme: "blue",
            onClick: function onRefreshClick() {
              fetchServers(currentSort);
            },
            leftIcon: React.createElement("span", null, "↻")
          },
          "换一批"
        ),
        React.createElement(
          Button,
          {
            size: "sm",
            variant: "outline",
            colorScheme: "blue",
            onClick: handleOpenMCMSFWebsite,
            flex: 1
          },
          "前往 MCMSF 查看更多服务器"
        )
      )
    );
  };
}
