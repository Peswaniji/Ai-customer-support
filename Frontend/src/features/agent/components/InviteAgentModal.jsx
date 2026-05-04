import { useState, useEffect } from "react";
import useAgents from "../hooks/useAgents.js";
import "../styles/InviteAgentModal.scss";

const InviteAgentModal = ({ onClose }) => {
  const { invite, loading, error, inviteSuccess, resetSuccess } = useAgents();
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    if (inviteSuccess) {
      resetSuccess();
      onClose();
    }
  }, [inviteSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await invite(form);
    } catch {
      // Error is stored in Redux and rendered in the modal.
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Invite Agent</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <p className="modal__sub">
          Agent will receive an email to set their password.
        </p>

        {error && <div className="modal__error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal__form">
          <div className="modal__field">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Rahul Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="modal__field">
            <label>Email</label>
            <input
              type="email"
              placeholder="agent@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="modal__actions">
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteAgentModal;
