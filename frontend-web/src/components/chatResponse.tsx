import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Form from "./form";
import Efficiency from "./tables/efficiency";
import Dependency from "./tables/dependency";
import Complexity from "./tables/complexity";
import Learning from "./tables/learning";
import Maintenance from "./tables/maintenance";
interface Param {
  name: string;
  value: string;
}

interface AdditionalNotes {
  totalScoreExplanation: string;
  githubLinks: string;
}

interface ResponseItem {
  summary: string;
  techStack: string;
  additionalNotes: AdditionalNotes;
  params: Param[];
}

interface Prompt {
  id: number;
  text: string;
  response: string; // Add the 'response' property
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
  const [isExternalDependencyChecked, setIsExternalDependencyChecked] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [responseData, setResponseData] = useState<ResponseItem[]>([]);
  const [originalResponse, setOriginalResponse] = useState<string>(""); // State for original response
  const { id } = useParams<{ id?: string }>();

  const handleSubmit = async (query: string) => {
    console.log("Submitted query:", query);
    setSubmitted(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/generate-solutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_input: query,
          // other required request payload
        }),
      });

      const data = await response.json();
      console.log("Backend Response:", data);

      // Set the response data with only relevant information
      if (data.response) {
        setResponseData(data.response);
      }

      // Set the original response (new functionality)
      if (data.original_response) {
        setOriginalResponse(data.original_response);
      }
    } catch (error) {
      console.error("Error submitting query:", error);
    }
  };

  const prompt = id ? prompts.find((p) => p.id === parseInt(id, 10)) : undefined;

  if (!prompt) {
    return null;
  }

  const handleMaintenanceItemChecked = (itemName: string, isChecked: boolean) => {
    if (itemName === "Line of Code") {
      setIsExternalDependencyChecked(isChecked);
    }
    setCheckedCount((prevCount) => {
      const newCount = isChecked ? prevCount + 1 : Math.max(prevCount - 1, 0);
      return newCount;
    });
  };

  return (
    <div className={`flex flex-col p-2 ${submitted ? "overflow-auto" : "overflow-hidden"}`}>
      <div className="p-2 bg-[#F3F5F4] rounded-full mb-2 md:mt-2 ml-auto">
        <div className="text-[16px] text-black mb-2">{prompt.text}</div>
      </div>

      <Form onSubmit={handleSubmit} />

      {/* Existing functionality for displaying prompts */}
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
              onCheckedChange={(isChecked: boolean) => {
                setIsExternalDependencyChecked(isChecked);
                setCheckedCount((prevCount) => {
                  const newCount = isChecked ? prevCount + 1 : Math.max(prevCount - 1, 0);
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

      {/* New functionality: Displaying the backend response data in a table */}
      {responseData.length > 0 && (
        <div className="mt-4">
          {responseData.map((item, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded mb-4">
              <h3 className="text-xl font-semibold">Solution {index + 1}:</h3>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Parameter</th>
                    <th className="py-2 px-4 border-b">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {item.params.map((param, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-4 border-b">{param.name}</td>
                      <td className="py-2 px-4 border-b">{param.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-sm"><strong>Summary:</strong> {item.summary}</p>
              <p className="text-sm"><strong>Tech Stack:</strong> {item.techStack}</p>
              <p className="text-sm"><strong>Notes:</strong> {item.additionalNotes.totalScoreExplanation}</p>
              <a href={item.additionalNotes.githubLinks} className="text-blue-500" target="_blank" rel="noopener noreferrer">GitHub Links</a>
            </div>
          ))}
        </div>
      )}

      {/* Display the original response */}
      {originalResponse && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Original Response:</h3>
          <p className="text-sm">{originalResponse}</p>
        </div>
      )}
    </div>
  );
};

export default ChatResponse;