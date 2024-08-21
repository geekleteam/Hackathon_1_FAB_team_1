import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Sidebar from "./components/sidebar";
import FilterPage from "./components/filterPage";
import ChatInterface from "./components/chatInterface";
import ChatResponse from "./components/chatResponse";
import ChatMarkdown from "./components/chatMarkdown";
import Form from "./components/form";

function App() {
  return (
    <div className="App">
      <Sidebar />
      <Routes>
        {/* Redirect from root to chat-interface */}
        <Route path="/" element={<Navigate to="/chat-interface" />} />
        <Route path="/" element={<Form onSubmit={() => {}} />} />
        <Route path="/chat-interface" element={<ChatInterface />} />
        <Route path="/response/:id" element={<ChatResponse  />} />
        <Route path="/chat-markdown/:id" element={<ChatMarkdown />} />
        <Route path="/filter-Page" element={<FilterPage />} />
      </Routes>
    </div>
  );
}

export default App;
