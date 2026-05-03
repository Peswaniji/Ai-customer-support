import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBusinessInfo,
  updateBusinessInfo,
  fetchWidgetCode,
  resetUpdateSuccess,
} from "../settings.slice.js";

const useSettings = () => {
  const dispatch = useDispatch();
  const { business, widgetCode, loading, updateLoading, updateSuccess, error } =
    useSelector((state) => state.settings);

  useEffect(() => {
    dispatch(fetchBusinessInfo());
    dispatch(fetchWidgetCode());
  }, []);

  const update = (data) => dispatch(updateBusinessInfo(data));
  const resetSuccess = () => dispatch(resetUpdateSuccess());

  return {
    business,
    widgetCode,
    loading,
    updateLoading,
    updateSuccess,
    error,
    update,
    resetSuccess,
  };
};

export default useSettings;