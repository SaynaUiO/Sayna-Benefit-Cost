import React, { FormEvent } from "react";
import TextField from "@atlaskit/textfield";
import Lozenge from "@atlaskit/lozenge";
import { Grid, xcss, Box, Stack, Text } from "@atlaskit/primitives";

// --- STYLING ---

// Styles for den forklarende teksten
const explainerTextStyles = xcss({
  color: "color.text.subtle",
  fontSize: "0.9em",
  marginBottom: "space.300",
  paddingBottom: "none", // Sikrer at det ikke er dobbel padding i bunn
});

// Styles for den dynamiske teksten (1 BP = X millioner NOK)
const dynamicTextContainerStyles = xcss({
  // Sikrer at innholdet vises på én linje og justeres vertikalt
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
  const handleChange = (e: FormEvent<HTMLInputElement>, type: "bp" | "sp") => {
    const target = e.target as HTMLInputElement;
    const rawValue = target.value;

    // Bruker type="number" og standard parsing med punktum.
    // parseFloat garanterer at hvis feltet er tomt, blir det 0.
    const numericValue = parseFloat(rawValue) || 0;

    onFactorChange(type, numericValue);
  };

  // Formaterer tallet til 3 desimaler med KOMMA for visning i den dynamiske teksten
  const formatForDisplay = (value: number) =>
    value.toFixed(3).replace(".", ",");

  // Returnerer tallet som STRING uten å endre til komma (TextField type="number" krever punktum)
  const formatForInput = (value: number) => value.toString();

  return (
    // Fjerner unødvendig padding nederst da Modalen har sin egen struktur
    <Box xcss={xcss({ padding: "space.300", paddingBottom: "none" })}>
      {/* NYTT: Forklarende tekst over inputfeltene */}
      <Box xcss={explainerTextStyles}>
        Angi konverteringsfaktorene for å omgjøre Nyttepoeng (BP) og Kostnad
        (SP) til en beregnet verdi i Millioner NOK. Endringer oppdaterer den
        finansielle planen umiddelbart.
      </Box>

      <Grid
        gap="space.800"
        xcss={xcss({
          gridTemplateColumns: "1fr",
          "@media (min-width: 30rem)": {
            gridTemplateColumns: "150px 150px", // To smale, elegante felt
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
              1 BP = {formatForDisplay(bpNokFactor)} millioner NOK
            </Text>
          </Box>
          <div data-testid="bp-factor">
            <TextField
              value={formatForInput(bpNokFactor)}
              onChange={(e) => handleChange(e, "bp")}
              placeholder="0.225" // Bruker punktum i placeholder
              isCompact
              type="number"
              step="0.001" // Tillater 3 desimaler
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
              1 SP = {formatForDisplay(spNokFactor)} millioner NOK
            </Text>
          </Box>
          <div data-testid="sp-factor">
            <TextField
              value={formatForInput(spNokFactor)}
              onChange={(e) => handleChange(e, "sp")}
              placeholder="0.6" // Bruker punktum i placeholder
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
