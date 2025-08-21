import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePhotoContext } from "@/contexts/PhotoContext";
import { useEditContext } from "@/contexts/EditContext";
import { FrameTemplate, frameTemplates } from "@/assets/frames/frame-templates";

export default function EditPhotoPage() {
  const navigate = useNavigate();
  const { currentPhoto } = usePhotoContext();
  const {
    editState,
    setSelectedFrame,
    setFrameText
  } = useEditContext();

  // Local state
  const [message, setMessage] = useState<string>("");

  // Extract values from edit context
  const { selectedFrame, frameText } = editState;

  // Initialize message with existing frame text
  useEffect(() => {
    if (frameText && message !== frameText) {
      setMessage(frameText);
    }
  }, [frameText]);

  // Set default frame if none selected (prefer frames with text enabled)
  useEffect(() => {
    if (!selectedFrame && frameTemplates.length > 0) {
      // Find a frame with text enabled, or fallback to first frame
      const frameWithText = frameTemplates.find(frame => frame.style.textSettings.enabled);
      setSelectedFrame(frameWithText || frameTemplates[0]);
    }
  }, [selectedFrame, setSelectedFrame]);

  const handleNext = () => {
    // Save message to frame text
    setFrameText(message);
    // Navigate to overlay page
    navigate({ to: "/edit/overlay" });
  };

  const handleFrameSelect = (frame: FrameTemplate) => {
    setSelectedFrame(frame);
  };

  const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (value.length <= 80) {
      setMessage(value);
      // Update the frame text context in real-time
      setFrameText(value);
    }
  };

  // Get proper text style using the frame's text settings (RESTORED FROM WORKING VERSION)
  const getTextStyle = () => {
    if (!selectedFrame || !message || !selectedFrame.style.textSettings.enabled) return { display: 'none' };

    const textSettings = selectedFrame.style.textSettings;
    return {
      position: 'absolute' as const,
      left: `${(textSettings.position.x / 1080) * 100}%`,
      top: `${(textSettings.position.y / 1080) * 100}%`,
      transform: 'translate(0, 0)', // No centering - start from exact position
      fontSize: `${textSettings.fontSize * 0.37}px`, // Scale down for 400px preview (400/1080 = 0.37)
      fontFamily: textSettings.fontFamily,
      color: textSettings.color,
      backgroundColor: textSettings.background || 'transparent',
      padding: `${(textSettings.padding || 0) * 0.37}px`,
      textAlign: textSettings.align as 'left' | 'center' | 'right',
      maxWidth: `${(textSettings.maxWidth || 700) * 0.37}px`, // Scale max width too
      wordWrap: 'break-word' as const,
      whiteSpace: 'pre-wrap' as const,
      zIndex: 10,
    };
  };

  if (!currentPhoto) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="text-center text-white space-y-4">
          <h2 className="text-2xl font-bold text-red-400">No Photo Found</h2>
          <p className="text-lg">Please take a photo first.</p>
          <button
            onClick={() => navigate({ to: "/camera" })}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take Photo
          </button>
        </div>
      </div>
    );
  }

  return (
        <div
      className="bg-[#fefcfc] relative size-full grid grid-cols-2"
      style={{
        backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1680 905\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(158.87 -9.5359 17.702 85.58 -24.242 891.94)\\'><stop stop-color=\\'rgba(184,186,190,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(231,232,233,1)\\' offset=\\'1\\'/></radialGradient></defs></svg>')"
      }}
    >
      {/* Left Panel - Photo */}
      <div className="bg-[#f3f3f4] flex flex-col gap-8 items-center justify-center overflow-hidden px-8 py-8 relative rounded-br-[32px] rounded-tr-[32px] shadow-[32px_32px_64px_0px_rgba(0,0,0,0.04)]">
        <div className="font-['Space_Grotesk'] font-bold leading-[72px] text-[#585d68] text-[64px] text-center tracking-[-1.28px]">
          Your Photo!
        </div>
        <div className="h-[400px] w-[400px] overflow-hidden relative rounded-3xl shadow-[0px_0px_32px_0px_rgba(0,0,0,0.08)]">
          <img
            src={currentPhoto.file_path}
            alt="Your captured photo"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Text overlay - PROPERLY POSITIONED */}
          {selectedFrame && message && selectedFrame.style.textSettings.enabled && (
            <div style={getTextStyle()}>
              {message}
            </div>
          )}



          {/* Frame overlay if selected */}
          {selectedFrame && selectedFrame.frameImage && (
            <img
              src={selectedFrame.frameImage}
              alt="Frame overlay"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )}
        </div>
        <div className="absolute inset-0 pointer-events-none shadow-[-32px_-32px_64px_0px_inset_rgba(0,0,0,0.04)]" />
      </div>

      {/* Right Panel - Controls */}
      <div className="flex flex-col gap-6 items-center justify-start overflow-hidden px-8 py-8 relative rounded-bl-[32px] rounded-tl-[32px]">
                  {/* Message Input Section */}
        <div className="flex flex-col gap-4 items-center w-full">
          <div className="font-['Space_Grotesk'] font-bold leading-[32px] text-[#585d68] text-[28px] text-center tracking-[-0.56px]">
            Write a short message
          </div>
          <div className="flex flex-col gap-2 items-end w-full">
            <div className="font-['Public_Sans'] font-medium leading-[20px] text-[14px] text-[#70747d] w-full text-right">
              <span className="text-red-500">*</span>max 80 chars
            </div>
            <div className="flex h-[70px] items-start p-[12px] w-full border border-[#585d68] rounded-xl">
              <textarea
                value={message}
                onChange={handleMessageChange}
                placeholder="Add your message here..."
                className="w-full h-full font-['Plus_Jakarta_Sans'] font-medium leading-[24px] text-[18px] text-[#70747d] bg-transparent border-none outline-none resize-none"
                maxLength={80}
              />
            </div>
            <div className="font-['Public_Sans'] font-medium leading-[20px] text-[14px] text-[#70747d]">
              {message.length}/80
            </div>
          </div>
        </div>



        {/* Template Selection */}
        <div className="flex flex-col gap-4 items-center w-full flex-1">
          <div className="font-['Space_Grotesk'] font-bold leading-[32px] text-[#585d68] text-[28px] text-center tracking-[-0.56px]">
            Choose Your Template
          </div>
          <div className="flex-1 w-full">
            {/* Template Grid */}
            <div className="grid grid-cols-2 gap-4 w-full h-full">
              {frameTemplates.slice(0, 4).map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleFrameSelect(template)}
                  className={`aspect-square bg-center bg-cover bg-no-repeat overflow-hidden relative rounded shadow-[0px_0px_8px_0px_rgba(0,0,0,0.08)] cursor-pointer transition-all duration-200 ${
                    selectedFrame?.id === template.id
                      ? 'ring-4 ring-blue-500 scale-105'
                      : 'hover:scale-102'
                  }`}
                  style={{ backgroundImage: `url('${template.frameImage}')` }}
                >
                  {/* Template preview content can go here */}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className="w-full">
          <button
            onClick={handleNext}
            disabled={!message.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center px-6 py-4 rounded-xl shadow-[32px_32px_64px_0px_inset_rgba(255,255,255,0.24)] transition-all duration-200"
          >
            <div className="font-['Public_Sans'] font-semibold leading-[32px] text-[#fefcfc] text-[24px] text-center">
              Next
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}