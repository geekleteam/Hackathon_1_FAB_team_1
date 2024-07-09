import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Form from "./form";
import MarkTable from "./markTable";


interface Prompt {
  id: number;
  text: string;
  response: string;
}

const prompts: Prompt[] = [
  {
    id: 1,
    text: "Provide tech stack solutions for IoT Home Automation development",
    response: "Sure! Here are some tech stacks you can consider...",
  },
  {
    id: 2,
    text: "Suggest an Authentication solution and evaluate it on a High, Medium, or Low scale",
    response:
      "I can present tables in markdown format, which is commonly used in documentation and can\n be easily rendered in many platforms. Here's an example",
  },
];

const ChatMarkdown: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const { id } = useParams<{ id?: string }>();

  const handleSubmit = (query: string) => {
    console.log("Submitted query:", query);
    setSubmitted(true);
    // Handle form submission logic here if needed
  };

  const prompt = id ? prompts.find((p) => p.id === parseInt(id, 10)) : undefined;

  if (!prompt) {
    return null; // Handle case where prompt is not found
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
