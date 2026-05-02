import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchBusiness, updateBusiness } from "../store/businessSlice";

export const useBusiness = () => {
  const dispatch = useAppDispatch();
  const businessState = useAppSelector((state) => state.business);

  const loadBusiness = async () => dispatch(fetchBusiness()).unwrap();
  const saveBusiness = async (payload) => dispatch(updateBusiness(payload)).unwrap();

  return {
    ...businessState,
    fetchBusiness: loadBusiness,
    updateBusiness: saveBusiness,
  };
};
