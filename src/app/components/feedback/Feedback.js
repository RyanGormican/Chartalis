"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { firestore } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTranslate } from "../translate/TranslateContext";
import "./Feedback.css";

const Feedback = ({ isModalOpen, setIsModalOpen }) => {
  const { translate } = useTranslate();
  const [name, setName] = useState(translate("anonymous"));
  const [suggestion, setSuggestion] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(firestore, "suggestions"), {
        name: name.trim(),
        topic: "Diagramo",
        suggestion: suggestion.trim(),
        timestamp: serverTimestamp(),
        status: "incomplete",
      });
      setName(translate("anonymous"));
      setSuggestion("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding suggestion: ", error);
    }
  };

  const handleProjectClick = async () => {
    try {
      await addDoc(collection(firestore, "feedback"), {
        project: "Diagramo",
        timestamp: serverTimestamp(),
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div
      className={`modal ${isModalOpen ? "show" : ""}`}
      style={{ display: isModalOpen ? "block" : "none" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{translate("feedback")}</h5>
            <button
              type="button"
              className="close"
              onClick={() => setIsModalOpen(false)}
            >
              <Icon icon="mdi:close" width="24" />
            </button>
          </div>
          <div className="modal-body">
            <button className="improvement-button" onClick={handleProjectClick}>
              {translate("signal_improvement")}
            </button>
            <h2>{translate("leave_suggestion")}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">{translate("name")}</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={translate("name_optional")}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="suggestion">{translate("suggestion")}</label>
                <textarea
                  id="suggestion"
                  name="suggestion"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder={translate("suggestion_placeholder")}
                  required
                  className="form-control"
                />
              </div>
              <button type="submit" className="submit-button">
                {translate("submit")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
