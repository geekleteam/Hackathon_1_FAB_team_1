import React, { useState } from "react";
import { Link } from "react-router-dom";
import Frame from "./icons/frame";
import SmileyIcon from "./icons/smiley";
import CodeIcon from "./icons/code";
import Form from "./form";

interface Prompt {
  id: number;
  text: string;
}

const prompts: Prompt[] = [
  {
    id: 1,
    text: "Provide a tech stack solutions for IoT Home Automation development",
  },
  {
    id: 2,
    text: "Suggest an Authentication solution and evaluate it on a High, Medium, or low scale",
  },
];

const ChatInterface: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (query: string) => {
    console.log("Submitted query:", query);
    // Example: You can add further logic to handle the query
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="mb-36 max-w-lg px-4 md:px-0">
        {/* <Frame className="ml-48 mb-4 md:mb-4 items-center justify-center" /> */}
        <span className="text-green-500 text-4xl font-normal font-Roboto my-8 md:my-4 sm:my-2">
          Holla,
        </span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-purple-600 h-16 px-2 text-4xl font-normal font-Roboto">
          Engineer!
        </span>
        <br />
        <div className="text-4xl font-normal text-[#767676] font-Roboto">
          Need a Design Solution?
        </div>
        {/* <section className="flex flex-col md:flex-row mt-4 md:mt-4 space-y-4 md:space-y-0 md:space-x-4">
          {prompts.map((prompt) => (
            <Link
              key={prompt.id}
              to={`/response/${prompt.id}`}
              className="p-4 bg-gray-100 rounded-lg"
            >
              <div className="border relative p-4 flex-grow min-h-[150px]">
                {prompt.text} <br />
                {prompt.id === 2 && (
                  <CodeIcon className="absolute bottom-2 right-2" />
                )}
                {prompt.id === 1 && (
                  <SmileyIcon className="absolute bottom-2 right-2" />
                )}
              </div>
            </Link>
          ))}
        </section> */}
      </div>
      <Form onSubmit={handleSubmit} />
    </div>
  );
};

export default ChatInterface;
