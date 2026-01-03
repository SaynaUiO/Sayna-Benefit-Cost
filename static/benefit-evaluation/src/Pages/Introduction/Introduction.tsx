import { Box, xcss } from "@atlaskit/primitives";
import { useTranslation } from "@forge/react";

export const Introduction = () => {
  const { t } = useTranslation();

  const boxStyles = xcss({
    borderColor: "color.border.accent.gray",
    borderStyle: "solid",
    borderRadius: "border.radius.300",
    borderWidth: "border.width",
    backgroundColor: "color.background.input.pressed",
    padding: "space.200",
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ paddingBottom: "1rem" }}>{t("introduction_page.title")}</h1>
      {t("introduction_page.intro_text")}

      <h2 style={{ paddingBottom: "1rem" }}>
        {t("introduction_page.understand_title")}
      </h2>
      <section>
        <Box xcss={boxStyles}>
          <p>{t("introduction_page.understand_box.subtitle")}</p>
          <ul>
            <li>{t("introduction_page.understand_box.bullet_1")}</li>
            <li>{t("introduction_page.understand_box.bullet_2")}</li>
            <li>{t("introduction_page.understand_box.bullet_3")}</li>
          </ul>
          <p>{t("introduction_page.understand_box.footer")}</p>
        </Box>
      </section>

      <h2 style={{ paddingBottom: "1rem" }}>
        {t("introduction_page.procedure_title")}
      </h2>
      <Box xcss={boxStyles}>
        <p>{t("introduction_page.procedure_box.subtitle")}</p>
        <ol>
          <li>{t("introduction_page.procedure_box.step_1")}</li>
          <li>{t("introduction_page.procedure_box.step_2")}</li>
          <li>{t("introduction_page.procedure_box.step_3")}</li>
          <li>{t("introduction_page.procedure_box.step_4")}</li>
          <li>{t("introduction_page.procedure_box.step_5")}</li>
        </ol>
      </Box>

      <h2 style={{ paddingBottom: "1rem" }}>
        {t("introduction_page.analysis_title")}
      </h2>
      <Box xcss={boxStyles}>
        <p>{t("introduction_page.analysis_box")}</p>
      </Box>
    </div>
  );
};
