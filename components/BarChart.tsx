import { View, Text } from "react-native";
import React from "react";
import clsx from "clsx";

interface ChartDataPoint {
  day: string;
  value: number;
  active: boolean;
}

interface BarChartProps {
  data: ChartDataPoint[];
}

const BarChart = ({ data }: BarChartProps) => {
  // Max value for scaling
  const maxValue = 45;
  const gridLines = [45, 35, 25, 5, 0];

  return (
    <View className="chart-card">
      {/* Chart container with aspect ratio for responsiveness */}
      <View className="h-48 flex-row pb-6 pt-8 pr-2">
        {/* Y-axis labels and grid lines */}
        <View className="absolute inset-0 pb-6 pt-8 right-2 justify-between">
          {gridLines.map((val, index) => (
            <View
              key={index}
              className="flex-row items-center w-full"
            >
              <Text className="w-6 text-[10px] font-sans-semibold text-primary/70">
                {val}
              </Text>
              <View className="flex-1 h-px border-b border-dashed border-border ml-2" />
            </View>
          ))}
        </View>

        {/* Bars Container */}
        <View className="flex-1 flex-row justify-between items-end ml-8 relative">
          {data.map((item, index) => {
            // Calculate height percentage relative to max value
            // The grid covers from 0 to 45
            const heightPercent = `${(item.value / maxValue) * 100}%` as any;

            return (
              <View key={index} className="items-center relative">
                {/* Tooltip for active item */}
                {item.active && (
                  <View className="absolute -top-8 bg-background rounded-md px-2 py-1 shadow-sm border border-border z-10">
                    <Text className="text-xs font-sans-bold text-accent">
                      ₹{item.value}
                    </Text>
                  </View>
                )}
                
                {/* Bar */}
                <View className="h-full justify-end w-3">
                  <View
                    className={clsx(
                      "w-full rounded-full",
                      item.active ? "bg-accent" : "bg-primary"
                    )}
                    style={{ height: heightPercent }}
                  />
                </View>

                {/* X-axis label absolutely positioned below the bar */}
                <Text className="absolute -bottom-6 text-[10px] font-sans-semibold text-primary/70">
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default BarChart;
