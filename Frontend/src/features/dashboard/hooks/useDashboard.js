import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBusiness } from "../dashboard.slice.js";

const useDashboard = () => {
  const dispatch = useDispatch();

  const { business, loading: businessLoading, error } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    if (!business) {
      dispatch(fetchMyBusiness());
    }
  }, [dispatch, business]);

  // Default overview data from business
  const overview = business ? {
    totalTickets: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    totalAgents: 0,
  } : null;

  // Default trends data
  const trends = [
    { date: "Mon", count: 0 },
    { date: "Tue", count: 0 },
    { date: "Wed", count: 0 },
    { date: "Thu", count: 0 },
    { date: "Fri", count: 0 },
    { date: "Sat", count: 0 },
    { date: "Sun", count: 0 },
  ];

  if (error) {
    console.error("Dashboard error:", error);
  }

  return {
    business,
    overview,
    trends,
    loading: businessLoading,
    error,
  };
};

export default useDashboard;