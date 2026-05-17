import type { ExtensionFactoryApi } from "../types/host";

const MCMSF_WEBSITE = "https://mcmsf.com";

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
  } = api.ChakraUI;

  return function SettingsPage() {
    const host = api.getHostContext();

    const handleOpenWebsite = function handleOpenWebsite() {
      void host.actions.openExternalLink(MCMSF_WEBSITE);
    };

    const handleOpenAPI = function handleOpenAPI() {
      void host.actions.openExternalLink(`${MCMSF_WEBSITE}/api/`);
    };

    return React.createElement(
      VStack,
      { align: "stretch", spacing: 6, className: "content-full-y", p: 6 },
      React.createElement(
        HStack,
        { justify: "space-between", align: "center" },
        React.createElement(Text, { fontSize: "lg", fontWeight: "bold" }, "MCMSF 浆果服服务器"),
        React.createElement(Badge, { colorScheme: "green", variant: "subtle" }, "v0.1.0")
      ),
      React.createElement(Divider, null),
      React.createElement(
        VStack,
        { align: "stretch", spacing: 4 },
        React.createElement(Text, { fontSize: "sm", fontWeight: "bold" }, "关于"),
        React.createElement(
          Text,
          { fontSize: "sm", color: "gray.600" },
          "开放的 Minecraft 服务器宣传平台，致力于连接服务器与玩家，提供服务器展示、资源共享与互动支持，共建自由协作的 Minecraft 多元生态。"
        )
      ),
      React.createElement(Divider, null),
      React.createElement(
        VStack,
        { align: "stretch", spacing: 4 },
        React.createElement(Text, { fontSize: "sm", fontWeight: "bold" }, "功能特性"),
        React.createElement(
          VStack,
          { align: "stretch", spacing: 2 },
          React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm" }, "•"),
            React.createElement(Text, { fontSize: "sm", color: "gray.600" }, "首页展示精选服务器推荐")
          ),
          React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm" }, "•"),
            React.createElement(Text, { fontSize: "sm", color: "gray.600" }, "支持按热门、推荐、最新筛选")
          ),
          React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm" }, "•"),
            React.createElement(Text, { fontSize: "sm", color: "gray.600" }, "应用内查看服务器详情")
          ),
          React.createElement(
            HStack,
            { spacing: 2 },
            React.createElement(Text, { fontSize: "sm" }, "•"),
            React.createElement(Text, { fontSize: "sm", color: "gray.600" }, "一键复制服务器IP地址")
          )
        )
      ),
      React.createElement(Divider, null),
      React.createElement(
        VStack,
        { align: "stretch", spacing: 4 },
        React.createElement(Text, { fontSize: "sm", fontWeight: "bold" }, "相关链接"),
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
            "访问 MCMSF 官网"
          ),
          React.createElement(
            Button,
            {
              size: "sm",
              variant: "outline",
              colorScheme: "blue",
              onClick: handleOpenAPI
            },
            "查看 API 文档"
          )
        )
      ),
      React.createElement(Divider, null),
      React.createElement(
        VStack,
        { align: "stretch", spacing: 3 },
        React.createElement(Text, { fontSize: "sm", fontWeight: "bold" }, "开发者"),
        React.createElement(Text, { fontSize: "sm", color: "gray.600" }, "Loong")
      ),
      React.createElement(Box, { flex: 1 }),
      React.createElement(
        Box,
        { pt: 4 },
        React.createElement(
          Text,
          { fontSize: "xs", color: "gray.500" },
          "数据来源：浆果服友联 (MCMSF)"
        )
      )
    );
  };
}
