import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAgents,
  inviteAgent,
  updateAvailability,
  updateAgentStatus,
  resetInviteSuccess,
} from "../agent.slice.js";

const useAgents = () => {
  const dispatch = useDispatch();
  const { agents, loading, error, inviteSuccess, availabilityStatus } = useSelector(
    (state) => state.agents
  );

  useEffect(() => {
    dispatch(fetchAgents());
  }, []);

  const invite = (data) =>
    dispatch(inviteAgent(data))
      .unwrap()
      .then((result) => {
        dispatch(fetchAgents());
        return result;
      });

  const toggleStatus = (agentId, isActive) =>
    dispatch(updateAgentStatus({ agentId, isActive: !isActive }));

  const setAvailability = (status) => dispatch(updateAvailability(status));

  const resetSuccess = () => dispatch(resetInviteSuccess());

  return {
    agents,
    loading,
    error,
    inviteSuccess,
    availabilityStatus,
    invite,
    toggleStatus,
    setAvailability,
    resetSuccess,
  };
};

export default useAgents;
