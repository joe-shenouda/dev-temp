"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon } from "lucide-react";

interface ImageGeneratorProps {
  apiKey: string;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ apiKey }) => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [model, setModel] = useState("hidream");
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [steps, setSteps] = useState(20);
  const [cfgScale, setCfgScale] = useState(7.5);
  const [seed, setSeed] = useState(0);
  const [variants, setVariants] = useState(1);
  const [format, setFormat] = useState("webp");
  const [stylePreset, setStylePreset] = useState("none");
  const [safeMode, setSafeMode] = useState(true);
  const [hideWatermark, setHideWatermark] = useState(false);
  const [embedExifMetadata, setEmbedExifMetadata] = useState(false);
  const [loraStrength, setLoraStrength] = useState(50);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Venice API key first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setImages([]);

    try {
      const requestBody: any = {
        prompt,
        negative_prompt: negativePrompt,
        model,
        width,
        height,
        steps,
        cfg_scale: cfgScale,
        seed: seed || undefined,
        variants,
        format,
        safe_mode: safeMode,
        hide_watermark: hideWatermark,
        embed_exif_metadata: embedExifMetadata,
        lora_strength: loraStrength,
      };

      // Only add style_preset if it's not "none"
      if (stylePreset !== "none") {
        requestBody.style_preset = stylePreset;
      }

      const response = await fetch("https://api.venice.ai/api/v1/image/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setImages(data.images);
      
      toast({
        title: "Success!",
        description: `Generated ${data.images.length} image(s)`,
      });
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Generator</CardTitle>
          <CardDescription>Generate images using Venice API</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt *</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="negative-prompt">Negative Prompt</Label>
              <Textarea
                id="negative-prompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="What you don't want in the image..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hidream">HiDream</SelectItem>
                    <SelectItem value="venice-sd35">Venice SD3.5</SelectItem>
                    <SelectItem value="lustify-sdxl">Lustify SDXL</SelectItem>
                    <SelectItem value="lustify-v7">Lustify V7</SelectItem>
                    <SelectItem value="qwen-image">Qwen Image</SelectItem>
                    <SelectItem value="wai-Illustrious">WAI Illustrious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style-preset">Style Preset</Label>
                <Select value={stylePreset} onValueChange={setStylePreset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="3D Model">3D Model</SelectItem>
                    <SelectItem value="Analog Film">Analog Film</SelectItem>
                    <SelectItem value="Anime">Anime</SelectItem>
                    <SelectItem value="Cinematic">Cinematic</SelectItem>
                    <SelectItem value="Comic Book">Comic Book</SelectItem>
                    <SelectItem value="Digital Art">Digital Art</SelectItem>
                    <SelectItem value="Enhance">Enhance</SelectItem>
                    <SelectItem value="Fantasy Art">Fantasy Art</SelectItem>
                    <SelectItem value="Isometric">Isometric</SelectItem>
                    <SelectItem value="Line Art">Line Art</SelectItem>
                    <SelectItem value="Low Poly">Low Poly</SelectItem>
                    <SelectItem value="Neon Punk">Neon Punk</SelectItem>
                    <SelectItem value="Origami">Origami</SelectItem>
                    <SelectItem value="Photographic">Photographic</SelectItem>
                    <SelectItem value="Pixel Art">Pixel Art</SelectItem>
                    <SelectItem value="Texture">Texture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width: {width}px</Label>
                <Slider
                  min={256}
                  max={1280}
                  step={64}
                  value={[width]}
                  onValueChange={(value) => setWidth(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label>Height: {height}px</Label>
                <Slider
                  min={256}
                  max={1280}
                  step={64}
                  value={[height]}
                  onValueChange={(value) => setHeight(value[0])}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Steps: {steps}</Label>
                <Slider
                  min={1}
                  max={50}
                  value={[steps]}
                  onValueChange={(value) => setSteps(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label>CFG Scale: {cfgScale}</Label>
                <Slider
                  min={0.1}
                  max={20}
                  step={0.1}
                  value={[cfgScale]}
                  onValueChange={(value) => setCfgScale(value[0])}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seed (0 for random)</Label>
                <Input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  min={-999999999}
                  max={999999999}
                />
              </div>

              <div className="space-y-2">
                <Label>Variants: {variants}</Label>
                <Slider
                  min={1}
                  max={4}
                  value={[variants]}
                  onValueChange={(value) => setVariants(value[0])}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webp">WebP</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lora Strength: {loraStrength}%</Label>
                <Slider
                  min={0}
                  max={100}
                  value={[loraStrength]}
                  onValueChange={(value) => setLoraStrength(value[0])}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="safe-mode"
                  checked={safeMode}
                  onCheckedChange={(checked) => setSafeMode(checked as boolean)}
                />
                <Label htmlFor="safe-mode">Safe Mode</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hide-watermark"
                  checked={hideWatermark}
                  onCheckedChange={(checked) => setHideWatermark(checked as boolean)}
                />
                <Label htmlFor="hide-watermark">Hide Watermark</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="embed-metadata"
                  checked={embedExifMetadata}
                  onCheckedChange={(checked) => setEmbedExifMetadata(checked as boolean)}
                />
                <Label htmlFor="embed-metadata">Embed Metadata</Label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Images</CardTitle>
          <CardDescription>Your generated images will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          {images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <img 
                    src={`data:image/${format};base64,${image}`} 
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Generated images will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageGenerator;