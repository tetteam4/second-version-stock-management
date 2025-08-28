
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const UserRegistrationsChart = ({ data }) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    New User Registrations
                </Typography>
                <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
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
                            <YAxis allowDecimals={false} />
                            <Tooltip formatter={(value) => [value, 'New Users']} />
                            <Legend />
                            <Bar dataKey="users" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};

export default UserRegistrationsChart;