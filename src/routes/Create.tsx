import { useState } from "react";
import { z } from "zod";

import { DEFAULT_VARIANT, resizeBoard } from "@/lib/chess";
import Chessboard from "@/components/Chessboard";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const configSchema = z.object({
  name: z.string().default("New Variant"),
  description: z.string().optional(),
  width: z.number().min(1).max(25),
  height: z.number().min(1).max(25),
});

const configType = {
  name: "text",
  description: "textarea",
  width: "number",
  height: "number",
};

const Create = () => {
  const [config, setConfig] = useState({
    name: "New Variant",
    description: "",
    width: 8,
    height: 8,
  });
  const [configErrors, setConfigErrors] = useState({});
  const [variant, setVariant] = useState(DEFAULT_VARIANT);console.log(variant)

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = configType[name] === "number" ? parseInt(value) : value;
  
    setConfig((prevConfig) => ({
      ...prevConfig,
      [name]: newValue,
    }));
  };

  const updateBoard = () => {
    const newVariant = resizeBoard(variant, config.width, config.height);
    setVariant(newVariant);
  };

  const validateConfig = () => {
    try {
      configSchema.parse(config);
      setConfigErrors({});
      updateBoard();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = {};
        error.issues.forEach((issue) => {
          formattedErrors[issue.path[0]] = issue.message;
        });
        setConfigErrors(formattedErrors);
      }
    }
  };

  return (
    <div className="flex flex-row divide-x p-8">
      <div className="flex flex-col flex-none gap-8 w-[300px] pr-8">
        <h3>Game Configuration</h3>
        <div className="flex flex-col gap-5">
          <Label className="flex flex-col gap-2">
            Variant Name
            <Input
              type="text"
              name="name"
              placeholder="New Variant"
              value={config.name}
              onChange={handleInputChange}
            />
            {configErrors.name && <p className="text-destructive">{configErrors.name}</p>}
          </Label>
          <Label className="flex flex-col gap-2">
            Description
            <Textarea
              name="description"
              value={config.description}
              onChange={handleInputChange}
            />
            {configErrors.description && <p className="text-destructive">{configErrors.description}</p>}
          </Label>
          <div className="flex flex-row gap-4">
            <Label className="flex flex-col gap-2 w-full">
              Width (Files)
              <Input
                type="number"
                name="width"
                value={config.width}
                min={1}
                max={25}
                onChange={handleInputChange}
              />
              {configErrors.width && <p className="text-destructive">{configErrors.width}</p>}
            </Label>
            <Label className="flex flex-col gap-2 w-full">
              Height (Ranks)
              <Input
                type="number"
                name="height"
                min={1}
                max={25}
                value={config.height}
                onChange={handleInputChange}
              />
              {configErrors.height && <p className="text-destructive">{configErrors.height}</p>}
            </Label>
          </div>
        </div>
        <Button onClick={validateConfig}>Apply</Button>
      </div>

      <div className="flex flex-col gap-4 w-full px-8">
        <h3>Board Setup</h3>
        <Chessboard variant={variant} />
      </div>

      <div className="flex flex-col gap-8 flex-none w-[400px] pl-8">
        <h3>Pieces</h3>
        {variant.pieces.forEach((piece) => {
          return (
            <Card>

            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Create;
