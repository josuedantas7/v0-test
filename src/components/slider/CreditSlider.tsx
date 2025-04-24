"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Enum para os estilos dos segmentos
enum SegmentStyle {
  NoOffers = "nooffers",
  Uncertain = "uncertain",
  Approval = "approval",
  HighChance = "highchance",
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
  [SegmentStyle.NoOffers]: "#C8C8C8",
  [SegmentStyle.Uncertain]: "#949494",
  [SegmentStyle.Approval]: "#5A646E",
  [SegmentStyle.HighChance]: "#0F0F0F", 
};

const segments: Segment[] = [
  {
    id: "1",
    minValue: 0,
    maxValue: 1999.99,
    blocked: true,
    style: SegmentStyle.NoOffers,
  },
  {
    id: "2",
    minValue: 2000,
    maxValue: 3999.99,
    blocked: false,
    style: SegmentStyle.Uncertain,
  },
  {
    id: "3",
    minValue: 4000,
    maxValue: 5999.99,
    blocked: false,
    style: SegmentStyle.Approval,
  },
  {
    id: "4",
    minValue: 6000,
    maxValue: 10123.21,
    blocked: false,
    style: SegmentStyle.HighChance,
  },
];

// Valor do trade-in (carro)
const tradeInValue: number = 3000;

export default function CreditSlider() {
  const [sliderValue, setSliderValue] = useState<number>(4000);
  const [currentSegment, setCurrentSegment] = useState<Segment | null>(null);

  const blockedSegments = segments.find(
    (segment) => segment.blocked
  ) as Segment;

  const firstSegmentAvailable = segments.find(
    (segment) => !segment.blocked
  ) as Segment;

  const sliderRef = useRef<HTMLDivElement>(null);
  const minValue = 0;
  const maxValue =
    segments.length > 0 ? Math.max(...segments.map((s) => s.maxValue)) : 6000;

  // Definir altura do segmento
  const segmentHeight = 10; // altura em pixels
  const tradeInSegmentHeight = 15; // altura do segmento de trade-in (um pouco maior)

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
    const rawValue = minValue + percentage * (maxValue - minValue);

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
      const rawValue = minValue + percentage * (maxValue - minValue)
      

      // Limitar o valor para não ficar abaixo do trade-in
      const value = Math.max(rawValue, tradeInValue);

      // Verificar se o valor está no segmento bloqueado
      const isAboveBlockedSegment = blockedSegments
        ? value < blockedSegments.maxValue
        : false;

      if (isAboveBlockedSegment) {
        setSliderValue(firstSegmentAvailable.minValue);
      } else {
        setSliderValue(value);
      }
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

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardContent>
          <div className="flex flex-col space-y-6">
            {/* Current value display */}
            <div className="text-center">
              <div className="text-3xl font-bold">
                {formatCurrency(sliderValue)}
              </div>
            </div>

            <div className="mt-8 mb-4 relative">
              {sortedSegments.map((segment, index) => {
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
                    height: `${segmentHeight * 2}px`,
                    width: `${segmentHeight * 2}px`,
                    top: `-${segmentHeight / 2}px`,
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
