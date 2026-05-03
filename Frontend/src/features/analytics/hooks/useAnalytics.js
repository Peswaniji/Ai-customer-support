import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOverview, fetchTrends, fetchAgentStats } from "../analytics.slice.js";

const useAnalytics = () => {
  const dispatch = useDispatch();
  const { overview, trends, agentStats, loading, error } = useSelector(
    (state) => state.analytics
  );

  useEffect(() => {
    dispatch(fetchOverview());
    dispatch(fetchTrends());
    dispatch(fetchAgentStats());
  }, []);

  return { overview, trends, agentStats, loading, error };
};

export default useAnalytics;