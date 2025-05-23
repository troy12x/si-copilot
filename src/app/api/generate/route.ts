import { NextRequest, NextResponse } from 'next/server';
import { generateDataset, DatasetConfig } from '@/lib/api-clients';

export async function POST(request: NextRequest) {
  try {
    const config: DatasetConfig = await request.json();
    
    if (!config.useCase || !config.model || !config.template) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Ensure splits are properly configured
    if (!config.splits || config.splits.length === 0) {
      // Default to train split if none provided
      config.splits = [{ name: 'train', percentage: 100 }];
    } else {
      // Validate that percentages sum to 100
      const totalPercentage = config.splits.reduce((sum, split) => sum + split.percentage, 0);
      if (totalPercentage !== 100) {
        // Normalize percentages to sum to 100
        const factor = 100 / totalPercentage;
        config.splits = config.splits.map(split => ({
          ...split,
          percentage: Math.round(split.percentage * factor)
        }));
      }
    }

    const dataset = await generateDataset(config);
    
    return NextResponse.json({ dataset });
  } catch (error: any) {
    console.error('Error generating dataset:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate dataset' },
      { status: 500 }
    );
  }
}
