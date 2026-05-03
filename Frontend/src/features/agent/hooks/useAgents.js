import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAgents,
  inviteAgent,
  updateAgentStatus,
  resetInviteSuccess,
} from "../agent.slice.js";

const useAgents = () => {
  const dispatch = useDispatch();
  const { agents, loading, error, inviteSuccess } = useSelector(
    (state) => state.agents
  );

  useEffect(() => {
    dispatch(fetchAgents());
  }, []);

  const invite = (data) => dispatch(inviteAgent(data));

  const toggleStatus = (agentId, isActive) =>
    dispatch(updateAgentStatus({ agentId, isActive: !isActive }));

  const resetSuccess = () => dispatch(resetInviteSuccess());

  return {
    agents,
    loading,
    error,
    inviteSuccess,
    invite,
    toggleStatus,
    resetSuccess,
  };
};

export default useAgents;