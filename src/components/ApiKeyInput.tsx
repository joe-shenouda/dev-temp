"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiKeyInputProps {
  onApiKeyChange: (apiKey: string) => void;
  initialApiKey: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeyChange, initialApiKey }) => {
  const [apiKey, setApiKey] = useState(initialApiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApiKeyChange(apiKey);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>API Key Required</CardTitle>
        <CardDescription>Enter your Venice API key to generate images</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Venice API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key here"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Save API Key
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;