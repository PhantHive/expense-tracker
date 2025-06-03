import React from 'react';
import { Box, Typography, TextField, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/system';
import { ResponsivePie } from '@nivo/pie';
import { ChartData } from '../../types';
import { CHART_MARGINS } from '../../constants';

const ChartContainer = styled(Box)({
    height: 300,
    width: '100%',
    '& > div': {
        width: '100% !important',
        height: '100% !important',
    },
});

interface PieChartProps {
    data: ChartData[];
    title: string;
    categoryFilter: string;
    setCategoryFilter: (filter: string) => void;
    categories: string[];
}

const PieChart: React.FC<PieChartProps> = ({
                                               data,
                                               title,
                                               categoryFilter,
                                               setCategoryFilter,
                                               categories,
                                           }) => {
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom align="center">
                {title}
            </Typography>
            <ChartContainer>
                {data.length > 0 ? (
                    <ResponsivePie
                        data={data}
                        margin={CHART_MARGINS.pie}
                        innerRadius={0.5}
                        padAngle={0.7}
                        cornerRadius={3}
                        colors={{ scheme: 'nivo' }}
                        borderWidth={1}
                        borderColor={{
                            from: 'color',
                            modifiers: [['darker', 0.2]],
                        }}
                        arcLabelsSkipAngle={10}
                        arcLabelsTextColor="#333333"
                        arcLabel={(d) => `$${d.value.toFixed(2)}`}
                        arcLinkLabelsSkipAngle={10}
                        arcLinkLabelsTextColor="#333333"
                        arcLinkLabelsThickness={2}
                        arcLinkLabelsColor={{ from: 'color' }}
                        legends={[
                            {
                                anchor: 'bottom',
                                direction: 'row',
                                justify: false,
                                translateX: 0,
                                translateY: 56,
                                itemsSpacing: 0,
                                itemWidth: 100,
                                itemHeight: 18,
                                itemTextColor: '#999',
                                itemDirection: 'left-to-right',
                                itemOpacity: 1,
                                symbolSize: 18,
                                symbolShape: 'circle',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemTextColor: '#000'
                                        }
                                    }
                                ]
                            }
                        ]}
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

            {/* Filter Controls */}
            <Box sx={{ mt: 2 }}>
                <TextField
                    label="Filter by Category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    displayEmpty
                    fullWidth
                    sx={{ mb: 2 }}
                >
                    <MenuItem value="">
                        <em>All Categories</em>
                    </MenuItem>
                    {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                            {category}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
        </Box>
    );
};

export default PieChart;