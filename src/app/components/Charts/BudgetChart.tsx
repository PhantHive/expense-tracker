import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { ResponsiveBar } from '@nivo/bar';
import { BudgetChartData } from '../../types';
import { CHART_MARGINS } from '../../constants';

const ChartContainer = styled(Box)({
    height: 350,
    width: '100%',
    '& > div': {
        width: '100% !important',
        height: '100% !important',
    },
});

interface BudgetChartProps {
    data: BudgetChartData[];
    title: string;
}

const BudgetChart: React.FC<BudgetChartProps> = ({ data, title }) => {
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
                {title}
            </Typography>
            <ChartContainer>
                {data.length > 0 ? (
                    <ResponsiveBar
                        data={data}
                        keys={['budget', 'spent', 'remaining']}
                        indexBy="month"
                        margin={CHART_MARGINS.budget}
                        padding={0.3}
                        valueScale={{ type: 'linear' }}
                        indexScale={{
                            type: 'band',
                            round: true,
                        }}
                        colors={['#4CAF50', '#FF6B6B', '#64B5F6']} // Green for budget, red for spent, blue for remaining
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
                            legendOffset: -50,
                        }}
                        label={(d) => `$${d.value?.toFixed(0)}`}
                        labelSkipWidth={15}
                        labelSkipHeight={12}
                        labelTextColor={{
                            from: 'color',
                            modifiers: [['darker', 1.6]],
                        }}
                        legends={[
                            {
                                dataFrom: 'keys',
                                anchor: 'bottom-right',
                                direction: 'column',
                                justify: false,
                                translateX: 120,
                                translateY: 0,
                                itemsSpacing: 2,
                                itemWidth: 100,
                                itemHeight: 20,
                                itemDirection: 'left-to-right',
                                itemOpacity: 0.85,
                                symbolSize: 20,
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemOpacity: 1,
                                        },
                                    },
                                ],
                            },
                        ]}
                        role="application"
                        ariaLabel="Budget vs spending comparison chart"
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
                                    {indexValue} - {id}: ${value?.toFixed(2)}
                                </strong>
                            </div>
                        )}
                        groupMode="grouped"
                    />
                ) : (
                    <Typography
                        align="center"
                        color="textSecondary"
                        sx={{ mt: 10 }}
                    >
                        No budget data available
                    </Typography>
                )}
            </ChartContainer>
        </Box>
    );
};

export default BudgetChart;