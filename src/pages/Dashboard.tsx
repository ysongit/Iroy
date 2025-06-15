import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { C2PAServiceAddress, C2PAServiceABI } from '../contractdata';
import Logo from '../assets/logo.png';
import Icon1 from '../assets/icon1.png';
import Icon2 from '../assets/icon2.png';
import Icon3 from '../assets/icon3.png';

interface ChatMessage {
  sender: 'user' | 'ai';
  text?: string; // Text is optional for image messages
  imageUrl?: string; // URL for displaying image
  base64Data?: string; // Base64 data for sending to API
}

const Dashboard: React.FC = () => {
  const changePage = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callGeminiApi = async (prompt: string): Promise<string> => {
    try {
      const contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(prompt));
      console.log(contentHash);

      const claimGenerator = "test-generator";
      const claimSignature = "test-signature";
      const metadata = JSON.stringify({
          claimType: "c2pa.claim",
          contentFormat: "text",
          generator: claimGenerator,
          signature: claimSignature,
          timestamp: Math.floor(Date.now() / 1000),
          assertions: ["test-assertion"],
          editHistory: ["test-edit"],
          aiGenerationInfo: ["test-ai-info"]
      });

      await window.ethereum.request({ method: "eth_requestAccounts" });

      let provider = new ethers.providers.Web3Provider(window.ethereum);

      let signer = provider.getSigner();

      // Create the contract instance connected to the signer
      let c2paService = new ethers.Contract(C2PAServiceAddress, C2PAServiceABI, signer);

      const address = await signer.getAddress();
      console.log("Wallet connected:", address);
      console.log("c2paService contract initialized.");

      const tx = await c2paService.assertContent(
        contentHash,
        claimGenerator,
        claimSignature,
        metadata,
        { gasLimit: 1e6 });
    
      const receipt = await tx.wait();
      console.log(receipt);

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      return "Success, here is the report";
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "Success, here is the report";
    }
  };

  // Handle sending a message (user prompt)
  const handleSendMessage = async () => {
    if (inputPrompt.trim() === '') return;

    const newUserMessage: ChatMessage = {
      sender: 'user',
      text: inputPrompt.trim() !== '' ? inputPrompt : undefined,
      imageUrl: uploadedImage || undefined,
      base64Data: uploadedImage || undefined
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputPrompt(''); // Clear the input field immediately

    setLoading(true); // Show loading indicator
    const aiResponseText = await callGeminiApi(inputPrompt);
    setLoading(false); // Hide loading indicator

    const newAiMessage: ChatMessage = { sender: 'ai', text: aiResponseText };
    setMessages((prevMessages) => [...prevMessages, newAiMessage]);
  };

  // Handle key press in the input field
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !loading) {
      handleSendMessage();
    }
  };

  // Trigger file input click when icon is clicked
  const handleFileUploadIconClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove the "data:image/png;base64," prefix if it exists, as the API expects pure base64
        const base64String = reader.result as string;
        const pureBase64 = base64String.split(',')[1];
        setUploadedImage(pureBase64); // Store base64 for sending to API and preview
      };
      reader.readAsDataURL(file); // Reads the file as a Base64 encoded string
    }
  };

  // Handle removing the uploaded image preview
  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input as well
    }
  };

  return (
    <div className="flex h-screen bg-[#030322] text-white font-inter">
      {/* Sidebar */}
      <aside className="w-64 bg-[#030322] border-r border-gray-800 flex flex-col p-4">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8 px-2">
          <img src={Logo} alt="Logo" />
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul>
            <li className="mb-2">
              <a
                href="#"
                className="flex items-center space-x-3 p-3 rounded-lg bg-[#747474] text-[#FFFFFF] font-medium"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>Check</span>
              </a>
            </li>
            <li className="mb-2">
              <a
                href="#"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>History</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-gray-900">
        {/* Header for Main Content */}
        <header className="flex justify-end items-center p-4 border-b border-gray-800">
          <div className="flex items-center space-x-4">
            <svg
              className="w-7 h-7 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
              <img
                src="https://placehold.co/36x36/6B7280/FFFFFF?text=User"
                alt="User Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/36x36/6B7280/FFFFFF?text=User';
                }}
              />
            </div>
          </div>
        </header>

        {/* Main Chat Area */}
        <div className="flex-1 p-8 flex flex-col overflow-y-auto">
          <div className="w-full h-full rounded-xl p-4 flex flex-col"> {/* Removed justify-end to stack from top */}
            {/* Get full report button */}
            <div className="flex justify-end mb-4">
              <button onClick={() => changePage("/summary")} className="flex items-center space-x-2 px-4 py-2 bg-transparent text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-5m-2 5h4m-7 0h14a2 2 0 002-2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>Get full report</span>
              </button>
            </div>

            {messages.length === 0 ? (
              <div className="flex flex-grow items-center justify-center text-white-500 text-lg">
                Start typing your prompt below.
              </div>
            ) : (
              <div className="flex flex-col space-y-4 overflow-y-auto pr-2 flex-grow"> {/* flex-grow to push input to bottom */}
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-[#202020] self-end text-white'
                        : 'self-start text-white'
                    }`}
                    style={{ maxWidth: '80%' }}
                  >
                    {msg.text && <span>{msg.text}</span>}
                    {msg.imageUrl && (
                        <img
                            src={`data:image/png;base64,${msg.imageUrl}`} // Prepend with data URL scheme for display
                            alt="Uploaded"
                            className="max-w-full h-auto rounded-md mt-2"
                        />
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
            {loading && (
              <div className="flex justify-center items-center mt-4 text-blue-400">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating response...
              </div>
            )}
          </div>
        </div>

        {/* Prompt Input Field */}
        <div className="p-8 pt-0 flex items-end">
          <div className="relative flex flex-col items-center w-full bg-[#202020] rounded-4xl border border-[#8C8C8C] px-4 py-3 shadow-lg">
            {uploadedImage && (
              <div className="relative mb-3 p-2 bg-gray-700 rounded-lg self-start">
                <img
                  src={`data:image/png;base64,${uploadedImage}`}
                  alt="Preview"
                  className="max-h-24 rounded-md"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white text-xs leading-none"
                  aria-label="Remove image"
                >
                  &times;
                </button>
              </div>
            )}
            <div className="flex items-center w-full">
              <input
                type="text"
                placeholder={loading ? "Generating response..." : "Start typing prompt"}
                className="flex-1 bg-transparent outline-none text-gray-300 placeholder-gray-500 text-lg"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading} // Disable input while loading
              />
              
              <div className="flex items-center space-x-3 ml-4">
                <img className="w-6 h-6 text-gray-400 hover:text-blue-400 transition-colors duration-200 cursor-pointer" src={Icon1} alt="Icon1" />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" // Hide the default file input
                  accept="image/*" // Accept only image files
                />
                <img onClick={handleFileUploadIconClick} className="w-6 h-6 text-gray-400 hover:text-blue-400 transition-colors duration-200 cursor-pointer" src={Icon2} alt="Icon2" />
              </div>
            </div>
          </div>
          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={loading || inputPrompt.trim() === ''}
            className="border border-[#8C8C8C] py-2 px-3 ml-2 rounded-full bg-[#202020] text-[#8C8C8C] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img className="w-6 h-6" src={Icon3} alt="Icon3" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
