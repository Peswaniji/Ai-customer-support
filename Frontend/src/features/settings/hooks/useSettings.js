import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBusinessInfo,
  fetchPlans,
  fetchUsage,
  updateBusinessInfo,
  fetchWidgetCode,
  resetUpdateSuccess,
  upgradePlan,
} from "../settings.slice.js";

const useSettings = () => {
  const dispatch = useDispatch();
  const { business, widgetCode, usage, plans, loading, updateLoading, updateSuccess, error } =
    useSelector((state) => state.settings);

  useEffect(() => {
    dispatch(fetchBusinessInfo());
    dispatch(fetchWidgetCode());
    dispatch(fetchUsage());
    dispatch(fetchPlans());
  }, []);

  const update = (data) => dispatch(updateBusinessInfo(data)).unwrap();
  const changePlan = (plan) => dispatch(upgradePlan(plan));
  const resetSuccess = () => dispatch(resetUpdateSuccess());

  return {
    business,
    widgetCode,
    usage,
    plans,
    loading,
    updateLoading,
    updateSuccess,
    error,
    update,
    changePlan,
    resetSuccess,
  };
};

export default useSettings;
