// WeightField.tsx (FORENKLET TIL KUN WEIGHT)

import Button from "@atlaskit/button";
import Lozenge from "@atlaskit/lozenge";
import { Flex, Box, xcss } from "@atlaskit/primitives";
import TextField from "@atlaskit/textfield";
import Tooltip from "@atlaskit/tooltip";
import EditorAddIcon from "@atlaskit/icon/glyph/editor/add";
import EditorDividerIcon from "@atlaskit/icon/glyph/editor/divider";
import { useState, useRef, useEffect, useCallback } from "react"; // Lagt til useCallback
import { Goal, balancedPointsEnum } from "../../Models";
import { SetWeightPopup } from "./SetWeightPopup";

type WeightFieldProps = {
  goal: Goal;
  submitting: boolean;
  // Fjernet: method: balancedPointsEnum (den er alltid WEIGHT)
  // Fjernet: postfix: string (den er alltid '%')
  onChange: (points: number, method: balancedPointsEnum) => void;
  maxMonetaryValue: number; // Beholdes, men brukes ikke
};

export const WeightField = ({
  goal,
  submitting,
  // Fjernet: method, postfix,
  onChange,
  maxMonetaryValue,
}: WeightFieldProps) => {
  // Hardkode Method og Postfix
  const method = balancedPointsEnum.WEIGHT;
  const postfix = "%";

  // Fjernet: [monetaryValue, setMonetaryValue]
  const [weight, setWeight] = useState<number>(
    goal.balancedPoints?.type === method // Bruker hardkodet method
      ? goal.balancedPoints.value
      : 0
  );
  const [onHover, setHover] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Defensiv sjekk for race condition i parent
  if (!goal) return null;

  const handleSelect = (event: React.MouseEvent<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  // 🌟 KORREKSJON AV useEffect 🌟
  // Du hadde 3 useEffects, hvor de to siste reagerte på weight/monetaryValue.
  // Vi samler nå i én hook. VIKTIG: Kaller onChange kun når weight endres.

  useEffect(() => {
    // Kaller kun for WEIGHT
    onChange(weight, method);
  }, [weight, onChange, method]); // Lagt til 'method' og 'onChange' i dependencies

  // Fjernet den initialiserende useEffect (den er erstattet av statens initialisering)
  /*
    useEffect(() => {
        onChange(weight, balancedPointsEnum.WEIGHT)
        onChange(monetaryValue, balancedPointsEnum.MONETARY)
    }, [])
    */

  // Fjernet useEffect for monetaryValue
  /*
    useEffect(() => {
        onChange(monetaryValue, balancedPointsEnum.MONETARY)
    }, [monetaryValue])
    */

  const handleType = (event: React.FormEvent<HTMLInputElement>) => {
    if (inputRef.current) {
      let value = inputRef.current.value;

      // Fiks for '0' og leading '0'
      if (!value) {
        inputRef.current.value = "0";
      } else if (value.length > 1 && value[0] === "0") {
        inputRef.current.value = value.slice(1);
      }

      // Logikk for kun WEIGHT
      if (+value > 100) {
        inputRef.current.value = "100";
      } else if (isNaN(+value)) {
        inputRef.current.value = weight.toString();
      }
      setWeight(+inputRef.current.value);
    }
  };

  const somethingElseCellStyle = xcss({
    width: "150px",
    paddingLeft: "space.100",
    paddingRight: "space.100",
    display: "flex",
    alignItems: "center",
    cursor: "text",
    ":hover": {
      backgroundColor: "color.background.input.hovered",
    },
    ":focus-within": {
      backgroundColor: "color.background.selected",
    },
  });

  const calcTopCellStyle = xcss({
    height: "65px",
    backgroundColor: "elevation.surface.sunken",
    borderRight: "1px solid",
    borderBottom: "1px solid",
    borderColor: "color.border",
    padding: "space.075",
    paddingLeft: "space.200",
    paddingRight: "space.200",
  });

  return (
    <Flex
      direction="column"
      xcss={xcss({
        width: "150px",
        minWidth: "150px",
      })}
    >
      <Flex direction="column" xcss={calcTopCellStyle}>
        <SetWeightPopup goal={goal} method={method} />
        <Tooltip content={"Weight"}>
          <Lozenge appearance="new">{`${weight} %`}</Lozenge>
        </Tooltip>
      </Flex>
      <Box
        xcss={xcss({
          borderRight: "1px solid",
          borderColor: "color.border",
          overflowX: "hidden",
        })}
      >
        <Box
          xcss={somethingElseCellStyle}
          onClick={handleSelect}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {/* KNAPP FOR Å TREKKE FRA */}
          <Button
            style={{ opacity: onHover ? 100 : 0 }}
            appearance="subtle-link"
            iconBefore={<EditorDividerIcon label="subract" />}
            size={50}
            tabIndex={-1}
            isDisabled={submitting || weight === 0}
            onClick={() => {
              setWeight((currentWeight) =>
                currentWeight !== 0 ? currentWeight - 1 : currentWeight
              );
            }}
          />
          {/* TEKSTFELT */}
          <TextField
            name={`${goal.id}`}
            onClick={handleSelect}
            appearance="none"
            autoComplete="off"
            isDisabled={submitting}
            ref={inputRef}
            value={weight}
            style={{
              textAlign: "center",
            }}
            aria-label="customized text field"
            onChange={handleType}
          />
          {/* KNAPP FOR Å LEGGE TIL */}
          <Button
            style={{ opacity: onHover ? 100 : 0 }}
            appearance="subtle-link"
            iconBefore={<EditorAddIcon label="add" />}
            size={50}
            tabIndex={-1}
            isDisabled={submitting || weight === 100}
            onClick={() => {
              weight < 100 && setWeight((currentWeight) => currentWeight + 1);
            }}
          />
        </Box>
      </Box>
    </Flex>
  );
};
