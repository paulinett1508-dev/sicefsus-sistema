// src/components/admin/UserModal.jsx
import React from "react";
import UserForm from "../UserForm";

const UserModal = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editingUser,
  saving,
}) => {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        <UserForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          onCancel={onCancel}
          editingUser={editingUser}
          saving={saving}
        />
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
  },
};

export default UserModal;
