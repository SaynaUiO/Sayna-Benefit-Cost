import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import { view } from "@forge/bridge";
import { setGlobalTheme } from "@atlaskit/tokens";
import "@atlaskit/css-reset";
import { I18nProvider } from "@forge/react";

// Definerer typen manuelt siden eksporten fra @forge/react varierer mellom versjoner
type ForgeSupportedLocaleCode = "no-NO" | "en-US" | string;

const Root = () => {
  const [locale, setLocale] = useState<ForgeSupportedLocaleCode>("no-NO");

  useEffect(() => {
    view.getContext().then((context) => {
      if (context.locale) {
        setLocale(context.locale as ForgeSupportedLocaleCode);
      }
    });

    const handleLanguageEvent = (e: any) => {
      setLocale(e.detail as ForgeSupportedLocaleCode);
    };

    window.addEventListener("languageChange", handleLanguageEvent);
    return () =>
      window.removeEventListener("languageChange", handleLanguageEvent);
  }, []);

  return (
    <I18nProvider locale={locale as any}>
      <App />
    </I18nProvider>
  );
};

view.theme.enable();
setGlobalTheme({ light: "light", dark: "dark", colorMode: "auto" });

ReactDOM.render(<Root />, document.getElementById("root"));
