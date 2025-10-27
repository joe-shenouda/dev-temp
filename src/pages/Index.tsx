"use client";

import React, { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import ApiKeyInput from "@/components/ApiKeyInput";
import ImageGenerator from "@/components/ImageGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [apiKey, setApiKey] = useState("");

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    toast({
      title: "API Key Saved",
      description: "Your API key has been saved successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Venice API Image Generator</h1>
          <p className="text-gray-600">Generate stunning images using the Venice API</p>
        </div>

        {!apiKey ? (
          <div className="max-w-md mx-auto">
            <ApiKeyInput 
              onApiKeyChange={handleApiKeyChange} 
              initialApiKey={apiKey} 
            />
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Venice API Image Generator</CardTitle>
                  <CardDescription>Enter your API key to start generating images</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setApiKey("")}
                >
                  Change API Key
                </Button>
              </CardHeader>
              <CardContent>
                <ImageGenerator apiKey={apiKey} />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Venice API Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Rate Limits</h3>
                <p className="text-sm text-gray-600">
                  API rate limits depend on your subscription plan. Check your dashboard for specific limits.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Error Codes</h3>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>400 - Bad Request: Invalid parameters</li>
                  <li>401 - Unauthorized: Invalid API key</li>
                  <li>402 - Payment Required: Account billing issue</li>
                  <li>415 - Unsupported Media Type: Invalid content type</li>
                  <li>429 - Too Many Requests: Rate limit exceeded</li>
                  <li>500 - Internal Server Error: Server issue</li>
                  <li>503 - Service Unavailable: API temporarily unavailable</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">API Features</h3>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Image Generation: Create images from text prompts</li>
                  <li>Upscale and Enhance: Improve image quality</li>
                  <li>Edit (Inpaint): Modify specific parts of images</li>
                  <li>Image Styles: Apply artistic styles to images</li>
                  <li>OpenAI Compatible API: Use with existing integrations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;