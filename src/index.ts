import type { ExtensionFactory, ExtensionFactoryApi } from "./types/host";
import { createServerDetailPage } from "./pages/server-detail-page";
import { createSettingsPage } from "./pages/settings-page";
import { createMCMSFServersWidget } from "./widgets/home-mcmsf-servers";

(function registerMCMSFExtension(factory: ExtensionFactory) {
  const token = document.currentScript?.dataset?.extensionToken || "";

  if (!token) {
    throw new Error("Missing extension activation token");
  }

  if (typeof window.registerExtension !== "function") {
    throw new Error("SJMCL host is unavailable");
  }

  window.registerExtension(factory, token);
})(function createExtension(api: ExtensionFactoryApi) {
  return {
    homeWidgets: [
      {
        key: "mcmsf-servers",
        title: "浆果服推荐服务器",
        description: "展示 MCMSF 精选服务器、热门服务器或本周推荐",
        defaultWidth: 400,
        minWidth: 350,
        Component: createMCMSFServersWidget(api),
      },
    ],
    settingsPage: {
      Component: createSettingsPage(api),
    },
    pages: [
      {
        routePath: "server-detail",
        Component: createServerDetailPage(api),
      },
    ],
  };
});
