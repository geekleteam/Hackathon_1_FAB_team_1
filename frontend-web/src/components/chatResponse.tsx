import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Efficiency from "./tables/efficiency";
import Dependency from "./tables/dependency";
import Complexity from "./tables/complexity";
import Learning from "./tables/learning";
import Maintenance from "./tables/maintenance";
import Form from "./form";

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

const ChatResponse: React.FC = () => {
  const [isExternalDependencyChecked, setIsExternalDependencyChecked] =
    useState(false);
  const [checkedCount, setCheckedCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [responseData, setResponseData] = useState<string | null>(null);
  const { id } = useParams<{ id?: string }>();

  const handleSubmit = async (query: string) => {
    console.log("Submitted query:", query);
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
      console.log('Backend Response:', data);
      setResponseData(JSON.stringify(data, null, 2)); // Display response data

    } catch (error) {
      console.error("Error submitting query:", error);
    }

    setSubmitted(true);
  };

  const prompt = id
    ? prompts.find((p) => p.id === parseInt(id, 10))
    : undefined;

  if (!prompt) {
    return <div>Prompt not found</div>;
  }

  const handleMaintenanceItemChecked = (
    itemName: string,
    isChecked: boolean
  ) => {
    if (itemName === "Line of Code") {
      setIsExternalDependencyChecked(isChecked);
    }
    setCheckedCount((prevCount) => {
      const newCount = isChecked ? prevCount + 1 : Math.max(prevCount - 1, 0);
      return newCount;
    });
  };

  return (
    <div
      className={`flex flex-col p-2 ${
        submitted ? "overflow-auto" : "overflow-hidden"
      }`}
    >
      <div className="p-2 bg-[#F3F5F4] rounded-full mb-2 md:mt-2 ml-auto">
        <div className="text-[16px] text-black mb-2">{prompt.text}</div>
      </div>
      <div className="p-4 bg-white mt-2 mx-auto max-w-4xl">
        <div className="text-black text-justify whitespace-pre-line py-2">
          {prompt.response}
        </div>
        <div className="text-black -mt-2">Filter table by</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 -mt-8">
          {/* First column for Maintenance and Efficiency */}
          <div className="flex flex-col space-y-2">
            <Maintenance onItemChecked={handleMaintenanceItemChecked} />
            <Efficiency />
          </div>
          {/* Second column for Dependency, Learning, and Complexity */}
          <div className="flex flex-col space-y-2 -ml-16">
            <Dependency
              initialChecked={isExternalDependencyChecked}
              onCheckedChange={(isChecked) => {
                setIsExternalDependencyChecked(isChecked);
                setCheckedCount((prevCount) => {
                  const newCount = isChecked
                    ? prevCount + 1
                    : Math.max(prevCount - 1, 0);
                  return newCount;
                });
              }}
            />
            <Learning />
            <Complexity />
          </div>
        </div>
        <div className="mt-1 bg-[#086224] text-white text-center mr-32 rounded-sm ">
          <Link to={`/chat-markdown/${id}`} className="cursor-pointer">
            Click to filter ({checkedCount})
          </Link>
        </div>
      </div>
      <Form onSubmit={handleSubmit} />
      {responseData && (
        <div className="bg-gray-100 p-4 rounded mt-4">
          <h3 className="text-xl font-semibold">Response Data:</h3>
          <pre className="text-sm">{responseData}</pre>
        </div>
      )}
    </div>
  );
};


export default ChatResponse;