import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SalesChart = ({ data }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sales Over Time
        </Typography>
        <Box sx={{ height: 300 }}>
          {/* ResponsiveContainer makes the chart adapt to the size of its parent container. */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip
                formatter={(value) => [`$${value.toFixed(2)}`, "Sales"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
