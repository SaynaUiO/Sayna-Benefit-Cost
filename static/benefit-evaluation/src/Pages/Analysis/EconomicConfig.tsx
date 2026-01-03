import React, { FormEvent } from "react";
import TextField from "@atlaskit/textfield";
import Lozenge from "@atlaskit/lozenge";
import { Grid, xcss, Box, Stack, Text } from "@atlaskit/primitives";
import { useTranslation } from "@forge/react";

// --- STYLING ---

const explainerTextStyles = xcss({
  color: "color.text.subtle",
  fontSize: "0.9em",
  marginBottom: "space.300",
  paddingBottom: "none",
});

const dynamicTextContainerStyles = xcss({
  display: "flex",
  alignItems: "center",
  whiteSpace: "nowrap",
  gap: "space.050",
  fontSize: "0.85em",
  color: "color.text.subtle",
  marginBottom: "space.050",
});

// --- PROPS ---

interface EconomicConfigProps {
  bpNokFactor: number;
  spNokFactor: number;
  onFactorChange: (factorType: "bp" | "sp", newValue: number) => void;
}

// --- KOMPONENT ---

export const EconomicConfig: React.FC<EconomicConfigProps> = ({
  bpNokFactor,
  spNokFactor,
  onFactorChange,
}) => {
  const { t } = useTranslation();

  const handleChange = (e: FormEvent<HTMLInputElement>, type: "bp" | "sp") => {
    const target = e.target as HTMLInputElement;
    const rawValue = target.value;
    const numericValue = parseFloat(rawValue) || 0;
    onFactorChange(type, numericValue);
  };

  // Bruker toLocaleString for å få riktig skilletegn (komma på norsk, punktum på engelsk)
  const formatForDisplay = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });

  const formatForInput = (value: number) => value.toString();

  // Hjelpefunksjon for å håndtere placeholders i teksten (Option 1 fix for TS)
  const getDynamicText = (key: string, val: number) => {
    return t(key).replace("{{value}}", formatForDisplay(val));
  };

  return (
    <Box xcss={xcss({ padding: "space.300", paddingBottom: "none" })}>
      <Box xcss={explainerTextStyles}>{t("analysis.modal.description")}</Box>

      <Grid
        gap="space.800"
        xcss={xcss({
          gridTemplateColumns: "1fr",
          "@media (min-width: 30rem)": {
            gridTemplateColumns: "150px 150px",
          },
        })}
      >
        {/* --- KOLONNE FOR BP --- */}
        <Stack space="space.0">
          <Box xcss={dynamicTextContainerStyles}>
            <Text>
              <Lozenge appearance="new" isBold>
                BP
              </Lozenge>
              {getDynamicText("analysis.modal.bp_rate", bpNokFactor)}
            </Text>
          </Box>
          <div data-testid="bp-factor">
            <TextField
              value={formatForInput(bpNokFactor)}
              onChange={(e) => handleChange(e, "bp")}
              placeholder="0.225"
              isCompact
              type="number"
              step="0.001"
            />
          </div>
        </Stack>

        {/* --- KOLONNE FOR SP --- */}
        <Stack space="space.0">
          <Box xcss={dynamicTextContainerStyles}>
            <Text>
              <Lozenge appearance="success" isBold>
                SP
              </Lozenge>
              {getDynamicText("analysis.modal.sp_rate", spNokFactor)}
            </Text>
          </Box>
          <div data-testid="sp-factor">
            <TextField
              value={formatForInput(spNokFactor)}
              onChange={(e) => handleChange(e, "sp")}
              placeholder="0.6"
              isCompact
              type="number"
              step="0.001"
            />
          </div>
        </Stack>
      </Grid>
    </Box>
  );
};
