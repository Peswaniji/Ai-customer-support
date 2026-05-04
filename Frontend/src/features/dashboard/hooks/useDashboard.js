import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardOverview,
  fetchDashboardTrends,
  fetchMyBusiness,
} from "../dashboard.slice.js";

const useDashboard = () => {
  const dispatch = useDispatch();

  const { business, overview, trends, loading: businessLoading, error } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    if (!business) {
      dispatch(fetchMyBusiness());
    }
    dispatch(fetchDashboardOverview());
    dispatch(fetchDashboardTrends());
  }, [dispatch]);

  if (error) {
    console.error("Dashboard error:", error);
  }

  return {
    business,
    overview,
    trends: trends || [],
    loading: businessLoading,
    error,
  };
};

export default useDashboard;
