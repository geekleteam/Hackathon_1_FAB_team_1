import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Form from "./form";
import MarkTable from "./markTable";

interface Prompt {
  id: number;
  text: string;
  response: string;
}

const ChatMarkdown: React.FC = () => {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await fetch(`/api/prompts/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch prompt data");
        }
        const data: Prompt = await response.json();
        setPrompt(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPrompt();
    }
  }, [id]);

  const handleSubmit = (query: string) => {
    console.log("Submitted query:", query);
    setSubmitted(true);
    // Handle form submission logic here if needed
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!prompt) {
    return <div>No prompt found for the given ID.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="p-2 bg-[#F3F5F4] rounded-full mb-2 md:mt-2 ml-auto">
        <div className="text-[16px] text-black mb-2">{prompt.text}</div>
      </div>
      <div className="p-4 bg-white -mt-4 mx-auto max-w-4xl flex flex-col">
        <div className="text-black text-justify whitespace-pre-line py-2 pl-48">
          {prompt.response}
        </div>
        <div className="overflow-x-auto w-full pl-48">
          <MarkTable data={[]} />
        </div>
      </div>
      
      <Form onSubmit={handleSubmit} />
    </div>
  );
};

export default ChatMarkdown;
