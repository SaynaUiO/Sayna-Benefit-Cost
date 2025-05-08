import { Fragment, useEffect } from "react";
import { useNavigate } from "react-router";

export const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("goal-structure")
  }, []);

  return (
    <Fragment>
    </Fragment>
  );
};
