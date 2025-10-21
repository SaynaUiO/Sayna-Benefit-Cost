import React, { useMemo } from "react";
import DynamicTable from "@atlaskit/dynamic-table";
import Tooltip from "@atlaskit/tooltip";
import Button from "@atlaskit/button";
import HipchatChevronDoubleUpIcon from "@atlaskit/icon/glyph/hipchat/chevron-double-up";
import HipchatChevronDoubleDownIcon from "@atlaskit/icon/glyph/hipchat/chevron-double-down";

// Importer typen for periodiseringsresultatene
import { PeriodizationPeriodResult } from "./periodizationCalculations"; // Antar at stien er riktig

// Definerer props for denne komponenten
interface TotalResultsTableProps {
  periodizationResults: PeriodizationPeriodResult[];
  numberOfPeriods: number;
  incrementYears: () => void;
  decrementYears: () => void;
  MIN_YEARS: number;
  MAX_YEARS: number;
}

// Definisjon av head for totaltabellen (Flyttet fra Analysis.tsx)
const totalTableHead = {
  cells: [
    { key: "period", content: "År" },
    { key: "grossBenefit", content: "Brutto Gevinst (BP)" },
    { key: "grossCost", content: "Brutto Kostnad (SP)" },
    { key: "netPoints", content: "Netto Poeng" },
    { key: "discount", content: "Discount Factor " },
    { key: "netNPV", content: "Netto Nåverdi" },
    { key: "accumulatedNPV", content: "Akkumulert NPV" },
  ],
};

export const TotalResultsTable: React.FC<TotalResultsTableProps> = ({
  periodizationResults,
  numberOfPeriods,
  incrementYears,
  decrementYears,
  MIN_YEARS,
  MAX_YEARS,
}) => {
  // Lager rader for totaltabellen basert på periodizationResults (Flyttet fra Analysis.tsx)
  const totalTableRows = useMemo(() => {
    return periodizationResults.map((result) => ({
      key: `p-${result.period}`,
      cells: [
        { key: "period", content: `${result.period}` },
        { key: "grossBenefit", content: String(result.grossBenefit) },
        { key: "grossCost", content: String(result.grossCost) },
        { key: "netPoints", content: String(result.netPoints) },
        { key: "discount", content: String(result.discountFactor) },
        { key: "netNPV", content: String(result.netPresentValue) },
        { key: "accumulatedNPV", content: String(result.accumulatedNPV) },
      ],
    }));
  }, [periodizationResults]);

  return (
    <div>
      {/* KONTROLL FOR TIDSRAMME (KNAPPER) - Flyttet fra Analysis.tsx */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h3 style={{ marginRight: "10px" }}>
          Finansiell plan over {numberOfPeriods} år
        </h3>

        {/* Knapp for å redusere år */}
        <Tooltip content={"Reduser antall år"}>
          <Button
            onClick={decrementYears}
            isDisabled={numberOfPeriods <= MIN_YEARS}
            iconBefore={<HipchatChevronDoubleDownIcon label="Reduser år" />}
          />
        </Tooltip>

        {/* Knapp for å øke år */}
        <Tooltip content={"Øk antall år"}>
          <Button
            onClick={incrementYears}
            isDisabled={numberOfPeriods >= MAX_YEARS}
            iconBefore={<HipchatChevronDoubleUpIcon label="Øk år" />}
          />
        </Tooltip>
      </div>

      <DynamicTable
        head={totalTableHead}
        rows={totalTableRows}
        rowsPerPage={4}
        defaultPage={1}
      />
    </div>
  );
};
