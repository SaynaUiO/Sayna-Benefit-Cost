import { Box, xcss } from "@atlaskit/primitives";

export const Introduction = () => {
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
      <h1 style={{ paddingBottom: "1rem" }}>Velkommen til BenefitOKR</h1>
      BenefitOKR management er en strategisk tilnærming for å vurdere om
      investeringene i et prosjekt kan rettferdiggjøres ut fra nytten det gir.
      Mer informasjon om BenefitOKR management finner du nedenfor.
      <h2 style={{ paddingBottom: "1rem" }}>Forstå BenefitOKR Management</h2>
      <section>
        <Box xcss={boxStyles}>
          <p>Innebærer:</p>
          <ul>
            <li>
              Å vurdere hvilken nytte et prosjekt forventes å levere, for
              eksempel forbedrede tjenester eller økt salg.
            </li>
            <li>
              Å sammenligne denne nytten med de tilhørende livssykluskostnadene.
            </li>
            <li>
              Å kontinuerlig overvåke og evaluere utviklingsaktiviteter for å
              sikre at produkter med høy nytte-kostnadsverdi leveres.
            </li>
          </ul>
          <p>
            Dette gir deg et mål for å estimere verdien av
            utviklingsaktiviteter, i tillegg til de tradisjonelle målene for
            tid, kostnad og omfang.
          </p>
        </Box>
      </section>
      <h2 style={{ paddingBottom: "1rem" }}>Vanlige fremgangsmåte</h2>
      <Box xcss={boxStyles}>
        <p>
          Dette er noen av de typiske trinnene i BenefitOKR-prosessen som du vil
          utføre i denne appen:
        </p>
        <ol>
          <li>
            Opprette en målsamling og legge til mål for prosjektet
            (Målstruktur-siden)
          </li>
          <li>
            Tilordne verdier – enten vekting eller pengeverdi (verdi­poeng) –
            til alle målene (Målstruktur-siden)
          </li>
          <li>Tilordne kostnad og tid til hver epic (Målstruktur-siden)</li>
          <li>
            Tilordne nyttepoeng for å estimere hvor mye hver epic forventes å
            bidra (nytte) til målene (Estimerings-siden)
          </li>
          <li>
            Se og evaluere rekkefølgen for hvordan epics bør fullføres
            (Periodiserings-siden)
          </li>
        </ol>
      </Box>
      <h2 style={{ paddingBottom: "1rem" }}>Periodisering</h2>
      <Box xcss={boxStyles}>
        <p>
          Periodisering handler om å fordele nytte (BP) og kostnad (SP) over tid
          for å gi et mer realistisk bilde av et prosjekts økonomiske utvikling.
          I stedet for å anta at gevinster og kostnader oppstår umiddelbart,
          benyttes forhåndsdefinerte periodiseringsprofiler som viser hvordan
          verdiskapning og utgifter fordeler seg gjennom prosjektets levetid.
          Ved å bruke slike profiler kan man estimere den totale nytten og
          kostnaden for hver Epic, og deretter beregne indikatorer som netto
          nåverdi (NPV) og akkumulert netto nåverdi (Accumulated NPV). Dette gir
          et helhetlig grunnlag for å vurdere økonomisk verdi og risiko over
          tid.
        </p>
      </Box>
    </div>
  );
};
