import { useState, useEffect, useRef } from "react";
import "./HouseholdSelection.css";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

function HouseholdSelection({ onSelectMember, onLogout }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [activeProfileId, setActiveProfileId] = useState(null);
  
  // Form states
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfilePic, setNewProfilePic] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Ref to prevent StrictMode double-creation race condition
  const creatingProfile = useRef(false);

  const fetchProfiles = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const q = query(collection(db, "profiles"), where("ownerId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Prevent concurrent executions from rendering double profiles
        if (creatingProfile.current) return;
        creatingProfile.current = true;

        // Create initial profile for the logged in user
        const initialProfile = {
          name: currentUser.displayName || "My Profile",
          avatar: "neutral-placeholder", 
          ownerId: currentUser.uid,
          createdAt: new Date()
        };
        const docRef = await addDoc(collection(db, "profiles"), initialProfile);
        setMembers([{ id: docRef.id, ...initialProfile }]);
      } else {
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMembers(data);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      setLoading(false);
    } finally {
      // Force loading state to dismiss after max 1000ms (1 sec) to meet user request
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Image Upload and Base64 Compression
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress and convert to Base64 (using JPEG 0.7 quality)
        const base64String = canvas.toDataURL("image/jpeg", 0.7);
        setNewProfilePic(base64String);
        setUploadLoading(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!newProfileName) return;

    try {
      const currentUser = auth.currentUser;
      const profileData = {
        name: newProfileName,
        avatar: newProfilePic || "neutral-placeholder",
        ownerId: currentUser.uid,
      };

      if (modalMode === "add") {
        profileData.createdAt = new Date();
        await addDoc(collection(db, "profiles"), profileData);
      } else if (modalMode === "edit" && activeProfileId) {
        profileData.updatedAt = new Date();
        await updateDoc(doc(db, "profiles", activeProfileId), profileData);
      }
      
      closeModal();
      fetchProfiles();
    } catch (error) {
      alert(`Error ${modalMode === "add" ? "adding" : "updating"} profile: ` + error.message);
    }
  };

  const handleDeleteProfile = async (profileId, e) => {
    e.stopPropagation(); // Prevent card click
    setActiveDropdown(null);

    // Don't allow deleting the last profile
    if (members.length <= 1) {
      alert("You must have at least one profile.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this profile? All medical data attached to this profile name may be orphaned.")) {
      try {
        await deleteDoc(doc(db, "profiles", profileId));
        fetchProfiles();
      } catch (error) {
        alert("Error deleting profile: " + error.message);
      }
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setNewProfileName("");
    setNewProfilePic("");
    setActiveProfileId(null);
    setShowModal(true);
  };

  const openEditModal = (member, e) => {
    e.stopPropagation(); // Prevent card click
    setActiveDropdown(null);
    setModalMode("edit");
    setNewProfileName(member.name);
    setNewProfilePic(member.avatar === "neutral-placeholder" ? "" : member.avatar);
    setActiveProfileId(member.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewProfileName("");
    setNewProfilePic("");
    setActiveProfileId(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const toggleDropdown = (id, e) => {
    e.stopPropagation(); // Prevent card click
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <div className="household-wrapper">
      <div className="household-header">
        <h1 className="household-title">Who's tracking today?</h1>
        <button className="logout-button" onClick={handleLogout}>Log Out</button>
      </div>
      
      <div className="profiles-container">
        {loading ? (
          <p className="loading-profiles">Loading profiles...</p>
        ) : (
          <>
            {members.map((member) => (
              <div 
                key={member.id} 
                className="profile-box" 
                onClick={() => onSelectMember(member)}
              >
                {/* 3-Dot Menu */}
                <div className="profile-menu-container" ref={activeDropdown === member.id ? dropdownRef : null}>
                  <button 
                    className="menu-dot-btn" 
                    onClick={(e) => toggleDropdown(member.id, e)}
                  >
                    ⋮
                  </button>
                  {activeDropdown === member.id && (
                    <div className="dropdown-menu">
                      <button onClick={(e) => openEditModal(member, e)}>Edit Profile</button>
                      <button className="delete-option" onClick={(e) => handleDeleteProfile(member.id, e)}>Delete Profile</button>
                    </div>
                  )}
                </div>

                <div className="profile-avatar-container">
                  {member.avatar === "neutral-placeholder" ? (
                    <div className="neutral-avatar">{member.name.charAt(0).toUpperCase()}</div>
                  ) : (
                    <img 
                      src={member.avatar} 
                      alt={`${member.name}'s avatar`} 
                      className="profile-avatar"
                    />
                  )}
                </div>
                <p className="profile-name">{member.name}</p>
              </div>
            ))}
            
            <div className="profile-box add-profile" onClick={openAddModal}>
              <div className="profile-avatar-container add-icon-container">
                <span className="add-icon">+</span>
              </div>
              <p className="profile-name">Add Profile</p>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal">
            <h3>{modalMode === "add" ? "Add New Profile" : "Edit Profile"}</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>Profile Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Grandma, John, User" 
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Profile Image (Optional)</label>
                <div className="image-upload-container">
                  {newProfilePic && (
                    <div className="image-preview">
                      <img src={newProfilePic} alt="Preview" />
                      <button type="button" className="clear-img-btn" onClick={() => setNewProfilePic("")}>✕</button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file-input"
                    id="avatar-upload"
                  />
                  {!newProfilePic && (
                    <label htmlFor="avatar-upload" className="file-upload-label">
                      {uploadLoading ? "Processing..." : "Choose Image"}
                    </label>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-btn" disabled={uploadLoading}>
                  {modalMode === "add" ? "Create Profile" : "Save Changes"}
                </button>
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HouseholdSelection;
