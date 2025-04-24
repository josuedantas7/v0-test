"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Enum para os estilos dos segmentos
enum SegmentStyle {
  REJECTED = "rejected",
  PENDING = "pending",
  APPROVED = "approved",
}

// Interface para os segmentos
interface Segment {
  id: string;
  minValue: number;
  maxValue: number;
  blocked: boolean;
  style: SegmentStyle;
}

// Mapeamento de estilos para cores
const styleColorMap = {
  [SegmentStyle.REJECTED]: "#FF5733", // Vermelho para recusado
  [SegmentStyle.PENDING]: "#FFC300", // Amarelo para chance de aprovação
  [SegmentStyle.APPROVED]: "#33CC5A", // Verde para aprovado
};

// Mapeamento de estilos para nomes em português
const styleNameMap = {
  [SegmentStyle.REJECTED]: "Recusado",
  [SegmentStyle.PENDING]: "Em análise",
  [SegmentStyle.APPROVED]: "Aprovado",
};

export default function CreditSlider() {
  // Valor do trade-in (carro)
  const [tradeInValue, setTradeInValue] = useState<number>(3000);

  const [segments, setSegments] = useState<Segment[]>([
    {
      id: "1",
      minValue: 0,
      maxValue: 2000,
      blocked: true,
      style: SegmentStyle.REJECTED,
    },
    {
      id: "2",
      minValue: 2000,
      maxValue: 4000,
      blocked: false,
      style: SegmentStyle.PENDING,
    },
    {
      id: "3",
      minValue: 4000,
      maxValue: 6000,
      blocked: false,
      style: SegmentStyle.APPROVED,
    },
  ]);

  const [newMinValue, setNewMinValue] = useState<number>(0);
  const [newMaxValue, setNewMaxValue] = useState<number>(2000);
  const [newBlocked, setNewBlocked] = useState<boolean>(false);
  const [newStyle, setNewStyle] = useState<SegmentStyle>(SegmentStyle.PENDING);

  const [sliderValue, setSliderValue] = useState<number>(4000);
  const [currentSegment, setCurrentSegment] = useState<Segment | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const minValue = 0;
  const maxValue =
    segments.length > 0 ? Math.max(...segments.map((s) => s.maxValue)) : 6000;

  // Definir altura do segmento
  const segmentHeight = 15; // altura em pixels
  const tradeInSegmentHeight = 30; // altura do segmento de trade-in (um pouco maior)

  // Limitar o valor do slider ao valor mínimo do trade-in
  useEffect(() => {
    if (sliderValue < tradeInValue) {
      setSliderValue(tradeInValue);
    }
  }, [tradeInValue]);

  // Encontrar o segmento atual com base no valor do slider
  useEffect(() => {
    const current =
      segments.find(
        (segment) =>
          sliderValue >= segment.minValue && sliderValue <= segment.maxValue
      ) || null;
    setCurrentSegment(current);
  }, [sliderValue, segments]);

  const addSegment = () => {
    // Verificar se o novo segmento se sobrepõe a segmentos existentes
    const overlapping = segments.some(
      (segment) =>
        (newMinValue >= segment.minValue && newMinValue <= segment.maxValue) ||
        (newMaxValue >= segment.minValue && newMaxValue <= segment.maxValue) ||
        (newMinValue <= segment.minValue && newMaxValue >= segment.maxValue)
    );

    if (overlapping) {
      alert(
        "O novo segmento se sobrepõe a segmentos existentes. Ajuste os valores."
      );
      return;
    }

    if (newMinValue >= newMaxValue) {
      alert("O valor mínimo deve ser menor que o valor máximo.");
      return;
    }

    const newSegment: Segment = {
      id: Date.now().toString(),
      minValue: newMinValue,
      maxValue: newMaxValue,
      blocked: newBlocked,
      style: newStyle,
    };

    setSegments(
      [...segments, newSegment].sort((a, b) => a.minValue - b.minValue)
    );
    setNewMinValue(newMaxValue);
    setNewMaxValue(newMaxValue + 1000);
    setNewBlocked(false);
    setNewStyle(SegmentStyle.PENDING);
  };

  const removeSegment = (id: string) => {
    setSegments(segments.filter((segment) => segment.id !== id));
  };

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Função para calcular a posição percentual no slider
  const calculatePosition = (value: number) => {
    return ((value - minValue) / (maxValue - minValue)) * 100;
  };

  // Função para lidar com o clique no slider
  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    const rawValue = Math.round(minValue + percentage * (maxValue - minValue));

    // Limitar o valor para não ficar abaixo do trade-in
    const value = Math.max(rawValue, tradeInValue);

    setSliderValue(value);
  };

  // Função para lidar com o arrasto do marcador
  const handleMarkerDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const startDrag = (e: MouseEvent) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const percentage = Math.min(Math.max(clickPosition / rect.width, 0), 1);
      const rawValue = Math.round(
        minValue + percentage * (maxValue - minValue)
      );

      // Limitar o valor para não ficar abaixo do trade-in
      const value = Math.max(rawValue, tradeInValue);

      setSliderValue(value);
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", startDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", startDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  // Ordenar segmentos por valor mínimo
  const sortedSegments = [...segments].sort((a, b) => a.minValue - b.minValue);

  // Calcular o valor disponível (valor do slider - trade-in)
  const availableValue = sliderValue - tradeInValue;

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Régua de Crédito Interativa</CardTitle>
          <CardDescription>
            Deslize o marcador para visualizar diferentes faixas de crédito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-6">
            {/* Current value display */}
            <div className="text-center">
              <div className="text-3xl font-bold">
                {formatCurrency(sliderValue)}
              </div>
              {currentSegment && (
                <div
                  className="mt-2 px-3 py-1 rounded-full inline-block text-white"
                  style={{
                    backgroundColor: styleColorMap[currentSegment.style],
                    backgroundImage: currentSegment.blocked
                      ? `repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.5) 5px, rgba(255,255,255,0.5) 10px)`
                      : "none",
                  }}
                >
                  {styleNameMap[currentSegment.style]}
                  {currentSegment.blocked ? " (Bloqueado)" : ""}
                </div>
              )}

              {/* Trade-in value display */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                  <Car className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">
                    Trade-in: {formatCurrency(tradeInValue)}
                  </span>
                </div>
                <span className="font-bold">+</span>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                  Disponível: {formatCurrency(availableValue)}
                </div>
              </div>
            </div>

            {/* Interactive slider */}
            <div className="mt-8 mb-4 relative">
              {/* Lollipop pins at segment boundaries - now positioned above the slider */}
              {sortedSegments.map((segment, index) => {
                // Não adicionar pino no último segmento
                if (index === sortedSegments.length - 1) return null;

                return (
                  <div
                    key={`pin-${segment.id}`}
                    style={{
                      left: `${calculatePosition(segment.maxValue)}%`,
                      bottom: `${segmentHeight}px`, // Posicionado acima do slider
                    }}
                    className="absolute transform -translate-x-1/2 pointer-events-none"
                  >
                    {/* Lollipop design */}
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: styleColorMap[segment.style],
                          }}
                        ></div>
                      </div>
                      <div className="w-0.5 h-4 bg-gray-300"></div>
                    </div>
                  </div>
                );
              })}

              <div
                ref={sliderRef}
                className="w-full rounded-lg overflow-visible relative cursor-pointer"
                onClick={handleSliderClick}
                style={{ height: `${segmentHeight}px` }}
              >
                {/* Regular segments */}
                <div className="w-full h-full flex absolute">
                  {sortedSegments.map((segment) => {
                    const leftPosition = calculatePosition(segment.minValue);
                    const width =
                      calculatePosition(segment.maxValue) - leftPosition;

                    return (
                      <div
                        key={segment.id}
                        style={{
                          left: `${leftPosition}%`,
                          width: `${width}%`,
                          backgroundColor: styleColorMap[segment.style],
                          backgroundImage: segment.blocked
                            ? `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 6px)`
                            : "none",
                          height: `${segmentHeight}px`,
                        }}
                        className="absolute flex items-center justify-center text-white"
                      />
                    );
                  })}
                </div>

                {/* Trade-in segment (with opacity, positioned from 0 to trade-in value) */}
                {Boolean(tradeInValue) && (
                  <div
                    style={{
                      left: `0%`,
                      width: `${calculatePosition(tradeInValue)}%`,
                      height: `${tradeInSegmentHeight}px`,
                      top: `${-(tradeInSegmentHeight - segmentHeight) / 2}px`, // Centralizar verticalmente
                      backgroundColor: "rgba(0, 102, 204, 0.3)", // Azul com opacidade
                      borderRadius: "4px",
                      border: "1px dashed rgba(0, 102, 204, 0.7)",
                      zIndex: 15, // Acima dos segmentos regulares, mas abaixo do marcador
                    }}
                    className="absolute flex items-center justify-center"
                  ></div>
                )}

                {/* Slider marker (circle) - same height as segments and filled */}
                <div
                  style={{
                    left: `${calculatePosition(sliderValue)}%`,
                    height: `${segmentHeight}px`,
                    width: `${segmentHeight}px`,
                    top: 0,
                    backgroundColor: currentSegment
                      ? styleColorMap[currentSegment.style]
                      : "#888888",
                    zIndex: 20, // Acima de tudo
                  }}
                  className="absolute -translate-x-1/2 rounded-full cursor-grab active:cursor-grabbing shadow-md border border-white"
                  onMouseDown={handleMarkerDrag}
                />
              </div>
            </div>

            {/* Value labels */}
            <div className="w-full flex justify-between text-sm text-gray-500 -mt-2">
              <span>{formatCurrency(minValue)}</span>
              <span>{formatCurrency(maxValue)}</span>
            </div>

            {/* Trade-in value controls */}
            <div className="grid gap-4 pt-4 border-t">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Car className="h-5 w-5" />
                Valor do Trade-in (Carro)
              </h3>
              <div className="space-y-2">
                <Label htmlFor="tradeInValue">Valor do Carro</Label>
                <Input
                  id="tradeInValue"
                  type="number"
                  min="0"
                  max={maxValue}
                  step="100"
                  value={tradeInValue}
                  onChange={(e) => setTradeInValue(Number(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Este valor define o limite mínimo a partir do qual o marcador
                  pode ser movido.
                </p>
              </div>
            </div>

            {/* Segment list */}
            <div className="space-y-4 mt-2 pt-4 border-t">
              <h3 className="text-lg font-medium">Segmentos da Régua</h3>
              <div className="grid gap-4">
                {sortedSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="flex items-center gap-4 p-3 border rounded-md"
                  >
                    <div
                      className="w-8 h-8 rounded-md"
                      style={{
                        backgroundColor: styleColorMap[segment.style],
                        backgroundImage: segment.blocked
                          ? `repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.5) 5px, rgba(255,255,255,0.5) 10px)`
                          : "none",
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {formatCurrency(segment.minValue)} -{" "}
                        {formatCurrency(segment.maxValue)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Status: {styleNameMap[segment.style]}
                        {segment.blocked ? " (Bloqueado)" : ""}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeSegment(segment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add new segment form */}
            <div className="grid gap-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Adicionar Novo Segmento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minValue">Valor Mínimo</Label>
                  <Input
                    id="minValue"
                    type="number"
                    min="0"
                    step="100"
                    value={newMinValue}
                    onChange={(e) => setNewMinValue(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxValue">Valor Máximo</Label>
                  <Input
                    id="maxValue"
                    type="number"
                    min="0"
                    step="100"
                    value={newMaxValue}
                    onChange={(e) => setNewMaxValue(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="style">Status</Label>
                  <Select
                    value={newStyle}
                    onValueChange={(value) =>
                      setNewStyle(value as SegmentStyle)
                    }
                  >
                    <SelectTrigger id="style">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SegmentStyle.REJECTED}>
                        Recusado
                      </SelectItem>
                      <SelectItem value={SegmentStyle.PENDING}>
                        Em análise
                      </SelectItem>
                      <SelectItem value={SegmentStyle.APPROVED}>
                        Aprovado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 h-full pt-8">
                  <Switch
                    id="blocked"
                    checked={newBlocked}
                    onCheckedChange={setNewBlocked}
                  />
                  <Label htmlFor="blocked">
                    Segmento bloqueado (tracejado)
                  </Label>
                </div>
              </div>

              <Button onClick={addSegment} className="w-full mt-2">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Segmento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
