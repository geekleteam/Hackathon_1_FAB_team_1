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
    text: "Provide a tech stack solution for IoT Home Automation development",
  },
  {
    id: 2,
    text: "Suggest an Authentication solution and evaluate it on a High, Medium, or Low scale",
  },
];

const ChatInterface: React.FC = () => {
  const [responseData, setResponseData] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (query: string) => {
    setSubmitted(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/generate-solutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: "3b125dbd-ef03-44c6-85b6-beb0905e5ac1",
          requestID: "39b710a7-0be3-4ada-8d5b-370d0808140d",
          modelParameter: { temperature: 0.9 },
          user_input: query,
          filters: ["complexity", "scalability", "cost", "dimensions", "time", "network", "diversity"],
          model_id: "anthropic.claude-3-haiku-20240307-v1:0",
          proposed_solution: "Your proposed solution here",
          tech_stack: "Your tech stack here"
        }),
      });

      const data = await response.json();
      setResponseData(JSON.stringify(data, null, 2)); // Display response data

    } catch (error) {
      console.error("Error submitting query:", error);
      setResponseData("There was an error submitting your query.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="mb-36 max-w-lg px-4 md:px-0">
        <Frame className="ml-48 mb-4 md:mb-4 items-center justify-center" />
        <span className="text-green-500 text-4xl font-normal font-Roboto my-8 md:my-4 sm:my-2">
          Holla,
        </span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-purple-600 h-16 px-2 text-4xl font-normal font-Roboto">
          Engineer!
        </span>
        <br />
        <div className="text-4xl font-normal text-[#767676] font-Roboto">
          Need a bug fix or a Laugh?
        </div>
        <section className="flex flex-col md:flex-row mt-4 md:mt-4 space-y-4 md:space-y-0 md:space-x-4">
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
        </section>
      </div>
      <Form onSubmit={handleSubmit} />

      {/* Display the response data */}
      {responseData && (
        <div className="bg-gray-100 p-4 rounded mt-4 max-w-lg">
          <h3 className="text-xl font-semibold">Response Data:</h3>
          <pre className="text-sm whitespace-pre-wrap">{responseData}</pre>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;