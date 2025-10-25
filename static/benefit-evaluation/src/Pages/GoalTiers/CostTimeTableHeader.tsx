import { Flex, Box, xcss } from "@atlaskit/primitives";

export const CostTimeTableHeader = () => {
  const somethingElseCellStyle = xcss({
    width: "140px",
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
    textAlign: "center",
    fontWeight: "bold",
    justifyContent: "center",
  });

  const calcTopCellStyle = xcss({
    height: "50px",
    width: "300px",
    borderRight: "1px solid",
    borderBottom: "1px solid",
    borderColor: "color.border",
    padding: "space.075",
    paddingLeft: "space.200",
    paddingRight: "space.200",
  });

  return (
    <Flex
      direction="row"
      xcss={xcss({
        width: "580px",
        overflowX: "hidden",
      })}
    >
      <Flex direction="column" xcss={calcTopCellStyle}>
        <></>
      </Flex>
      <Box
        xcss={xcss({
          borderRight: "1px solid",
          borderColor: "color.border",
          overflowX: "hidden",
          display: "flex",
          alignItems: "center",
          backgroundColor: "elevation.surface.sunken",
        })}
      >
        <Box xcss={somethingElseCellStyle}>
          <p>Kostnad</p>
        </Box>
      </Box>
      <Box
        xcss={xcss({
          borderRight: "1px solid",
          borderColor: "color.border",
          overflowX: "hidden",
          display: "flex",
          alignItems: "center",
          backgroundColor: "elevation.surface.sunken",
        })}
      >
        <Box xcss={somethingElseCellStyle}>
          <p>Tid</p>
        </Box>
      </Box>
    </Flex>
  );
};
