import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { ResponsiveBar } from '@nivo/bar';
import { MonthlyBarChartData } from '../../types';
import { CHART_MARGINS } from '../../constants';

const ChartContainer = styled(Box)({
    height: 300,
    width: '100%',
    '& > div': {
        width: '100% !important',
        height: '100% !important',
    },
});

interface BarChartProps {
    data: MonthlyBarChartData[];
    title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
                {title}
            </Typography>
            <ChartContainer>
                {data.length > 0 ? (
                    <ResponsiveBar
                        data={data}
                        keys={['value']}
                        indexBy="month"
                        margin={CHART_MARGINS.bar}
                        padding={0.3}
                        valueScale={{ type: 'linear' }}
                        indexScale={{
                            type: 'band',
                            round: true,
                        }}
                        colors={{ scheme: 'nivo' }}
                        borderColor={{
                            from: 'color',
                            modifiers: [['darker', 1.6]],
                        }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: -45,
                            legend: 'Month',
                            legendPosition: 'middle',
                            legendOffset: 60,
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Amount ($)',
                            legendPosition: 'middle',
                            legendOffset: -40,
                        }}
                        label={(d) => `$${d.value?.toFixed(2)}`}
                        labelSkipWidth={12}
                        labelSkipHeight={12}
                        labelTextColor={{
                            from: 'color',
                            modifiers: [['darker', 1.6]],
                        }}
                        role="application"
                        ariaLabel="Monthly expenses bar chart"
                        tooltip={({ id, value, color, indexValue }) => (
                            <div
                                style={{
                                    background: 'white',
                                    padding: '9px 12px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                            >
                                <strong style={{ color }}>
                                    {indexValue}: ${value?.toFixed(2)}
                                </strong>
                            </div>
                        )}
                    />
                ) : (
                    <Typography
                        align="center"
                        color="textSecondary"
                        sx={{ mt: 10 }}
                    >
                        No data available
                    </Typography>
                )}
            </ChartContainer>
        </Box>
    );
};

export default BarChart;