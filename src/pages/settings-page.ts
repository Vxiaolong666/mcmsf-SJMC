import type { ExtensionFactoryApi } from "../types/host";

const MCMSF_WEBSITE = "https://mcmsf.com";

type RecommendMode = "random" | "hot" | "latest" | "newest";
type ListSortType = "time" | "random" | "hot";

export function createSettingsPage(api: ExtensionFactoryApi) {
  const React = api.React;
  const {
    Box,
    Text,
    VStack,
    HStack,
    Badge,
    Button,
    Divider,
    Link,
    Switch,
    FormControl,
    FormLabel,
    FormHelperText,
    Select,
    Heading,
    Alert,
    AlertIcon,
    AlertDescription,
    Card,
    CardBody,
  } = api.ChakraUI;

  function SettingsPage() {
    const host = api.getHostContext();

    // Featured server settings
    const [featuredEnabled, setFeaturedEnabled] = host.state.useExtensionState("featured_enabled", true);
    const [featuredMode, setFeaturedMode] = host.state.useExtensionState("featured_mode", "random" as RecommendMode);

    // Server list settings
    const [listEnabled, setListEnabled] = host.state.useExtensionState("list_enabled", true);
    const [listSort, setListSort] = host.state.useExtensionState("list_sort", "random" as ListSortType);

    const handleOpenWebsite = function handleOpenWebsite() {
      void host.actions.openExternalLink(MCMSF_WEBSITE);
    };

    const handleOpenAPI = function handleOpenAPI() {
      void host.actions.openExternalLink(`${MCMSF_WEBSITE}/api/`);
    };

    const handleFeaturedToggle = function handleFeaturedToggle(isOn: boolean) {
      setFeaturedEnabled(isOn);
    };

    const handleFeaturedModeChange = function handleFeaturedModeChange(mode: RecommendMode) {
      setFeaturedMode(mode);
    };

    const handleListToggle = function handleListToggle(isOn: boolean) {
      setListEnabled(isOn);
    };

    const handleListSortChange = function handleListSortChange(sort: ListSortType) {
      setListSort(sort);
    };

    const getModeLabel = function getModeLabel(m: string): string {
      const map: Record<string, string> = {
        random: "随机推荐",
        hot: "热门推荐",
        latest: "最新推荐",
        newest: "最新加入",
      };
      return map[m] || m;
    };

    const getListSortLabel = function getListSortLabel(s: string): string {
      const map: Record<string, string> = {
        hot: "热门优先",
        random: "随机推荐",
        time: "时间排序",
      };
      return map[s] || s;
    };

    return React.createElement(
      VStack,
      { align: "stretch", spacing: 6, className: "content-full-y", p: 6 },
      React.createElement(
        HStack,
        { justify: "space-between", align: "center" },
        React.createElement(Text, { fontSize: "lg", fontWeight: "bold" }, "MCMSF 浆果服服务器"),
        React.createElement(Badge, { colorScheme: "green", variant: "subtle" }, "v2.1.0")
      ),
      React.createElement(Divider, null),

      // Featured Server Settings
      React.createElement(
        Card,
        { variant: "outline", borderColor: "gray.200" },
        React.createElement(CardBody, { p: 4 },
          React.createElement(VStack, { align: "stretch", spacing: 4 },
            React.createElement(
              HStack,
              { justify: "space-between", align: "center" },
              React.createElement(HStack, { spacing: 2 },
                React.createElement(Heading, { size: "sm" }, "\u2B50 \u670D\u52A1\u5668\u7CBE\u9009"),
                React.createElement(Badge, { colorScheme: "purple", variant: "subtle", fontSize: "xs" }, "\u5927\u56FE\u63A8\u8350")
              ),
              React.createElement(Switch, {
                isChecked: featuredEnabled,
                onChange: function onSwitchChange(e: any) {
                  handleFeaturedToggle(e.target.checked);
                },
                colorScheme: "blue",
                size: "md",
              })
            ),
            featuredEnabled && React.createElement(
              VBox,
              null,
              React.createElement(FormControl, null,
                React.createElement(FormLabel, { fontSize: "sm" }, "\u63A8\u8350\u6A21\u5F0F"),
                React.createElement(Select, {
                  value: featuredMode,
                  onChange: function onSelectChange(e: any) {
                    handleFeaturedModeChange(e.target.value as RecommendMode);
                  },
                  size: "sm",
                },
                  React.createElement("option", { value: "random" }, "\u968F\u673A\u63A8\u8350 - \u968F\u673A\u5C55\u793A\u4E00\u4E2A\u670D\u52A1\u5668"),
                  React.createElement("option", { value: "hot" }, "\u70ED\u95E8\u63A8\u8350 - \u5C55\u793A\u70ED\u5EA6\u6700\u9AD8\u7684\u670D\u52A1\u5668"),
                  React.createElement("option", { value: "latest" }, "\u6700\u65B0\u63A8\u8350 - \u6700\u65B0\u6DFB\u52A0\u7684\u670D\u52A1\u5668"),
                  React.createElement("option", { value: "newest" }, "\u6700\u65B0\u52A0\u5165 - \u65B0\u52A0\u5165\u7684\u670D\u52A1\u5668")
                ),
                React.createElement(FormHelperText, { fontSize: "xs" },
                  "\u5F53\u524D\uFF1A", getModeLabel(featuredMode)
                )
              )
            )
          )
        )
      ),

      // Server List Settings
      React.createElement(
        Card,
        { variant: "outline", borderColor: "gray.200" },
        React.createElement(CardBody, { p: 4 },
          React.createElement(VStack, { align: "stretch", spacing: 4 },
            React.createElement(
              HStack,
              { justify: "space-between", align: "center" },
              React.createElement(HStack, { spacing: 2 },
                React.createElement(Heading, { size: "sm" }, "\u670D\u52A1\u5668\u5217\u8868"),
                React.createElement(Badge, { colorScheme: "green", variant: "subtle", fontSize: "xs" }, "\u591A\u5361\u7247")
              ),
              React.createElement(Switch, {
                isChecked: listEnabled,
                onChange: function onSwitchChange(e: any) {
                  handleListToggle(e.target.checked);
                },
                colorScheme: "blue",
                size: "md",
              })
            ),
            listEnabled && React.createElement(
              VBox,
              null,
              React.createElement(FormControl, null,
                React.createElement(FormLabel, { fontSize: "sm" }, "\u9ED8\u8BA4\u6392\u5E8F"),
                React.createElement(Select, {
                  value: listSort,
                  onChange: function onSelectChange(e: any) {
                    handleListSortChange(e.target.value as ListSortType);
                  },
                  size: "sm",
                },
                  React.createElement("option", { value: "random" }, "\u968F\u673A\u63A8\u8350"),
                  React.createElement("option", { value: "hot" }, "\u70ED\u95E8\u4F18\u5148"),
                  React.createElement("option", { value: "time" }, "\u65F6\u95F4\u6392\u5E8F")
                ),
                React.createElement(FormHelperText, { fontSize: "xs" },
                  "\u5F53\u524D\uFF1A", getListSortLabel(listSort)
                )
              )
            )
          )
        )
      ),

      React.createElement(Divider, null),

      // About section
      React.createElement(
        VStack,
        { align: "stretch", spacing: 4 },
        React.createElement(Text, { fontSize: "sm", fontWeight: "bold" }, "\u5173\u4E8E"),
        React.createElement(
          Text,
          { fontSize: "sm", color: "gray.600" },
          "\u5F00\u653E\u7684 Minecraft \u670D\u52A1\u5668\u5BA3\u4F20\u5E73\u53F0\uFF0C\u81F4\u529B\u4E8E\u8FDE\u63A5\u670D\u52A1\u5668\u4E0E\u73A9\u5BB6\uFF0C\u63D0\u4F9B\u670D\u52A1\u5668\u5C55\u793A\u3001\u8D44\u6E90\u5171\u4EAB\u4E0E\u4E92\u52A8\u652F\u6301\uFF0C\u5171\u5EFA\u81EA\u7531\u534F\u4F5C\u7684 Minecraft \u591A\u5143\u751F\u6001\u3002"
        )
      ),

      React.createElement(Divider, null),

      // Features
      React.createElement(
        VStack,
        { align: "stretch", spacing: 4 },
        React.createElement(Text, { fontSize: "sm", fontWeight: "bold" }, "\u529F\u80FD\u7279\u6027"),
        React.createElement(
          VStack,
          { align: "stretch", spacing: 2 },
          React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm" }, "\u2022"),
            React.createElement(Text, { fontSize: "sm", color: "gray.600" }, "\u9996\u9875\u5C55\u793A\u7CBE\u9009\u670D\u52A1\u5668\u63A8\u8350\uFF08\u5927\u56FE\uFF09")
          ),
          React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm" }, "\u2022"),
            React.createElement(Text, { fontSize: "sm", color: "gray.600" }, "\u670D\u52A1\u5668\u5217\u8868\u6D4F\u89C8\u4E0E\u7B5B\u9009")
          ),
          React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm" }, "\u2022"),
            React.createElement(Text, { fontSize: "sm", color: "gray.600" }, "\u5E94\u7528\u5185\u67E5\u770B\u670D\u52A1\u5668\u8BE6\u60C5")
          ),
          React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm" }, "\u2022"),
            React.createElement(Text, { fontSize: "sm", color: "gray.600" }, "\u670D\u52A1\u5668\u72B6\u6001\u5B9E\u65F6\u5C55\u793A")
          ),
          React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm" }, "\u2022"),
            React.createElement(Text, { fontSize: "sm", color: "gray.600" }, "\u4E00\u952E\u6DFB\u52A0\u670D\u52A1\u5668\u5230\u5B9E\u4F8B")
          ),
          React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm" }, "\u2022"),
            React.createElement(Text, { fontSize: "sm", color: "gray.600" }, "\u81EA\u5B9A\u4E49\u63A8\u8350\u6A21\u5F0F\u4E0E\u504F\u597D")
          )
        )
      ),

      React.createElement(Divider, null),

      // Links
      React.createElement(
        VStack,
        { align: "stretch", spacing: 4 },
        React.createElement(Text, { fontSize: "sm", fontWeight: "bold" }, "\u76F8\u5173\u94FE\u63A5"),
        React.createElement(
          HStack,
          { spacing: 3 },
          React.createElement(
            Button,
            {
              size: "sm",
              variant: "outline",
              colorScheme: "blue",
              onClick: handleOpenWebsite
            },
            "\u8BBF\u95EE MCMSF \u5B98\u7F51"
          ),
          React.createElement(
            Button,
            {
              size: "sm",
              variant: "outline",
              colorScheme: "blue",
              onClick: handleOpenAPI
            },
            "\u67E5\u770B API \u6587\u6863"
          )
        )
      ),

      React.createElement(Divider, null),

      // Developer info
      React.createElement(
        VStack,
        { align: "stretch", spacing: 3 },
        React.createElement(Text, { fontSize: "sm", fontWeight: "bold" }, "\u5F00\u53D1\u8005"),
        React.createElement(Text, { fontSize: "sm", color: "gray.600" }, "Loong")
      ),

      React.createElement(Box, { flex: 1 }),

      React.createElement(
        Box,
        { pt: 4 },
        React.createElement(
          Text,
          { fontSize: "xs", color: "gray.500" },
          "\u6570\u636E\u6765\u6E90\uFF1A\u6D46\u679C\u670D\u53CB\u8054 (MCMSF)"
        )
      )
    );
  }

  // Helper component for conditional rendering
  function VBox(props: any) {
    return React.createElement(Box, props, props.children);
  }

  return SettingsPage;
}
