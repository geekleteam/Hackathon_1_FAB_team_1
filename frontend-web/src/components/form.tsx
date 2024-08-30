import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SendIcon from "./icons/send";

interface FormData {
  onSubmit: (query: string) => void;
}

const Form: React.FC<FormData> = ({ onSubmit }) => {
  const [query, setQuery] = useState("I need a solution on authentication");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call the onSubmit prop function, which will handle the POST request
    onSubmit(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto mt-8 md:absolute md:bottom-0 md:left-0 md:right-0"
    >
      <div className="relative flex items-center rounded-full border-gray-200 py-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)} // Make input editable
          className="appearance-none bg-[#F3F5F4] border-none w-full rounded-full text-gray-700 py-4 px-4 md:px-2 md:pl-4 md:ml-16 leading-tight focus:outline-none"
          required
        />
        <button
          type="submit"
          className="absolute right-0 mr-3 focus:outline-none"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
};

export default Form;